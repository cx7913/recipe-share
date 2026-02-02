import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RedisService } from '../common/redis/redis.service';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let redisService: jest.Mocked<RedisService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    profileImage: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              const config: Record<string, string> = {
                JWT_REFRESH_SECRET: 'test-refresh-secret',
                JWT_REFRESH_EXPIRES_IN: '30d',
              };
              return config[key] || defaultValue;
            }),
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    redisService = module.get(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should register a new user successfully', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser as any);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      jwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      redisService.set.mockResolvedValue();

      const result = await service.register(registerDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(usersService.create).toHaveBeenCalled();
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    // TDD 추가 테스트 케이스

    describe('이메일 중복 체크', () => {
      it('회원가입 시 이메일 중복 여부를 먼저 확인해야 한다', async () => {
        usersService.findByEmail.mockResolvedValue(null);
        usersService.create.mockResolvedValue(mockUser as any);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
        jwtService.sign.mockReturnValue('token');
        redisService.set.mockResolvedValue();

        await service.register(registerDto);

        // findByEmail이 create보다 먼저 호출되었는지 확인
        expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
        expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      });

      it('중복된 이메일로 가입 시 ConflictException을 던져야 한다', async () => {
        usersService.findByEmail.mockResolvedValue(mockUser as any);

        await expect(service.register(registerDto)).rejects.toThrow(
          ConflictException,
        );
        await expect(service.register(registerDto)).rejects.toThrow(
          '이미 사용 중인 이메일입니다.',
        );
      });

      it('중복된 이메일이면 사용자 생성을 시도하지 않아야 한다', async () => {
        usersService.findByEmail.mockResolvedValue(mockUser as any);

        await expect(service.register(registerDto)).rejects.toThrow(
          ConflictException,
        );
        expect(usersService.create).not.toHaveBeenCalled();
      });
    });

    describe('비밀번호 해싱', () => {
      it('비밀번호는 bcrypt로 해싱되어야 한다', async () => {
        usersService.findByEmail.mockResolvedValue(null);
        usersService.create.mockResolvedValue(mockUser as any);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
        jwtService.sign.mockReturnValue('token');
        redisService.set.mockResolvedValue();

        await service.register(registerDto);

        expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      });

      it('원본 비밀번호가 아닌 해싱된 비밀번호로 사용자를 생성해야 한다', async () => {
        const hashedPassword = '$2a$10$hashedPasswordValue';
        usersService.findByEmail.mockResolvedValue(null);
        usersService.create.mockResolvedValue(mockUser as any);
        (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
        jwtService.sign.mockReturnValue('token');
        redisService.set.mockResolvedValue();

        await service.register(registerDto);

        expect(usersService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            password: hashedPassword,
          }),
        );
        // 원본 비밀번호가 아닌지 확인
        expect(usersService.create).not.toHaveBeenCalledWith(
          expect.objectContaining({
            password: registerDto.password,
          }),
        );
      });

      it('솔트 라운드는 10이어야 한다', async () => {
        usersService.findByEmail.mockResolvedValue(null);
        usersService.create.mockResolvedValue(mockUser as any);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
        jwtService.sign.mockReturnValue('token');
        redisService.set.mockResolvedValue();

        await service.register(registerDto);

        expect(bcrypt.hash).toHaveBeenCalledWith(
          expect.any(String),
          10, // 솔트 라운드
        );
      });
    });

    describe('회원가입 응답', () => {
      it('회원가입 성공 시 사용자 정보와 토큰을 반환해야 한다', async () => {
        usersService.findByEmail.mockResolvedValue(null);
        usersService.create.mockResolvedValue(mockUser as any);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
        jwtService.sign
          .mockReturnValueOnce('access-token')
          .mockReturnValueOnce('refresh-token');
        redisService.set.mockResolvedValue();

        const result = await service.register(registerDto);

        expect(result).toHaveProperty('user');
        expect(result).toHaveProperty('accessToken');
        expect(result).toHaveProperty('refreshToken');
        expect(result.user).toHaveProperty('id');
        expect(result.user).toHaveProperty('email');
        expect(result.user).toHaveProperty('name');
      });

      it('응답에 비밀번호가 포함되지 않아야 한다', async () => {
        usersService.findByEmail.mockResolvedValue(null);
        usersService.create.mockResolvedValue(mockUser as any);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
        jwtService.sign.mockReturnValue('token');
        redisService.set.mockResolvedValue();

        const result = await service.register(registerDto);

        expect(result.user).not.toHaveProperty('password');
      });
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      redisService.set.mockResolvedValue();

      const result = await service.login(loginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          profileImage: mockUser.profileImage,
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens successfully', async () => {
      const payload = { sub: 'user-123', email: 'test@example.com' };
      jwtService.verify.mockReturnValue(payload);
      redisService.get.mockResolvedValue('valid-refresh-token');
      jwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');
      redisService.set.mockResolvedValue();

      const result = await service.refreshToken('valid-refresh-token');

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if stored token does not match', async () => {
      const payload = { sub: 'user-123', email: 'test@example.com' };
      jwtService.verify.mockReturnValue(payload);
      redisService.get.mockResolvedValue('different-token');

      await expect(service.refreshToken('valid-refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should delete refresh token from Redis', async () => {
      redisService.del.mockResolvedValue();

      await service.logout('user-123');

      expect(redisService.del).toHaveBeenCalledWith('refresh:user-123');
    });
  });
});
