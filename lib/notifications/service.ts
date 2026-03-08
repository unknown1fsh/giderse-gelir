import type { PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { getBudgetSummary } from '@/lib/finance/budgets'
import { normalizeNotificationPreferences } from '@/lib/user-preferences'
import { sendNotificationEmail } from './email'
import { sendWebPushNotification } from './web-push'

type NotificationEvent = {
  type: string
  title: string
  body: string
  priority?: string
  href?: string
  dedupeBaseKey: string
  sourceEntityType?: string
  sourceEntityId?: string
  payload?: Record<string, unknown>
}

type UserNotificationProfile = {
  id: number
  name: string | null
  email: string
  notifications: ReturnType<typeof normalizeNotificationPreferences>
}

function getNextDueDate(dueDay: number) {
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), dueDay)
  if (thisMonth >= now) {
    return thisMonth
  }

  return new Date(now.getFullYear(), now.getMonth() + 1, dueDay)
}

function differenceInDays(date: Date) {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

async function createNotificationRecord(
  prisma: PrismaClient,
  userId: number,
  channel: 'in_app' | 'email' | 'push',
  event: NotificationEvent,
  status: 'pending' | 'sent' | 'failed' = 'pending'
) {
  const dedupeKey = `${event.dedupeBaseKey}:${channel}`
  const existing = await prisma.notification.findFirst({
    where: { dedupeKey },
  })

  if (existing) {
    return existing
  }

  return prisma.notification.create({
    data: {
      userId,
      type: event.type,
      channel,
      title: event.title,
      body: event.body,
      status,
      priority: event.priority || 'normal',
      dedupeKey,
      payload: {
        ...(event.payload || {}),
        href: event.href || null,
      },
      sourceEntityType: event.sourceEntityType,
      sourceEntityId: event.sourceEntityId,
      deliveredAt: status === 'sent' ? new Date() : null,
    },
  })
}

async function markNotificationStatus(
  prisma: PrismaClient,
  id: number,
  status: 'sent' | 'failed'
) {
  await prisma.notification.update({
    where: { id },
    data: {
      status,
      deliveredAt: status === 'sent' ? new Date() : null,
    },
  })
}

async function dispatchNotificationEvent(
  prisma: PrismaClient,
  user: UserNotificationProfile,
  event: NotificationEvent
) {
  await createNotificationRecord(prisma, user.id, 'in_app', event, 'sent')

  if (user.notifications.emailNotifications) {
    const emailRecord = await createNotificationRecord(prisma, user.id, 'email', event)
    const emailResult = await sendNotificationEmail(user.email, user.name || 'Kullanici', {
      subject: event.title,
      title: event.title,
      body: event.body,
      ctaLabel: 'Detayi Gor',
      ctaUrl: event.href,
    })

    await markNotificationStatus(prisma, emailRecord.id, emailResult.success ? 'sent' : 'failed')
  }

  if (user.notifications.pushNotifications) {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: user.id,
        active: true,
      },
    })

    if (subscriptions.length > 0) {
      const pushRecord = await createNotificationRecord(prisma, user.id, 'push', event)
      const results = await Promise.all(
        subscriptions.map(subscription =>
          sendWebPushNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dhKey,
                auth: subscription.authKey,
              },
            },
            {
              title: event.title,
              body: event.body,
              url: event.href,
              tag: event.type,
            }
          )
        )
      )

      const sent = results.some(result => result.success)
      await markNotificationStatus(prisma, pushRecord.id, sent ? 'sent' : 'failed')
    }
  }
}

async function getUserNotificationProfile(prisma: PrismaClient, userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      notifications: true,
    },
  })

  if (!user) {
    return null
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    notifications: normalizeNotificationPreferences(user.notifications),
  } satisfies UserNotificationProfile
}

