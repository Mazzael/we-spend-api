import { Optional } from '@/core/types/optional'
import { Entity } from './base-entity'
import { UniqueEntityID } from '@/core/unique-entity-id'

interface Payer {
  userId: UniqueEntityID
  amountInCents: number
}

export interface TransactionProps {
  description: string
  amountInCents: number
  type: 'income' | 'expense'
  date: Date
  category: string
  paidBy: Payer[]
  coupleId: UniqueEntityID
  createdAt: Date
  updatedAt?: Date | null
}

export class Transaction extends Entity<TransactionProps> {
  get description() {
    return this.props.description
  }

  get amountInCents() {
    return this.props.amountInCents
  }

  get type() {
    return this.props.type
  }

  get date() {
    return this.props.date
  }

  get category() {
    return this.props.category
  }

  get paidBy() {
    return this.props.paidBy
  }

  get coupleId() {
    return this.props.coupleId
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  updateAmount(newAmountInCents: number) {
    this.props.amountInCents = newAmountInCents
    this.touch()
  }

  updateDescription(newDescription: string) {
    this.props.description = newDescription
    this.touch()
  }

  isTotalPaidValid() {
    const totalPaid = this.props.paidBy.reduce(
      (sum, payer) => sum + payer.amountInCents,
      0,
    )

    if (totalPaid !== this.props.amountInCents) {
      return false
    }

    return true
  }

  getAmountPaidBy(userId: UniqueEntityID): number {
    const user = this.props.paidBy.find((payer) => payer.userId.equals(userId))

    if (!user) {
      return 0
    }

    return (
      this.props.paidBy.find((payer) => payer.userId.equals(userId))
        ?.amountInCents ?? 0
    )
  }

  static create(
    props: Optional<TransactionProps, 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    const transaction = new Transaction(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )

    return transaction
  }
}
