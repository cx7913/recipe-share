import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';

describe('HealthController', () => {
  let controller: HealthController;
  let prismaService: jest.Mocked<PrismaService>;
  let redisService: jest.Mocked<RedisService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            ping: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    prismaService = module.get(PrismaService);
    redisService = module.get(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('check', () => {
    it('should return healthy status when all services are up', async () => {
      prismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
      redisService.ping.mockResolvedValue('PONG');

      const result = await controller.check();

      expect(result.status).toBe('ok');
      expect(result.services.database).toBe('healthy');
      expect(result.services.redis).toBe('healthy');
      expect(result.timestamp).toBeDefined();
    });

    it('should return degraded status when database is unhealthy', async () => {
      prismaService.$queryRaw.mockRejectedValue(new Error('DB Error'));
      redisService.ping.mockResolvedValue('PONG');

      const result = await controller.check();

      expect(result.status).toBe('degraded');
      expect(result.services.database).toBe('unhealthy');
      expect(result.services.redis).toBe('healthy');
    });

    it('should return degraded status when redis is unhealthy', async () => {
      prismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
      redisService.ping.mockRejectedValue(new Error('Redis Error'));

      const result = await controller.check();

      expect(result.status).toBe('degraded');
      expect(result.services.database).toBe('healthy');
      expect(result.services.redis).toBe('unhealthy');
    });

    it('should return degraded status when all services are unhealthy', async () => {
      prismaService.$queryRaw.mockRejectedValue(new Error('DB Error'));
      redisService.ping.mockRejectedValue(new Error('Redis Error'));

      const result = await controller.check();

      expect(result.status).toBe('degraded');
      expect(result.services.database).toBe('unhealthy');
      expect(result.services.redis).toBe('unhealthy');
    });
  });

  describe('live', () => {
    it('should return ok status', () => {
      const result = controller.live();
      expect(result).toEqual({ status: 'ok' });
    });
  });

  describe('ready', () => {
    it('should return ready status when all services are up', async () => {
      prismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
      redisService.ping.mockResolvedValue('PONG');

      const result = await controller.ready();

      expect(result).toEqual({ status: 'ready' });
    });

    it('should return not ready status when services fail', async () => {
      prismaService.$queryRaw.mockRejectedValue(new Error('DB Error'));

      const result = await controller.ready();

      expect(result.status).toBe('not ready');
      expect(result.error).toBeDefined();
    });
  });
});
