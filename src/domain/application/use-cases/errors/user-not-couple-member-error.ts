import { UseCaseError } from '@/core/errors/use-case-error'

export class UserNotCoupleMemberError extends Error implements UseCaseError {
  constructor() {
    super('User is not a member of the couple.')
  }
}