export async function syncNotificationEvents(
  prisma: PrismaClient,
  {
    userId,
    activePeriodId,
  }: {
    userId: number
    activePeriodId?: number | null
  }
) {
  const user = await getUserNotificationProfile(prisma, userId)
  if (!user) {
    return
  }

  const reminderOffsets = user.notifications.reminderDaysBefore.length
    ? user.notifications.reminderDaysBefore
    : [7, 3, 1]

  const [budgetSummary, autoPayments, cards, goals] = await Promise.all([
    getBudgetSummary(prisma, {
      userId,
      activePeriodId,
      periodType: 'monthly',
    }),
    prisma.autoPayment.findMany({
      where: {
        userId,
        active: true,
      },
      include: {
        category: true,
      },
    }),
    prisma.creditCard.findMany({
      where: {
        userId,
        active: true,
        ...(activePeriodId ? { periodId: activePeriodId } : {}),
      },
      include: {
        bank: true,
      },
    }),
    prisma.goal.findMany({
      where: {
        userId,
        status: 'active',
      },
      include: {
        currency: true,
      },
    }),
  ])

  if (user.notifications.budgetAlerts && budgetSummary.planId) {
    const flaggedItems = budgetSummary.items.filter(
      item => item.isOverBudget || item.progress >= item.alertThreshold
    )

    for (const item of flaggedItems) {
      const alertType = item.isOverBudget ? 'budget_overrun' : 'budget_threshold'
      const dedupeBaseKey = `budget-${budgetSummary.planId}-${item.categoryId}-${alertType}-${budgetSummary.startDate.slice(0, 10)}`
      const triggeredAlert = await prisma.budgetAlert.findFirst({
        where: {
          budgetPlanId: budgetSummary.planId,
          userId,
          type: alertType,
          categoryId: item.categoryId,
          triggeredAt: {
            gte: new Date(budgetSummary.startDate),
            lte: new Date(budgetSummary.endDate),
          },
        },
      })

      if (!triggeredAlert) {
        await prisma.budgetAlert.create({
          data: {
            budgetPlanId: budgetSummary.planId,
            userId,
            categoryId: item.categoryId,
            type: alertType,
            thresholdPercent: new Prisma.Decimal(item.alertThreshold.toFixed(2)),
            actualAmount: new Prisma.Decimal(item.spent.toFixed(2)),
            budgetAmount: new Prisma.Decimal(item.budgeted.toFixed(2)),
            metadata: {
              progress: item.progress,
            },
          },
        })
      }

      await dispatchNotificationEvent(prisma, user, {
        type: alertType,
        title: item.isOverBudget
          ? `${item.categoryName} butcesi asildi`
          : `${item.categoryName} butcesi esige yaklasti`,
        body: item.isOverBudget
          ? `${item.categoryName} kategorisinde planlanan butceyi astiniz.`
          : `${item.categoryName} kategorisinde harcama orani %${item.progress.toFixed(0)} seviyesine geldi.`,
        href: '/budgets',
        dedupeBaseKey,
        sourceEntityType: 'budget',
        sourceEntityId: String(item.categoryId),
        payload: {
          categoryId: item.categoryId,
          progress: item.progress,
          spent: item.spent,
          budgeted: item.budgeted,
        },
      })
    }
  }

  if (user.notifications.paymentReminders) {
    for (const autoPayment of autoPayments) {
      if (!autoPayment.nextPaymentDate) {
        continue
      }

      const daysLeft = differenceInDays(autoPayment.nextPaymentDate)
      if (!reminderOffsets.includes(daysLeft)) {
        continue
      }

      await dispatchNotificationEvent(prisma, user, {
        type: 'bill_reminder',
        title: `${autoPayment.name} yaklasiyor`,
        body: `${autoPayment.category.name} kategorisindeki odeme ${daysLeft} gun sonra gerceklesecek.`,
        href: '/auto-payments',
        dedupeBaseKey: `autopayment-${autoPayment.id}-${daysLeft}-${autoPayment.nextPaymentDate.toISOString().slice(0, 10)}`,
        sourceEntityType: 'auto_payment',
        sourceEntityId: String(autoPayment.id),
        payload: {
          autoPaymentId: autoPayment.id,
          nextPaymentDate: autoPayment.nextPaymentDate.toISOString(),
          daysLeft,
        },
      })
    }
  }

  if (user.notifications.creditCardDueAlerts) {
    for (const card of cards) {
      const nextDueDate = getNextDueDate(card.dueDay)
      const daysLeft = differenceInDays(nextDueDate)

      if (!reminderOffsets.includes(daysLeft)) {
        continue
      }

      await dispatchNotificationEvent(prisma, user, {
        type: 'credit_card_due',
        title: `${card.name} son odeme tarihi yaklasiyor`,
        body: `${card.bank.name} kartinizin son odeme tarihi ${daysLeft} gun sonra.`,
        href: '/cards',
        dedupeBaseKey: `card-${card.id}-${daysLeft}-${nextDueDate.toISOString().slice(0, 10)}`,
        sourceEntityType: 'credit_card',
        sourceEntityId: String(card.id),
        payload: {
          cardId: card.id,
          dueDate: nextDueDate.toISOString(),
          daysLeft,
        },
      })
    }
  }

  if (user.notifications.goalMilestones) {
    for (const goal of goals) {
      const targetAmount = Number(goal.targetAmount)
      const currentAmount = Number(goal.currentAmount)
      const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0
      const milestone = progress >= 100 ? 100 : progress >= 75 ? 75 : progress >= 50 ? 50 : null

      if (!milestone) {
        continue
      }

      await dispatchNotificationEvent(prisma, user, {
        type: 'goal_milestone',
        title: `${goal.name} hedefinde %${milestone} seviyesine geldiniz`,
        body:
          milestone === 100
            ? `${goal.name} hedefine ulastiniz. Tebrikler.`
            : `${goal.name} hedefi icin bir sonraki esige emin adimlarla yaklasiyorsunuz.`,
        href: '/goals',
        dedupeBaseKey: `goal-${goal.id}-milestone-${milestone}`,
        sourceEntityType: 'goal',
        sourceEntityId: String(goal.id),
        payload: {
          goalId: goal.id,
          milestone,
          progress,
        },
      })
    }
  }
}
