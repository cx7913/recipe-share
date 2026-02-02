import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { LocalStorageService } from './storage/local-storage.service';
import { S3StorageService } from './storage/s3-storage.service';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        limits: {
          fileSize: configService.get('MAX_FILE_SIZE', 10 * 1024 * 1024), // 10MB
        },
      }),
    }),
  ],
  providers: [
    UploadService,
    LocalStorageService,
    S3StorageService,
    {
      provide: 'STORAGE_SERVICE',
      useFactory: (
        configService: ConfigService,
        localStorageService: LocalStorageService,
        s3StorageService: S3StorageService,
      ) => {
        const storageType = configService.get('STORAGE_TYPE', 'local');
        return storageType === 's3' ? s3StorageService : localStorageService;
      },
      inject: [ConfigService, LocalStorageService, S3StorageService],
    },
  ],
  controllers: [UploadController],
  exports: [UploadService],
})
export class UploadModule {}
