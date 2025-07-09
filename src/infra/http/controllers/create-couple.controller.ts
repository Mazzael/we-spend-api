import { Body, ConflictException, Controller, Post } from '@nestjs/common'
import { z } from 'zod'
import { CreateCoupleUseCase } from '@/domain/application/use-cases/create-couple'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'

const createCoupleBodySchema = z.object({
  name: z.string(),
})

type CreateCoupleBodySchema = z.infer<typeof createCoupleBodySchema>
@Controller('/couple')
export class CreateCoupleController {
  constructor(private createCoupleUseCase: CreateCoupleUseCase) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(createCoupleBodySchema))
    body: CreateCoupleBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { name } = body

    const userId = user.sub

    const result = await this.createCoupleUseCase.execute({
      userId,
      name,
    })

    if (result.isLeft()) {
      throw new ConflictException(result.value.message)
    }
  }
}
