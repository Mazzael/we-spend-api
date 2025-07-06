import { Couple } from '@/domain/entities/couple'

export abstract class CouplesRepository {
  abstract findById(id: string): Promise<Couple | null>
  abstract findByMemberId(memberId: string): Promise<Couple | null>
  abstract findByName(name: string): Promise<Couple | null>
  abstract create(couple: Couple): Promise<void>
  abstract save(couple: Couple): Promise<void>
  abstract delete(couple: Couple): Promise<void>
}
