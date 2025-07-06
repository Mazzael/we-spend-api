import { Transaction } from '@/domain/entities/transaction'
import { TransactionsRepository } from '@/domain/application/repositories/transactions-repository'

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

  async findManyByCoupleId(coupleId: string): Promise<Transaction[]> {
    return this.items.filter((item) => item.coupleId.toString() === coupleId)
  }

  async findManyByDateRange(
    coupleId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Transaction[]> {
    return this.items.filter(
      (item) =>
        item.coupleId.toString() === coupleId &&
        item.date >= startDate &&
        item.date <= endDate,
    )
  }

  async findManyByUserId(userId: string): Promise<Transaction[]> {
    return this.items.filter((item) =>
      item.paidBy.some((payer) => payer.userId.toString() === userId),
    )
  }
}
