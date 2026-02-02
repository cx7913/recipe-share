import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async check() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'unknown',
        redis: 'unknown',
      },
    };

    // Database check
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      health.services.database = 'healthy';
    } catch (error) {
      health.services.database = 'unhealthy';
      health.status = 'degraded';
    }

    // Redis check
    try {
      const pong = await this.redis.ping();
      health.services.redis = pong === 'PONG' ? 'healthy' : 'unhealthy';
    } catch (error) {
      health.services.redis = 'unhealthy';
      health.status = 'degraded';
    }

    return health;
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  live() {
    return { status: 'ok' };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      await this.redis.ping();
      return { status: 'ready' };
    } catch (error) {
      return { status: 'not ready', error: error.message };
    }
  }
}
