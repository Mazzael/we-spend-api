import { UseCaseError } from '@/core/errors/use-case-error'

export class UserAlreadyInCoupleError extends Error implements UseCaseError {
  constructor() {
    super('This user is already member of a couple.')
  }
}
