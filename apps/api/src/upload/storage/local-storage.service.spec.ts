import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { LocalStorageService } from './local-storage.service';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  promises: {
    writeFile: jest.fn(),
    unlink: jest.fn(),
  },
}));

jest.mock('uuid', () => ({
  v4: () => 'test-uuid',
}));

describe('LocalStorageService', () => {
  let service: LocalStorageService;

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
    (fs.existsSync as jest.Mock).mockReturnValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStorageService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              const config: Record<string, string> = {
                UPLOAD_DIR: './uploads',
                API_URL: 'http://localhost:4000',
              };
              return config[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<LocalStorageService>(LocalStorageService);
  });

  describe('upload', () => {
    it('파일을 업로드하고 URL을 반환해야 한다', async () => {
      const file = createMockFile();
      (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

      const result = await service.upload(file, 'images');

      expect(fs.promises.writeFile).toHaveBeenCalled();
      expect(result).toBe('http://localhost:4000/uploads/images/test-uuid.jpg');
    });

    it('폴더가 없으면 생성해야 한다', async () => {
      const file = createMockFile();
      // 첫 번째 호출(uploadDir 확인)은 true, 두 번째 호출(folderPath 확인)은 false
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(true)  // constructor의 ensureUploadDir
        .mockReturnValueOnce(false); // upload의 folderPath 확인
      (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

      // 새로운 서비스 인스턴스 생성하여 테스트
      const { Test: NestTest } = require('@nestjs/testing');
      const { ConfigService } = require('@nestjs/config');

      const module = await NestTest.createTestingModule({
        providers: [
          LocalStorageService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string, defaultValue?: string) => {
                const config: Record<string, string> = {
                  UPLOAD_DIR: './uploads',
                  API_URL: 'http://localhost:4000',
                };
                return config[key] || defaultValue;
              }),
            },
          },
        ],
      }).compile();

      const newService = module.get(LocalStorageService);
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await newService.upload(file, 'new-folder');

      expect(fs.mkdirSync).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('파일을 삭제해야 한다', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.promises.unlink as jest.Mock).mockResolvedValue(undefined);

      await service.delete('http://localhost:4000/uploads/images/test.jpg');

      expect(fs.promises.unlink).toHaveBeenCalled();
    });

    it('파일이 없으면 삭제하지 않아야 한다', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await service.delete('http://localhost:4000/uploads/images/nonexistent.jpg');

      expect(fs.promises.unlink).not.toHaveBeenCalled();
    });

    it('삭제 실패 시 에러를 로깅해야 한다', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (fs.existsSync as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });

      await service.delete('invalid-url');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
