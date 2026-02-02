import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { StorageService } from './storage.interface';

@Injectable()
export class LocalStorageService implements StorageService {
  private uploadDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DIR', './uploads');
    this.ensureUploadDir();
  }

  private ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File, folder: string): Promise<string> {
    const folderPath = path.join(this.uploadDir, folder);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const filename = `${uuid()}${ext}`;
    const filePath = path.join(folderPath, filename);

    await fs.promises.writeFile(filePath, file.buffer);

    // Return relative URL
    const apiUrl = this.configService.get('API_URL', 'http://localhost:4000');
    return `${apiUrl}/uploads/${folder}/${filename}`;
  }

  async delete(fileUrl: string): Promise<void> {
    try {
      // Extract path from URL
      const urlPath = new URL(fileUrl).pathname;
      const filePath = path.join(process.cwd(), urlPath);

      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  }
}
