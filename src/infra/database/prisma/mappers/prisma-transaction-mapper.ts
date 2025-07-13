import { UniqueEntityID } from '@/core/unique-entity-id'
import { Transaction } from '@/domain/entities/transaction'
import {
  Transaction as PrismaTransaction,
  TransactionPayer,
} from '@prisma/client'

type PrismaTransactionWithPayers = PrismaTransaction & {
  payers: TransactionPayer[]
}

export class PrismaTransactionMapper {
  static async toDomain(
    raw: PrismaTransactionWithPayers,
  ): Promise<Transaction> {
    return Transaction.create(
      {
        coupleId: new UniqueEntityID(raw.coupleId),
        description: raw.description,
        amountInCents: raw.amountInCents,
        category: raw.category,
        type: raw.type === 'EXPENSE' ? 'expense' : 'income',
        paidBy: raw.payers.map((payer) => {
          return {
            userId: new UniqueEntityID(payer.userId),
            amountInCents: payer.amountInCents,
          }
        }),
        date: raw.date,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(transaction: Transaction): PrismaTransaction {
    return {
      id: transaction.id.toString(),
      coupleId: transaction.coupleId.toString(),
      description: transaction.description,
      amountInCents: transaction.amountInCents,
      category: transaction.category,
      type: transaction.type === 'expense' ? 'EXPENSE' : 'INCOME',
      date: transaction.date,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt ?? new Date(),
    }
  }
}
