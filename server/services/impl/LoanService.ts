import { PrismaClient, Prisma } from '@prisma/client'
import { BaseService } from '../BaseService'
import { LoanRepository } from '../../repositories/LoanRepository'
import { LoanMapper } from '../../mappers/LoanMapper'
import { LoanDTO, CreateLoanDTO } from '../../dto/LoanDTO'

export class LoanService extends BaseService<LoanDTO> {
    private prisma: PrismaClient
    private loanRepository: LoanRepository

    constructor(prisma: PrismaClient) {
        super()
        this.prisma = prisma
        this.loanRepository = new LoanRepository(prisma)
    }

    async findById(id: number): Promise<LoanDTO | null> {
        const loan = await this.loanRepository.findByIdWithRelations(id)
        if (!loan) {return null}
        return LoanMapper.prismaToDTO(loan)
    }

    async findAll(): Promise<LoanDTO[]> {
        const loans = await this.prisma.loan.findMany({
            include: { bank: true, currency: true },
            orderBy: { createdAt: 'desc' }
        })
        return loans.map(loan => LoanMapper.prismaToDTO(loan))
    }

    async findByUserId(userId: number): Promise<LoanDTO[]> {
        const loans = await this.loanRepository.findByUserId(userId)
        return loans.map(loan => LoanMapper.prismaToDTO(loan))
    }

    async findActiveByUserId(userId: number): Promise<LoanDTO[]> {
        const loans = await this.loanRepository.findActiveByUserId(userId)
        return loans.map(loan => LoanMapper.prismaToDTO(loan))
    }

    async create(data: CreateLoanDTO & { userId: number }): Promise<LoanDTO> {
        // Aylık ödeme tutarını hesapla
        const LoanCalculator = (await import('../../utils/LoanCalculator')).LoanCalculator
        const monthlyPayment = LoanCalculator.calculateMonthlyPayment(
            data.totalAmount,
            data.installmentCount,
            data.interestRate || undefined
        )

        // Kurgu kredisi ise nakit hesabından düş
        if (data.isFictional) {
            await this.deductFromCashAccount(data.userId, monthlyPayment, data.currencyId)
        }

        const createData = LoanMapper.dtoToPrismaCreate(
            { ...data, monthlyPayment },
            data.userId
        )

        const loan = await this.prisma.loan.create({
            data: createData as any,
            include: { bank: true, currency: true }
        })

        return LoanMapper.prismaToDTO(loan)
    }

    async update(id: number, data: Partial<CreateLoanDTO>): Promise<LoanDTO> {
        const updateData: Prisma.LoanUpdateInput = {}

        if (data.name) {updateData.name = data.name}
        if (data.bankId) {updateData.bank = { connect: { id: data.bankId } }}
        if (data.loanType) {updateData.loanType = data.loanType}
        if (data.totalAmount) {updateData.totalAmount = new Prisma.Decimal(data.totalAmount)}
        if (data.installmentCount) {updateData.installmentCount = data.installmentCount}
        if (data.remainingInstallments !== undefined) {updateData.remainingInstallments = data.remainingInstallments}
        if (data.interestRate !== undefined) {updateData.interestRate = data.interestRate ? new Prisma.Decimal(data.interestRate) : null}
        if (data.paymentDay) {updateData.paymentDay = data.paymentDay}
        if (data.currencyId) {updateData.currency = { connect: { id: data.currencyId } }}
        if (data.startDate) {updateData.startDate = data.startDate}
        if (data.description) {updateData.description = data.description}

        const loan = await this.prisma.loan.update({
            where: { id },
            data: updateData,
            include: { bank: true, currency: true }
        })

        return LoanMapper.prismaToDTO(loan)
    }

    async delete(id: number): Promise<LoanDTO> {
        // Önce loan'ı al (kurgu kontrolü için)
        const existingLoan = await this.prisma.loan.findUnique({
            where: { id },
            include: { bank: true, currency: true }
        })

        if (!existingLoan) {
            throw new Error(`Loan bulunamadı: ${id}`)
        }

        // Kurgu kredisi ise nakit hesabına geri ekle
        if (existingLoan.isFictional && existingLoan.monthlyPayment) {
            await this.addToCashAccount(
                existingLoan.userId,
                Number(existingLoan.monthlyPayment),
                existingLoan.currencyId
            )
        }

        const loan = await this.prisma.loan.delete({
            where: { id },
            include: { bank: true, currency: true }
        })

        return LoanMapper.prismaToDTO(loan)
    }

    async processPayment(loanId: number): Promise<void> {
        await this.loanRepository.decrementRemainingInstallments(loanId)
    }

    async reversePayment(loanId: number): Promise<void> {
        await this.loanRepository.incrementRemainingInstallments(loanId)
    }

    /**
     * Kurgu kredisi için nakit hesabından aylık ödeme tutarını düşer
     */
    private async deductFromCashAccount(userId: number, amount: number, currencyId: number): Promise<void> {
        const cashAccount = await this.findOrCreateCashAccount(userId, currencyId)

        const newBalance = cashAccount.balance.sub(amount)

        await this.prisma.account.update({
            where: { id: cashAccount.id },
            data: { balance: newBalance }
        })
    }

    /**
     * Kurgu kredisi silindiğinde nakit hesabına geri ekler
     */
    private async addToCashAccount(userId: number, amount: number, currencyId: number): Promise<void> {
        const cashAccount = await this.findOrCreateCashAccount(userId, currencyId)

        const newBalance = cashAccount.balance.add(amount)

        await this.prisma.account.update({
            where: { id: cashAccount.id },
            data: { balance: newBalance }
        })
    }

    /**
     * Kullanıcının nakit hesabını bulur veya oluşturur
     */
    private async findOrCreateCashAccount(userId: number, currencyId: number) {
        // Önce mevcut nakit hesabını ara
        let cashAccount = await this.prisma.account.findFirst({
            where: {
                userId,
                currencyId,
                name: 'Nakit',
                active: true
            }
        })

        if (cashAccount) {
            return cashAccount
        }

        // Yoksa oluştur
        // Nakit bankasını bul veya oluştur
        let cashBank = await this.prisma.refBank.findFirst({
            where: { name: 'Nakit' }
        })

        if (!cashBank) {
            cashBank = await this.prisma.refBank.create({
                data: {
                    name: 'Nakit',
                    asciiName: 'Nakit',
                    active: true
                }
            })
        }

        // Vadesiz hesap tipini bul
        const accountType = await this.prisma.refAccountType.findFirst({
            where: { code: 'VADESIZ' }
        })

        if (!accountType) {
            throw new Error('Vadesiz hesap tipi bulunamadı')
        }

        // Nakit hesabı oluştur
        cashAccount = await this.prisma.account.create({
            data: {
                userId,
                name: 'Nakit',
                bankId: cashBank.id,
                accountTypeId: accountType.id,
                currencyId,
                balance: 0,
                active: true
            }
        })

        return cashAccount
    }
}
