import { PrismaClient, Loan } from '@prisma/client'
import { BaseRepository } from './BaseRepository'

export class LoanRepository extends BaseRepository<Loan> {
    constructor(prisma: PrismaClient) {
        super(prisma)
    }

    async findById(id: number): Promise<Loan | null> {
        return this.prisma.loan.findUnique({
            where: { id },
        })
    }

    async findAll(): Promise<Loan[]> {
        return this.prisma.loan.findMany()
    }

    async create(data: Partial<Loan>): Promise<Loan> {
        return this.prisma.loan.create({
            data: data as any,
        })
    }

    async update(id: number, data: Partial<Loan>): Promise<Loan> {
        return this.prisma.loan.update({
            where: { id },
            data: data as any,
        })
    }

    async delete(id: number): Promise<Loan> {
        return this.prisma.loan.delete({
            where: { id },
        })
    }

    async findByIdWithRelations(id: number): Promise<any> {
        return this.prisma.loan.findUnique({
            where: { id },
            include: {
                bank: true,
                currency: true,
            },
        })
    }

    async findByUserId(userId: number): Promise<any[]> {
        return this.prisma.loan.findMany({
            where: { userId },
            include: {
                bank: true,
                currency: true,
            },
            orderBy: { createdAt: 'desc' },
        })
    }

    async findActiveByUserId(userId: number): Promise<any[]> {
        return this.prisma.loan.findMany({
            where: { userId, isActive: true },
            include: {
                bank: true,
                currency: true,
            },
            orderBy: { createdAt: 'desc' },
        })
    }

    async decrementRemainingInstallments(id: number): Promise<Loan> {
        const loan = await this.prisma.loan.findUnique({ where: { id } })
        if (!loan) {throw new Error('Loan not found')}

        const newRemaining = Math.max(0, loan.remainingInstallments - 1)

        return this.prisma.loan.update({
            where: { id },
            data: {
                remainingInstallments: newRemaining,
                isActive: newRemaining > 0
            },
        })
    }

    async incrementRemainingInstallments(id: number): Promise<Loan> {
        const loan = await this.prisma.loan.findUnique({ where: { id } })
        if (!loan) {throw new Error('Loan not found')}

        return this.prisma.loan.update({
            where: { id },
            data: {
                remainingInstallments: loan.remainingInstallments + 1,
                isActive: true
            },
        })
    }
}
