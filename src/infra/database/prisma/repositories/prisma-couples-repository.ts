import { CouplesRepository } from '@/domain/application/repositories/couples-repository'
import { PrismaService } from '../prisma-service'
import { Couple } from '@/domain/entities/couple'
import { PrismaCoupleMapper } from '../mappers/prisma-couple-mapper'

export class PrismaCouplesRepository implements CouplesRepository {
  constructor(private prisma: PrismaService) {}

  async create(couple: Couple) {
    const data = PrismaCoupleMapper.toPrisma(couple)

    await this.prisma.couple.create({
      data,
    })
  }

  async findById(id: string) {
    const couple = await this.prisma.couple.findUnique({
      where: { id },
    })

    if (!couple) {
      return null
    }

    return PrismaCoupleMapper.toDomain(couple, this.prisma)
  }

  async findByName(name: string) {
    const couple = await this.prisma.couple.findUnique({
      where: { name },
    })

    if (!couple) {
      return null
    }

    return PrismaCoupleMapper.toDomain(couple, this.prisma)
  }

  async save(couple: Couple) {
    const data = PrismaCoupleMapper.toPrisma(couple)

    await this.prisma.couple.update({
      where: { id: couple.id.toString() },
      data,
    })
  }

  async delete(couple: Couple) {
    await this.prisma.couple.delete({
      where: { id: couple.id.toString() },
    })
  }
}
