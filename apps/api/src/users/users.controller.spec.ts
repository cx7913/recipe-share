import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    profileImage: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  describe('getUser', () => {
    it('사용자 정보를 조회해야 한다', async () => {
      service.findById.mockResolvedValue(mockUser);

      const result = await controller.getUser('user-123');

      expect(service.findById).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockUser);
    });

    it('사용자가 없으면 null을 반환해야 한다', async () => {
      service.findById.mockResolvedValue(null);

      const result = await controller.getUser('non-existent');

      expect(result).toBeNull();
    });
  });
});
