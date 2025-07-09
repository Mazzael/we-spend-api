import { UniqueEntityID } from '@/core/unique-entity-id'
import { CoupleProps, Couple } from '@/domain/entities/couple'
import { PrismaCoupleMapper } from '@/infra/database/prisma/mappers/prisma-couple-mapper'
import { PrismaService } from '@/infra/database/prisma/prisma-service'
import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'

export function makeCouple(
  override: Partial<CoupleProps> = {},
  id?: UniqueEntityID,
) {
  const couple = Couple.create(
    {
      name: faker.person.fullName(),
      members: [
        new UniqueEntityID(faker.string.uuid()),
        new UniqueEntityID(faker.string.uuid()),
      ],
      createdAt: new Date(),
      updatedAt: null,
      ...override,
    },
    id,
  )

  return couple
}

@Injectable()
export class CoupleFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaCouple(data: Partial<CoupleProps> = {}): Promise<Couple> {
    const couple = makeCouple(data)

    const membersId = couple.members.map((id) => id.toString())

    await this.prisma.couple.create({
      data: {
        ...PrismaCoupleMapper.toPrisma(couple),
        User: {
          connect: membersId.map((id) => ({ id })),
        },
      },
    })

    return couple
  }
}
