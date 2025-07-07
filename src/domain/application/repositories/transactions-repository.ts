import { Transaction } from '@/domain/entities/transaction'
import { FetchTransactionFilters } from './filters/fetch-transactions-filters'

export abstract class TransactionsRepository {
  abstract findById(id: string): Promise<Transaction | null>
  abstract create(transaction: Transaction): Promise<void>
  abstract save(transaction: Transaction): Promise<void>
  abstract delete(transaction: Transaction): Promise<void>

  abstract findManyByCoupleId(
    coupleId: string,
    filters: FetchTransactionFilters,
  ): Promise<Transaction[]>
}
