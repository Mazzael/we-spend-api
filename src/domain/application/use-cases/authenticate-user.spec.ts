import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { FakeEncrypter } from 'test/cryptography/fale-encrypter'
import { AuthenticateUserUseCase } from './authenticate-user'
import { makeUser } from 'test/factories/make-user'
import { WrongCredentialsError } from './errors/wrong-credentials-error'

describe('Authenticate User', () => {
  let inMemoryUsersRepository: InMemoryUsersRepository
  let fakeHasher: FakeHasher
  let fakeEncrypter: FakeEncrypter

  let sut: AuthenticateUserUseCase

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    fakeHasher = new FakeHasher()
    fakeEncrypter = new FakeEncrypter()

    sut = new AuthenticateUserUseCase(
      inMemoryUsersRepository,
      fakeHasher,
      fakeEncrypter,
    )
  })

  it('should authenticate a user successfully', async () => {
    const user = makeUser({
      email: 'alice@example.com',
      password: await fakeHasher.hash('password123'),
    })

    await inMemoryUsersRepository.create(user)

    const result = await sut.execute({
      email: 'alice@example.com',
      password: 'password123',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.accessToken).toBeDefined()
    }
  })

  it('should not be able to authenticate with wrong credentials', async () => {
    const user = makeUser({
      email: 'johndoe@example.com',
      password: await fakeHasher.hash('password123'),
    })

    await inMemoryUsersRepository.create(user)

    const resultWithWrongPassword = await sut.execute({
      email: 'johndoe@example.com',
      password: 'wrongpassword',
    })

    expect(resultWithWrongPassword.isLeft()).toBe(true)
    expect(resultWithWrongPassword.value).toBeInstanceOf(WrongCredentialsError)

    const resultWithWrongEmail = await sut.execute({
      email: 'johndoewrong@example.com',
      password: 'password123',
    })

    expect(resultWithWrongEmail.isLeft()).toBe(true)
    expect(resultWithWrongEmail.value).toBeInstanceOf(WrongCredentialsError)
  })
})
