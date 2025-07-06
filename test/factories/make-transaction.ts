import { UniqueEntityID } from '@/core/unique-entity-id'
import { TransactionProps, Transaction } from '@/domain/entities/transaction'
import { faker } from '@faker-js/faker'

export function makeTransaction(
  override: Partial<TransactionProps> = {},
  id?: UniqueEntityID,
) {
  const transaction = Transaction.create(
    {
      coupleId: new UniqueEntityID(faker.string.uuid()),
      description: faker.lorem.sentence(),
      amountInCents: faker.number.int({ min: 100, max: 100000 }),
      type: faker.helpers.arrayElement(['income', 'expense']),
      category: faker.helpers.arrayElement([
        'food',
        'transport',
        'entertainment',
        'bills',
        'health',
        'other',
      ]),
      date: faker.date.past(),
      paidBy: [
        {
          userId: new UniqueEntityID(faker.string.uuid()),
          amountInCents: faker.number.int({ min: 100, max: 100000 }),
        },
        {
          userId: new UniqueEntityID(faker.string.uuid()),
          amountInCents: faker.number.int({ min: 100, max: 100000 }),
        },
      ],
      createdAt: new Date(),
      updatedAt: null,
      ...override,
    },
    id,
  )

  return transaction
}
