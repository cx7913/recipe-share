import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../common/prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: jest.Mocked<PrismaService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    profileImage: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get(PrismaService);
  });

  describe('create', () => {
    const createUserDto = {
      email: 'test@example.com',
      password: 'hashedPassword',
      name: 'Test User',
    };

    it('새로운 사용자를 생성해야 한다', async () => {
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: createUserDto,
        select: {
          id: true,
          email: true,
          name: true,
          profileImage: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findById', () => {
    it('ID로 사용자를 찾아야 한다', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findById('user-123');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: {
          id: true,
          email: true,
          name: true,
          profileImage: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('사용자가 없으면 null을 반환해야 한다', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('이메일로 사용자를 찾아야 한다', async () => {
      const userWithPassword = { ...mockUser, password: 'hashedPassword' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(userWithPassword);

      const result = await service.findByEmail('test@example.com');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(userWithPassword);
    });

    it('사용자가 없으면 null을 반환해야 한다', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.findByEmail('non-existent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('사용자 프로필을 업데이트해야 한다', async () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.updateProfile('user-123', { name: 'Updated Name' });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { name: 'Updated Name' },
        select: {
          id: true,
          email: true,
          name: true,
          profileImage: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(updatedUser);
    });

    it('프로필 이미지를 업데이트해야 한다', async () => {
      const updatedUser = { ...mockUser, profileImage: 'new-image.jpg' };
      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.updateProfile('user-123', {
        profileImage: 'new-image.jpg',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { profileImage: 'new-image.jpg' },
        select: expect.any(Object),
      });
      expect(result.profileImage).toBe('new-image.jpg');
    });
  });
});
