import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    profileImage: null,
  };

  const mockTokens = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refreshToken: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
    };

    it('회원가입 성공 시 사용자 정보와 토큰을 반환해야 한다', async () => {
      const expectedResult = { user: mockUser, ...mockTokens };
      authService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('로그인 성공 시 사용자 정보와 토큰을 반환해야 한다', async () => {
      const expectedResult = { user: mockUser, ...mockTokens };
      authService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('refresh', () => {
    const refreshTokenDto = { refreshToken: 'old-refresh-token' };

    it('토큰 갱신 성공 시 새로운 토큰을 반환해야 한다', async () => {
      authService.refreshToken.mockResolvedValue(mockTokens);

      const result = await controller.refresh(refreshTokenDto);

      expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto.refreshToken);
      expect(result).toEqual(mockTokens);
    });
  });

  describe('logout', () => {
    it('로그아웃 성공 시 메시지를 반환해야 한다', async () => {
      authService.logout.mockResolvedValue(undefined);

      const result = await controller.logout('user-123');

      expect(authService.logout).toHaveBeenCalledWith('user-123');
      expect(result).toEqual({ message: '로그아웃되었습니다.' });
    });
  });

  describe('getMe', () => {
    it('현재 사용자 정보를 반환해야 한다', async () => {
      const result = await controller.getMe(mockUser);

      expect(result).toEqual(mockUser);
    });
  });
});
