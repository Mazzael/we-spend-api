import { UniqueEntityID } from '@/core/unique-entity-id'
import { User } from '@/domain/entities/user'
import { User as PrismaUser } from '@prisma/client'

export class PrismaUserMapper {
  static toDomain(raw: PrismaUser): User {
    return User.create(
      {
        name: raw.name,
        email: raw.email,
        password: raw.password,
        coupleId: raw.coupleId ? new UniqueEntityID(raw.coupleId) : null,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(user: User): PrismaUser {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      password: user.password,
      coupleId: user.coupleId ? user.coupleId.toString() : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt ?? new Date(),
    }
  }
}
