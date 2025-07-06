import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { CouplesRepository } from '../repositories/couples-repository'
import { Couple } from '@/domain/entities/couple'
import { CoupleAlreadyExistsError } from './errors/couple-already-exists-error'
import { UsersRepository } from '../repositories/users-repository'
import { ResourceNotFoundError } from './errors/resource-not-found'
import { UniqueEntityID } from '@/core/unique-entity-id'

interface CreateCoupleUseCaseRequest {
  userId: string
  name: string
}

type CreateCoupleUseCaseResponse = Either<
  CoupleAlreadyExistsError | ResourceNotFoundError,
  {
    couple: Couple
  }
>

@Injectable()
export class CreateCoupleUseCase {
  constructor(
    private couplesRepository: CouplesRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    userId,
    name,
  }: CreateCoupleUseCaseRequest): Promise<CreateCoupleUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError())
    }

    const coupleWithSamename = await this.couplesRepository.findByName(name)

    if (coupleWithSamename) {
      return left(new CoupleAlreadyExistsError(name))
    }

    const couple = Couple.create({
      name,
      members: [new UniqueEntityID(userId)],
    })

    await this.couplesRepository.create(couple)

    user.enterOnCouple(couple.id)
    await this.usersRepository.save(user)

    return right({ couple })
  }
}
