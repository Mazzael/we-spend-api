import { UsersRepository } from '@/domain/application/repositories/users-repository'
import { PrismaService } from '../prisma-service'
import { PrismaUserMapper } from '../mappers/prisma-user-mapper'
import { User } from '@/domain/entities/user'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaService) {}

  async create(user: User) {
    const data = PrismaUserMapper.toPrisma(user)

    await this.prisma.user.create({
      data,
    })
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return null
    }

    return PrismaUserMapper.toDomain(user)
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return null
    }

    return PrismaUserMapper.toDomain(user)
  }

  async findManyByCoupleId(coupleId: string) {
    const prismaUsers = await this.prisma.user.findMany({
      where: { coupleId },
    })

    const users = await Promise.all(
      prismaUsers.map((prismaUser) => PrismaUserMapper.toDomain(prismaUser)),
    )

    return users
  }

  async save(user: User) {
    const data = PrismaUserMapper.toPrisma(user)

    await this.prisma.user.update({
      where: { id: user.id.toString() },
      data,
    })
  }

  async delete(user: User) {
    await this.prisma.user.delete({
      where: { id: user.id.toString() },
    })
  }
}
