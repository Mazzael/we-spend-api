import { InMemoryCouplesRepository } from 'test/repositories/in-memory-couples-repository'
import { CoupleAlreadyExistsError } from './errors/couple-already-exists-error'
import { CreateCoupleUseCase } from './create-couple'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { makeUser } from 'test/factories/make-user'
import { ResourceNotFoundError } from './errors/resource-not-found'
import { makeCouple } from 'test/factories/make-couple'

describe('Create Couple', () => {
  let inMemoryCouplesRepository: InMemoryCouplesRepository
  let inMemoryUsersRepository: InMemoryUsersRepository

  let sut: CreateCoupleUseCase

  beforeEach(() => {
    inMemoryCouplesRepository = new InMemoryCouplesRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository()

    sut = new CreateCoupleUseCase(
      inMemoryCouplesRepository,
      inMemoryUsersRepository,
    )
  })

  it('should create a couple', async () => {
    const user = makeUser({})

    await inMemoryUsersRepository.create(user)

    const result = await sut.execute({
      name: 'Cute couple',
      userId: user.id.toString(),
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.couple.name).toBe('Cute couple')
      expect(result.value.couple.members[0].equals(user.id)).toBe(true)
      expect(inMemoryCouplesRepository.items).toHaveLength(1)
    }
  })

  it('should not create a couple with same name', async () => {
    const user = makeUser({})

    await inMemoryUsersRepository.create(user)

    const couple = makeCouple({
      name: 'Couple test',
      members: [user.id],
    })

    await inMemoryCouplesRepository.create(couple)

    const result = await sut.execute({
      name: 'Couple test',
      userId: user.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(CoupleAlreadyExistsError)
  })

  it('should not create a couple if user doesnt exist', async () => {
    const result = await sut.execute({
      name: 'Couple test',
      userId: 'random',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
