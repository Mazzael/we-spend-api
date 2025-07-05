import { Transaction } from '@/domain/entities/transaction'

export abstract class TransactionsRepository {
  abstract findById(id: string): Promise<Transaction | null>
  abstract create(transaction: Transaction): Promise<void>
  abstract save(transaction: Transaction): Promise<void>
  abstract delete(transaction: Transaction): Promise<void>

  abstract findManyByCoupleId(coupleId: string): Promise<Transaction[]>

  abstract findManyByDateRange(
    coupleId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Transaction[]>

  abstract findManyByUserId(userId: string): Promise<Transaction[]>
}
