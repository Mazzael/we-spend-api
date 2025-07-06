import { makeCouple } from 'test/factories/make-couple'
import { InMemoryTransactionsRepository } from 'test/repositories/in-memory-transactions-repository'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { FetchTransactionsUseCase } from './fetch-transactions'
import { makeTransaction } from 'test/factories/make-transaction'
import { makeUser } from 'test/factories/make-user'
import { ResourceNotFoundError } from './errors/resource-not-found'

describe('Fetch Transactions', () => {
  let inMemoryTransactionsRepository: InMemoryTransactionsRepository
  let inMemoryUsersRepository: InMemoryUsersRepository

  let sut: FetchTransactionsUseCase

  beforeEach(() => {
    inMemoryTransactionsRepository = new InMemoryTransactionsRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository()

    sut = new FetchTransactionsUseCase(
      inMemoryTransactionsRepository,
      inMemoryUsersRepository,
    )
  })

  it('should fetch transactions', async () => {
    const couple = makeCouple({})

    const transaction1 = makeTransaction({
      coupleId: couple.id,
    })
    const transaction2 = makeTransaction({
      coupleId: couple.id,
    })
    const transaction3 = makeTransaction({
      coupleId: couple.id,
    })

    await inMemoryTransactionsRepository.create(transaction1)
    await inMemoryTransactionsRepository.create(transaction2)
    await inMemoryTransactionsRepository.create(transaction3)

    const result = await sut.execute({
      coupleId: couple.id.toString(),
      page: 0,
      limit: 3,
      startDate: null,
      endDate: new Date(),
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.transactions).toHaveLength(3)
      expect(result.value.transactions[0].id).toEqual(transaction1.id)
      expect(result.value.transactions[1].id).toEqual(transaction2.id)
      expect(result.value.transactions[2].id).toEqual(transaction3.id)
    }
  })

  it('should fetch transactions by type and category', async () => {
    const couple = makeCouple({})

    const transaction1 = makeTransaction({
      coupleId: couple.id,
      type: 'expense',
      category: 'food',
    })
    const transaction2 = makeTransaction({
      coupleId: couple.id,
      type: 'income',
      category: 'food',
    })
    const transaction3 = makeTransaction({
      coupleId: couple.id,
      type: 'expense',
      category: 'food',
    })
    const transaction4 = makeTransaction({
      coupleId: couple.id,
      type: 'expense',
      category: 'transport',
    })

    await inMemoryTransactionsRepository.create(transaction1)
    await inMemoryTransactionsRepository.create(transaction2)
    await inMemoryTransactionsRepository.create(transaction3)
    await inMemoryTransactionsRepository.create(transaction4)

    const resultType = await sut.execute({
      coupleId: couple.id.toString(),
      page: 0,
      limit: 3,
      type: 'expense',
      startDate: null,
      endDate: new Date(),
    })

    expect(resultType.isRight()).toBe(true)

    if (resultType.isRight()) {
      expect(resultType.value.transactions).toHaveLength(3)
      expect(resultType.value.transactions[0].id).toEqual(transaction1.id)
      expect(resultType.value.transactions[1].id).toEqual(transaction3.id)
      expect(resultType.value.transactions[2].id).toEqual(transaction4.id)
    }

    const resultCategory = await sut.execute({
      coupleId: couple.id.toString(),
      page: 0,
      limit: 3,
      category: 'transport',
      startDate: null,
      endDate: new Date(),
    })

    expect(resultCategory.isRight()).toBe(true)

    if (resultCategory.isRight()) {
      expect(resultCategory.value.transactions).toHaveLength(1)
      expect(resultCategory.value.transactions[0].id).toEqual(transaction4.id)
    }
  })

  it('should not fetch transactions by an userId that isnt in the couple', async () => {
    const userNotInCouple = makeUser({})

    const couple = makeCouple({})

    const transaction1 = makeTransaction({
      coupleId: couple.id,
    })
    const transaction2 = makeTransaction({
      coupleId: couple.id,
    })
    const transaction3 = makeTransaction({
      coupleId: couple.id,
    })

    await inMemoryTransactionsRepository.create(transaction1)
    await inMemoryTransactionsRepository.create(transaction2)
    await inMemoryTransactionsRepository.create(transaction3)

    const result = await sut.execute({
      coupleId: couple.id.toString(),
      page: 0,
      limit: 3,
      userId: userNotInCouple.id.toString(),
      startDate: null,
      endDate: new Date(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
