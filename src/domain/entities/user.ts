import { Optional } from '@/core/types/optional'
import { Entity } from './base-entity'
import { UniqueEntityID } from '@/core/unique-entity-id'

export interface UserProps {
  coupleId?: UniqueEntityID | null
  name: string
  email: string
  password: string
  createdAt: Date
  updatedAt?: Date | null
}

export class User extends Entity<UserProps> {
  get coupleId() {
    return this.props.coupleId
  }

  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email
  }

  get password() {
    return this.props.password
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  changePassword(newPassword: string) {
    this.props.password = newPassword
    this.touch()
  }

  enterOnCouple(coupleId: UniqueEntityID) {
    this.props.coupleId = coupleId
    this.touch()
  }

  static create(props: Optional<UserProps, 'createdAt'>, id?: UniqueEntityID) {
    const user = new User(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )

    return user
  }
}
