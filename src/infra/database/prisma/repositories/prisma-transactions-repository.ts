import { TransactionsRepository } from '@/domain/application/repositories/transactions-repository'
import { PrismaService } from '../prisma-service'
import { Transaction } from '@/domain/entities/transaction'
import { PrismaTransactionMapper } from '../mappers/prisma-transaction-mapper'
import { FetchTransactionFilters } from '@/domain/application/repositories/filters/fetch-transactions-filters'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PrismaTransactionsRepository implements TransactionsRepository {
  constructor(private prisma: PrismaService) {}

  async create(transaction: Transaction) {
    const data = PrismaTransactionMapper.toPrisma(transaction)

    await this.prisma.transaction.create({
      data,
    })

    const payers = transaction.paidBy

    await Promise.all(
      payers.map(async (payer) => {
        await this.prisma.transactionPayer.create({
          data: {
            amountInCents: payer.amountInCents,
            userId: payer.userId.toString(),
            transactionId: transaction.id.toString(),
          },
        })
      }),
    )
  }

  async findById(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: {
        id,
      },
      include: {
        payers: true,
      },
    })

    if (!transaction) {
      return null
    }

    return PrismaTransactionMapper.toDomain(transaction)
  }

  async findManyByCoupleId(
    coupleId: string,
    {
      category,
      type,
      startDate,
      endDate,
      limit,
      page,
      userId,
    }: FetchTransactionFilters,
  ) {
    const prismaTransactions = await this.prisma.transaction.findMany({
      where: {
        coupleId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        category,
        payers: {
          some: {
            id: userId,
          },
        },
        type:
          type === 'expense'
            ? 'EXPENSE'
            : type === 'income'
              ? 'INCOME'
              : undefined,
      },
      take: limit,
      skip: page * limit,
      include: {
        payers: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    const transactions = await Promise.all(
      prismaTransactions.map(
        async (prismatransaction) =>
          await PrismaTransactionMapper.toDomain(prismatransaction),
      ),
    )

    return transactions
  }

  async save(transaction: Transaction) {
    const data = PrismaTransactionMapper.toPrisma(transaction)

    await this.prisma.transaction.update({
      where: { id: transaction.id.toString() },
      data,
    })
  }

  async delete(transaction: Transaction) {
    await this.prisma.transaction.delete({
      where: { id: transaction.id.toString() },
    })
  }
}
