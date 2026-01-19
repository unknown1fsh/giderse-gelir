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
        if (!loan) return null
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
        const createData = LoanMapper.dtoToPrismaCreate(data, data.userId)
        const loan = await this.prisma.loan.create({
            data: createData as any,
            include: { bank: true, currency: true }
        })
        return LoanMapper.prismaToDTO(loan)
    }

    async update(id: number, data: Partial<CreateLoanDTO>): Promise<LoanDTO> {
        const updateData: Prisma.LoanUpdateInput = {}

        if (data.name) updateData.name = data.name
        if (data.bankId) updateData.bank = { connect: { id: data.bankId } }
        if (data.loanType) updateData.loanType = data.loanType
        if (data.totalAmount) updateData.totalAmount = new Prisma.Decimal(data.totalAmount)
        if (data.installmentCount) updateData.installmentCount = data.installmentCount
        if (data.remainingInstallments !== undefined) updateData.remainingInstallments = data.remainingInstallments
        if (data.interestRate !== undefined) updateData.interestRate = data.interestRate ? new Prisma.Decimal(data.interestRate) : null
        if (data.paymentDay) updateData.paymentDay = data.paymentDay
        if (data.currencyId) updateData.currency = { connect: { id: data.currencyId } }
        if (data.startDate) updateData.startDate = data.startDate
        if (data.description) updateData.description = data.description

        const loan = await this.prisma.loan.update({
            where: { id },
            data: updateData,
            include: { bank: true, currency: true }
        })

        return LoanMapper.prismaToDTO(loan)
    }

    async delete(id: number): Promise<LoanDTO> {
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
}
