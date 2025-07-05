import { UseCaseError } from '@/core/errors/use-case-error'

export class CoupleAlreadyExistsError extends Error implements UseCaseError {
  constructor(identifier: string) {
    super(`Couple "${identifier}" already exists.`)
  }
}
