import { Transaction } from '@/domain/entities/transaction'
import { TransactionsRepository } from '@/domain/application/repositories/transactions-repository'
import { FetchTransactionFilters } from '@/domain/application/repositories/filters/fetch-transactions-filters'

export class InMemoryTransactionsRepository implements TransactionsRepository {
  public items: Transaction[] = []

  async findById(id: string): Promise<Transaction | null> {
    const transaction = this.items.find((item) => item.id.toString() === id)

    if (!transaction) {
      return null
    }

    return transaction
  }

  async create(transaction: Transaction): Promise<void> {
    this.items.push(transaction)
  }

  async save(transaction: Transaction): Promise<void> {
    const index = this.items.findIndex((item) => item.id.equals(transaction.id))
    if (index >= 0) {
      this.items[index] = transaction
    }
  }

  async delete(transaction: Transaction): Promise<void> {
    this.items = this.items.filter((item) => !item.id.equals(transaction.id))
  }

  async findManyByCoupleId(
    coupleId: string,
    {
      category,
      endDate,
      limit,
      page,
      startDate,
      type,
      userId,
    }: FetchTransactionFilters,
  ): Promise<Transaction[]> {
    const filtered = this.items.filter((transaction) => {
      const belongsToCouple = transaction.coupleId.toString() === coupleId

      const matchesCategory = !category || transaction.category === category

      const matchesType = !type || transaction.type === type

      const inDateRange =
        (!startDate || transaction.date >= startDate) &&
        transaction.date <= endDate

      const matchesUser =
        !userId ||
        transaction.paidBy.some((payer) => payer.userId.toString() === userId)

      return (
        belongsToCouple &&
        matchesCategory &&
        matchesType &&
        inDateRange &&
        matchesUser
      )
    })

    const startIndex = page * limit
    return filtered.slice(startIndex, startIndex + limit)
  }

  async findManyByUserId(userId: string): Promise<Transaction[]> {
    return this.items.filter((item) =>
      item.paidBy.some((payer) => payer.userId.toString() === userId),
    )
  }
}
