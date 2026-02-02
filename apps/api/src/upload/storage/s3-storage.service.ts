import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { StorageService } from './storage.interface';

@Injectable()
export class S3StorageService implements StorageService {
  private s3Client: S3Client;
  private bucket: string;
  private region: string;

  constructor(private configService: ConfigService) {
    this.region = this.configService.get('AWS_REGION', 'ap-northeast-2');
    this.bucket = this.configService.get('AWS_S3_BUCKET', '');

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY', ''),
      },
    });
  }

  async upload(file: Express.Multer.File, folder: string): Promise<string> {
    const ext = path.extname(file.originalname);
    const key = `${folder}/${uuid()}${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async delete(fileUrl: string): Promise<void> {
    try {
      const url = new URL(fileUrl);
      const key = url.pathname.substring(1); // Remove leading slash

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Failed to delete S3 file:', error);
    }
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }
}
