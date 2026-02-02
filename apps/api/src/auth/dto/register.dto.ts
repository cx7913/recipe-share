import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from '../decorators/is-strong-password.decorator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: '비밀번호는 8자 이상, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.',
  })
  @IsString()
  @IsStrongPassword()
  password: string;

  @ApiProperty({ example: '홍길동' })
  @IsString()
  @MinLength(2, { message: '이름은 최소 2자 이상이어야 합니다.' })
  @MaxLength(50)
  name: string;
}
