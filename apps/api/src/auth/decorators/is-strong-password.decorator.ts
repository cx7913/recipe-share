import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export interface PasswordStrengthOptions {
  minLength?: number;
  maxLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSpecialChar?: boolean;
}

const DEFAULT_OPTIONS: Required<PasswordStrengthOptions> = {
  minLength: 8,
  maxLength: 50,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

export function IsStrongPassword(
  options?: PasswordStrengthOptions,
  validationOptions?: ValidationOptions,
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') return false;

          if (value.length < opts.minLength || value.length > opts.maxLength) {
            return false;
          }
          if (opts.requireUppercase && !/[A-Z]/.test(value)) return false;
          if (opts.requireLowercase && !/[a-z]/.test(value)) return false;
          if (opts.requireNumber && !/[0-9]/.test(value)) return false;
          if (opts.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments): string {
          const value = args.value as string;

          if (typeof value !== 'string') {
            return '비밀번호는 문자열이어야 합니다.';
          }
          if (value.length < opts.minLength) {
            return `비밀번호는 최소 ${opts.minLength}자 이상이어야 합니다.`;
          }
          if (value.length > opts.maxLength) {
            return `비밀번호는 최대 ${opts.maxLength}자 이하여야 합니다.`;
          }
          if (opts.requireUppercase && !/[A-Z]/.test(value)) {
            return '비밀번호는 최소 하나의 대문자를 포함해야 합니다.';
          }
          if (opts.requireLowercase && !/[a-z]/.test(value)) {
            return '비밀번호는 최소 하나의 소문자를 포함해야 합니다.';
          }
          if (opts.requireNumber && !/[0-9]/.test(value)) {
            return '비밀번호는 최소 하나의 숫자를 포함해야 합니다.';
          }
          if (opts.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
            return '비밀번호는 최소 하나의 특수문자를 포함해야 합니다.';
          }

          return '비밀번호 형식이 올바르지 않습니다.';
        },
      },
    });
  };
}
