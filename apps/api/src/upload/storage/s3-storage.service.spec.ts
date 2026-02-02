import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3StorageService } from './s3-storage.service';

const mockSend = jest.fn();

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: mockSend,
  })),
  PutObjectCommand: jest.fn().mockImplementation((params) => params),
  DeleteObjectCommand: jest.fn().mockImplementation((params) => params),
  GetObjectCommand: jest.fn().mockImplementation((params) => params),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://signed-url.example.com'),
}));

jest.mock('uuid', () => ({
  v4: () => 'test-uuid',
}));

describe('S3StorageService', () => {
  let service: S3StorageService;

  const createMockFile = (): Express.Multer.File => ({
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('test'),
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3StorageService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              const config: Record<string, string> = {
                AWS_REGION: 'ap-northeast-2',
                AWS_S3_BUCKET: 'test-bucket',
                AWS_ACCESS_KEY_ID: 'test-access-key',
                AWS_SECRET_ACCESS_KEY: 'test-secret-key',
              };
              return config[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<S3StorageService>(S3StorageService);
  });

  describe('upload', () => {
    it('S3에 파일을 업로드하고 URL을 반환해야 한다', async () => {
      const file = createMockFile();
      mockSend.mockResolvedValue({});

      const result = await service.upload(file, 'images');

      expect(mockSend).toHaveBeenCalled();
      expect(result).toBe(
        'https://test-bucket.s3.ap-northeast-2.amazonaws.com/images/test-uuid.jpg',
      );
    });
  });

  describe('delete', () => {
    it('S3에서 파일을 삭제해야 한다', async () => {
      mockSend.mockResolvedValue({});

      await service.delete(
        'https://test-bucket.s3.ap-northeast-2.amazonaws.com/images/test.jpg',
      );

      expect(mockSend).toHaveBeenCalled();
    });

    it('삭제 실패 시 에러를 로깅해야 한다', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSend.mockRejectedValue(new Error('S3 error'));

      await service.delete('https://test-bucket.s3.amazonaws.com/test.jpg');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('getSignedUrl', () => {
    it('서명된 URL을 반환해야 한다', async () => {
      const result = await service.getSignedUrl('images/test.jpg');

      expect(getSignedUrl).toHaveBeenCalled();
      expect(result).toBe('https://signed-url.example.com');
    });

    it('커스텀 만료 시간을 설정할 수 있어야 한다', async () => {
      await service.getSignedUrl('images/test.jpg', 7200);

      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { expiresIn: 7200 },
      );
    });
  });
});
