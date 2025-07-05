import { Optional } from '@/core/types/optional'
import { Entity } from './base-entity'
import { UniqueEntityID } from '@/core/unique-entity-id'

export interface UserProps {
  name: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export class User extends Entity<UserProps> {
  get name(): string {
    return this.props.name
  }

  get email(): string {
    return this.props.email
  }

  get password(): string {
    return this.props.password
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  private touch(): void {
    this.props.updatedAt = new Date()
  }

  changePassword(newPassword: string): void {
    this.props.password = newPassword
    this.touch()
  }

  static create(props: Optional<UserProps, 'createdAt'>, id?: UniqueEntityID) {
    const user = new User(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return user
  }
}
