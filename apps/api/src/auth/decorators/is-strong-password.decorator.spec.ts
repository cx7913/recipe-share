import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { IsStrongPassword } from './is-strong-password.decorator';

class TestDto {
  @IsStrongPassword()
  password: string;
}

class CustomOptionsDto {
  @IsStrongPassword({
    minLength: 6,
    requireSpecialChar: false,
  })
  password: string;
}

describe('IsStrongPassword 데코레이터', () => {
  const createDto = <T extends object>(cls: new () => T, data: Partial<T>): T => {
    return plainToInstance(cls, data);
  };

  describe('기본 옵션', () => {
    it('유효한 비밀번호는 통과해야 한다', async () => {
      const dto = createDto(TestDto, { password: 'Password123!' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('8자 미만은 실패해야 한다', async () => {
      const dto = createDto(TestDto, { password: 'Pass1!' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('대문자 없으면 실패해야 한다', async () => {
      const dto = createDto(TestDto, { password: 'password123!' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('소문자 없으면 실패해야 한다', async () => {
      const dto = createDto(TestDto, { password: 'PASSWORD123!' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('숫자 없으면 실패해야 한다', async () => {
      const dto = createDto(TestDto, { password: 'Passwordabc!' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('특수문자 없으면 실패해야 한다', async () => {
      const dto = createDto(TestDto, { password: 'Password123' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('50자 초과하면 실패해야 한다', async () => {
      const dto = createDto(TestDto, { password: 'Password1!' + 'a'.repeat(41) });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('커스텀 옵션', () => {
    it('minLength를 6으로 설정하면 6자 이상이 통과해야 한다', async () => {
      const dto = createDto(CustomOptionsDto, { password: 'Pass12' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('특수문자 비활성화 시 특수문자 없어도 통과해야 한다', async () => {
      const dto = createDto(CustomOptionsDto, { password: 'Password123' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('에러 메시지', () => {
    it('적절한 에러 메시지를 반환해야 한다', async () => {
      const dto = createDto(TestDto, { password: 'short' });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const message = Object.values(errors[0].constraints || {})[0];
      expect(message).toContain('8자');
    });
  });
});
