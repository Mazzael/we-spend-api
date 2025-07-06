import { InMemoryCouplesRepository } from 'test/repositories/in-memory-couples-repository'
import { makeCouple } from 'test/factories/make-couple'
import { InMemoryTransactionsRepository } from 'test/repositories/in-memory-transactions-repository'
import { CreateTransactionUseCase } from './create-transaction'
import { InvalidTransactionError } from './errors/invalid-transaction-error'

describe('Create Transaction', () => {
  let inMemoryCouplesRepository: InMemoryCouplesRepository
  let inMemoryTransactionsRepository: InMemoryTransactionsRepository

  let sut: CreateTransactionUseCase

  beforeEach(() => {
    inMemoryCouplesRepository = new InMemoryCouplesRepository()
    inMemoryTransactionsRepository = new InMemoryTransactionsRepository()

    sut = new CreateTransactionUseCase(
      inMemoryCouplesRepository,
      inMemoryTransactionsRepository,
    )
  })

  it('should create a transaction with only one payer', async () => {
    const couple = makeCouple({})

    await inMemoryCouplesRepository.create(couple)

    const result = await sut.execute({
      coupleId: couple.id.toString(),
      description: 'Dinner at the restaurant',
      amountInCents: 5000,
      type: 'expense',
      category: 'food',
      date: new Date(),
      paidBy: [
        {
          userId: couple.members[0].toString(),
          amountInCents: 5000,
        },
      ],
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.transaction).toBeDefined()
      expect(result.value.transaction.description).toBe(
        'Dinner at the restaurant',
      )
      expect(result.value.transaction.amountInCents).toBe(5000)
      expect(result.value.transaction.type).toBe('expense')
      expect(result.value.transaction.category).toBe('food')
      expect(result.value.transaction.date).toBeInstanceOf(Date)
      expect(result.value.transaction.paidBy).toHaveLength(1)
      expect(result.value.transaction.paidBy[0].userId.toString()).toBe(
        couple.members[0].toString(),
      )
      expect(result.value.transaction.paidBy[0].amountInCents).toBe(5000)
      expect(result.value.transaction.isTotalPaidValid()).toBe(true)
      expect(result.value.transaction.coupleId.toString()).toBe(
        couple.id.toString(),
      )
    }
  })

  it('should create a transaction with two payers', async () => {
    const couple = makeCouple({})

    await inMemoryCouplesRepository.create(couple)

    const result = await sut.execute({
      coupleId: couple.id.toString(),
      description: 'Dinner at the restaurant',
      amountInCents: 5000,
      type: 'expense',
      category: 'food',
      date: new Date(),
      paidBy: [
        {
          userId: couple.members[0].toString(),
          amountInCents: 3500,
        },
        {
          userId: couple.members[1].toString(),
          amountInCents: 1500,
        },
      ],
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.transaction).toBeDefined()
      expect(result.value.transaction.description).toBe(
        'Dinner at the restaurant',
      )
      expect(result.value.transaction.amountInCents).toBe(5000)
      expect(result.value.transaction.type).toBe('expense')
      expect(result.value.transaction.category).toBe('food')
      expect(result.value.transaction.date).toBeInstanceOf(Date)
      expect(result.value.transaction.paidBy).toHaveLength(2)
      expect(result.value.transaction.paidBy[0].userId.toString()).toBe(
        couple.members[0].toString(),
      )
      expect(result.value.transaction.paidBy[0].amountInCents).toBe(3500)
      expect(result.value.transaction.paidBy[1].userId.toString()).toBe(
        couple.members[1].toString(),
      )
      expect(result.value.transaction.paidBy[1].amountInCents).toBe(1500)
      expect(result.value.transaction.isTotalPaidValid()).toBe(true)
      expect(result.value.transaction.coupleId.toString()).toBe(
        couple.id.toString(),
      )
    }
  })

  it('should not be able to register an user out of the couple as a payer', async () => {
    const couple = makeCouple({})

    await inMemoryCouplesRepository.create(couple)

    const result = await sut.execute({
      coupleId: couple.id.toString(),
      description: 'Dinner at the restaurant',
      amountInCents: 5000,
      type: 'expense',
      category: 'food',
      date: new Date(),
      paidBy: [
        {
          userId: couple.members[0].toString(),
          amountInCents: 2000,
        },
        {
          userId: 'another-user',
          amountInCents: 3000,
        },
      ],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidTransactionError)
  })

  it('should not create a transaction with invalid amount', async () => {
    const couple = makeCouple({})

    await inMemoryCouplesRepository.create(couple)

    const result = await sut.execute({
      coupleId: couple.id.toString(),
      description: 'Dinner at the restaurant',
      amountInCents: 5000,
      type: 'expense',
      category: 'food',
      date: new Date(),
      paidBy: [
        {
          userId: couple.members[0].toString(),
          amountInCents: 2000,
        },
        {
          userId: couple.members[1].toString(),
          amountInCents: 2000,
        },
      ],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidTransactionError)
  })
})
