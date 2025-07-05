import { UsersRepository } from '@/domain/application/repositories/users-repository'
import { User } from '@/domain/entities/user'

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = []

  async findById(id: string): Promise<User | null> {
    const user = this.items.find((item) => item.id.toString() === id)
    return user ?? null
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.items.find((item) => item.email === email)
    return user ?? null
  }

  async findManyByCoupleId(coupleId: string): Promise<User[]> {
    const users = this.items.filter(
      (item) => item.coupleId.toString() === coupleId,
    )
    return users
  }

  async create(user: User): Promise<void> {
    this.items.push(user)
  }

  async save(user: User): Promise<void> {
    const index = this.items.findIndex((item) => item.id.equals(user.id))
    if (index >= 0) {
      this.items[index] = user
    }
  }

  async delete(user: User): Promise<void> {
    this.items = this.items.filter((item) => !item.id.equals(user.id))
  }
}
