import { Encrypter } from '@/domain/application/cryptography/encrypter'
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class JwtEncrypter implements Encrypter {
  constructor(private jwtService: JwtService) {}

  encrypt(payload: { sub: string }): Promise<string> {
    return this.jwtService.signAsync(payload)
  }
}
