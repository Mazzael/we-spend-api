import { CouplesRepository } from '@/domain/application/repositories/couples-repository'
import { Couple } from '@/domain/entities/couple'

export class InMemoryCouplesRepository implements CouplesRepository {
  public items: Couple[] = []

  async findById(id: string): Promise<Couple | null> {
    const couple = this.items.find((item) => item.id.toString() === id)

    if (!couple) {
      return null
    }

    return couple
  }

  async findByName(name: string): Promise<Couple | null> {
    const couple = this.items.find((item) => item.name === name)

    if (!couple) {
      return null
    }

    return couple
  }

  async create(couple: Couple): Promise<void> {
    this.items.push(couple)
  }

  async save(couple: Couple): Promise<void> {
    const index = this.items.findIndex((item) => item.id.equals(couple.id))
    if (index >= 0) {
      this.items[index] = couple
    }
  }

  async delete(couple: Couple): Promise<void> {
    this.items = this.items.filter((item) => !item.id.equals(couple.id))
  }
}
