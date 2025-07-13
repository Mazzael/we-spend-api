import { UniqueEntityID } from '@/core/unique-entity-id'
import { Couple } from '@/domain/entities/couple'
import { Couple as PrismaCouple } from '@prisma/client'
import { PrismaService } from '../prisma-service'

export class PrismaCoupleMapper {
  static async toDomain(
    raw: PrismaCouple,
    prisma: PrismaService,
  ): Promise<Couple> {
    const members = await prisma.user.findMany({
      where: { coupleId: raw.id },
    })

    return Couple.create(
      {
        name: raw.name,
        members: members.map((member) => new UniqueEntityID(member.id)),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(couple: Couple): PrismaCouple {
    return {
      id: couple.id.toString(),
      name: couple.name,
      createdAt: couple.createdAt,
      updatedAt: couple.updatedAt ?? new Date(),
    }
  }
}
