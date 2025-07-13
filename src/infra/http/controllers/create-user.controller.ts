import {
  Body,
  ConflictException,
  Controller,
  Post,
  UsePipes,
} from '@nestjs/common'
import { z } from 'zod'
import { Public } from '@/infra/auth/public'
import { CreateUserUseCase } from '@/domain/application/use-cases/create-user'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'

const createUserBodySchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
})

type CreateUserBodySchema = z.infer<typeof createUserBodySchema>
@Controller('/users')
@Public()
export class CreateUserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createUserBodySchema))
  async handle(@Body() body: CreateUserBodySchema) {
    const { name, email, password } = body

    const result = await this.createUserUseCase.execute({
      name,
      email,
      password,
    })

    if (result.isLeft()) {
      throw new ConflictException(result.value.message)
    }
  }
}
