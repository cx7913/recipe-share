import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { StorageService } from './storage/storage.interface';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

@Injectable()
export class UploadService {
  constructor(
    @Inject('STORAGE_SERVICE') private storageService: StorageService,
  ) {}

  async uploadImage(file: Express.Multer.File, folder = 'images'): Promise<string> {
    this.validateImage(file);
    return this.storageService.upload(file, folder);
  }

  async uploadRecipeImage(file: Express.Multer.File): Promise<string> {
    return this.uploadImage(file, 'recipes');
  }

  async uploadProfileImage(file: Express.Multer.File): Promise<string> {
    return this.uploadImage(file, 'profiles');
  }

  async deleteImage(fileUrl: string): Promise<void> {
    await this.storageService.delete(fileUrl);
  }

  private validateImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('파일이 없습니다.');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        '지원하지 않는 이미지 형식입니다. (JPG, PNG, GIF, WebP만 가능)',
      );
    }
  }
}
