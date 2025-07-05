import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { CreateUserUseCase } from './create-user'

describe('CreateUserUseCase (integration)', () => {
  let usersRepository: InMemoryUsersRepository
  let hashGenerator: FakeHasher
  let createUserUseCase: CreateUserUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    hashGenerator = new FakeHasher()
    createUserUseCase = new CreateUserUseCase(usersRepository, hashGenerator)
  })

  it('should create a user successfully', async () => {
    const result = await createUserUseCase.execute({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.user.name).toBe('Alice')
      expect(result.value.user.password).toBe('password123-hashed')
      expect(usersRepository.items).toHaveLength(1)
    }
  })

  it('should not create a user if email is already in use', async () => {
    await createUserUseCase.execute({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
    })

    const result = await createUserUseCase.execute({
      name: 'Bob',
      email: 'alice@example.com',
      password: 'anotherpass',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError)
  })
})
