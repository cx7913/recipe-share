import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterDto } from './register.dto';

describe('RegisterDto 유효성 검사', () => {
  const VALID_PASSWORD = 'Password123!';

  const createDto = (data: Partial<RegisterDto>): RegisterDto => {
    return plainToInstance(RegisterDto, data);
  };

  const getErrorMessages = (errors: any[], property: string): string[] => {
    return errors
      .filter(e => e.property === property)
      .flatMap(e => Object.values(e.constraints || {})) as string[];
  };

  describe('이메일 검증', () => {
    it('유효한 이메일이면 에러가 없어야 한다', async () => {
      const dto = createDto({
        email: 'test@example.com',
        password: VALID_PASSWORD,
        name: '홍길동',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('이메일이 비어있으면 에러가 발생해야 한다', async () => {
      const dto = createDto({
        email: '',
        password: VALID_PASSWORD,
        name: '홍길동',
      });

      const errors = await validate(dto);
      const messages = getErrorMessages(errors, 'email');
      expect(messages.length).toBeGreaterThan(0);
    });

    it('이메일 형식이 올바르지 않으면 에러가 발생해야 한다', async () => {
      const dto = createDto({
        email: 'invalid-email',
        password: VALID_PASSWORD,
        name: '홍길동',
      });

      const errors = await validate(dto);
      const messages = getErrorMessages(errors, 'email');
      expect(messages.some(msg => msg.includes('올바른 이메일 형식'))).toBe(true);
    });

    it('@ 없는 이메일은 에러가 발생해야 한다', async () => {
      const dto = createDto({
        email: 'testexample.com',
        password: VALID_PASSWORD,
        name: '홍길동',
      });

      const errors = await validate(dto);
      const messages = getErrorMessages(errors, 'email');
      expect(messages.length).toBeGreaterThan(0);
    });
  });

  describe('비밀번호 검증', () => {
    describe('길이 검증', () => {
      it('유효한 비밀번호면 에러가 없어야 한다', async () => {
        const dto = createDto({
          email: 'test@example.com',
          password: 'Abcd1234!',
          name: '홍길동',
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });

      it('8자 미만이면 에러가 발생해야 한다', async () => {
        const dto = createDto({
          email: 'test@example.com',
          password: 'Ab1!',
          name: '홍길동',
        });

        const errors = await validate(dto);
        const messages = getErrorMessages(errors, 'password');
        expect(messages.some(msg => msg.includes('8자'))).toBe(true);
      });

      it('비어있으면 에러가 발생해야 한다', async () => {
        const dto = createDto({
          email: 'test@example.com',
          password: '',
          name: '홍길동',
        });

        const errors = await validate(dto);
        const messages = getErrorMessages(errors, 'password');
        expect(messages.length).toBeGreaterThan(0);
      });

      it('50자를 초과하면 에러가 발생해야 한다', async () => {
        const dto = createDto({
          email: 'test@example.com',
          password: 'Abcd1234!' + 'a'.repeat(42),
          name: '홍길동',
        });

        const errors = await validate(dto);
        const messages = getErrorMessages(errors, 'password');
        expect(messages.length).toBeGreaterThan(0);
      });
    });

    describe('강도 검증', () => {
      it('대문자가 없으면 에러가 발생해야 한다', async () => {
        const dto = createDto({
          email: 'test@example.com',
          password: 'password123!',
          name: '홍길동',
        });

        const errors = await validate(dto);
        const messages = getErrorMessages(errors, 'password');
        expect(messages.some(msg => msg.includes('대문자'))).toBe(true);
      });

      it('소문자가 없으면 에러가 발생해야 한다', async () => {
        const dto = createDto({
          email: 'test@example.com',
          password: 'PASSWORD123!',
          name: '홍길동',
        });

        const errors = await validate(dto);
        const messages = getErrorMessages(errors, 'password');
        expect(messages.some(msg => msg.includes('소문자'))).toBe(true);
      });

      it('숫자가 없으면 에러가 발생해야 한다', async () => {
        const dto = createDto({
          email: 'test@example.com',
          password: 'Passwordabc!',
          name: '홍길동',
        });

        const errors = await validate(dto);
        const messages = getErrorMessages(errors, 'password');
        expect(messages.some(msg => msg.includes('숫자'))).toBe(true);
      });

      it('특수문자가 없으면 에러가 발생해야 한다', async () => {
        const dto = createDto({
          email: 'test@example.com',
          password: 'Password123',
          name: '홍길동',
        });

        const errors = await validate(dto);
        const messages = getErrorMessages(errors, 'password');
        expect(messages.some(msg => msg.includes('특수문자'))).toBe(true);
      });

      it('모든 조건을 만족하면 에러가 없어야 한다', async () => {
        const dto = createDto({
          email: 'test@example.com',
          password: 'Password123!',
          name: '홍길동',
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      });
    });
  });

  describe('이름 검증', () => {
    it('2자 이상이면 에러가 없어야 한다', async () => {
      const dto = createDto({
        email: 'test@example.com',
        password: VALID_PASSWORD,
        name: '홍길',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('2자 미만이면 에러가 발생해야 한다', async () => {
      const dto = createDto({
        email: 'test@example.com',
        password: VALID_PASSWORD,
        name: '홍',
      });

      const errors = await validate(dto);
      const messages = getErrorMessages(errors, 'name');
      expect(messages.some(msg => msg.includes('최소 2자'))).toBe(true);
    });

    it('비어있으면 에러가 발생해야 한다', async () => {
      const dto = createDto({
        email: 'test@example.com',
        password: VALID_PASSWORD,
        name: '',
      });

      const errors = await validate(dto);
      const messages = getErrorMessages(errors, 'name');
      expect(messages.length).toBeGreaterThan(0);
    });
  });

  describe('복합 검증', () => {
    it('모든 필드가 유효하면 에러가 없어야 한다', async () => {
      const dto = createDto({
        email: 'valid@example.com',
        password: 'SecurePass123!',
        name: '홍길동',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('여러 필드가 유효하지 않으면 여러 에러가 발생해야 한다', async () => {
      const dto = createDto({
        email: 'invalid',
        password: '123',
        name: 'a',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(3);
    });
  });
});
