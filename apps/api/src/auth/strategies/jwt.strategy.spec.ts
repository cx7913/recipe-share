import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../../users/users.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: jest.Mocked<UsersService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    profileImage: 'https://example.com/image.jpg',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-jwt-secret'),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get(UsersService);
  });

  describe('validate', () => {
    const payload = { sub: 'user-123', email: 'test@example.com' };

    it('유효한 페이로드로 사용자 정보를 반환해야 한다', async () => {
      usersService.findById.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(usersService.findById).toHaveBeenCalledWith(payload.sub);
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        profileImage: mockUser.profileImage,
      });
    });

    it('사용자를 찾을 수 없으면 UnauthorizedException을 던져야 한다', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow(
        '사용자를 찾을 수 없습니다.',
      );
    });
  });
});
