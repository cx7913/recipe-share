import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UploadService } from './upload.service';

describe('UploadService', () => {
  let service: UploadService;
  let mockStorageService: { upload: jest.Mock; delete: jest.Mock };

  const createMockFile = (mimetype: string): Express.Multer.File => ({
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype,
    size: 1024,
    buffer: Buffer.from('test'),
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
  });

  beforeEach(async () => {
    mockStorageService = {
      upload: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: 'STORAGE_SERVICE',
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  describe('uploadImage', () => {
    it('이미지를 업로드해야 한다', async () => {
      const file = createMockFile('image/jpeg');
      mockStorageService.upload.mockResolvedValue('https://example.com/image.jpg');

      const result = await service.uploadImage(file);

      expect(mockStorageService.upload).toHaveBeenCalledWith(file, 'images');
      expect(result).toBe('https://example.com/image.jpg');
    });

    it('커스텀 폴더에 업로드해야 한다', async () => {
      const file = createMockFile('image/png');
      mockStorageService.upload.mockResolvedValue('https://example.com/custom/image.png');

      await service.uploadImage(file, 'custom');

      expect(mockStorageService.upload).toHaveBeenCalledWith(file, 'custom');
    });

    it('파일이 없으면 BadRequestException을 던져야 한다', async () => {
      await expect(service.uploadImage(null as any)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.uploadImage(null as any)).rejects.toThrow(
        '파일이 없습니다.',
      );
    });

    it('지원하지 않는 형식이면 BadRequestException을 던져야 한다', async () => {
      const file = createMockFile('application/pdf');

      await expect(service.uploadImage(file)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.uploadImage(file)).rejects.toThrow(
        '지원하지 않는 이미지 형식입니다.',
      );
    });
  });

  describe('지원하는 이미지 형식', () => {
    const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    supportedTypes.forEach((mimetype) => {
      it(`${mimetype} 형식을 지원해야 한다`, async () => {
        const file = createMockFile(mimetype);
        mockStorageService.upload.mockResolvedValue('https://example.com/image');

        await expect(service.uploadImage(file)).resolves.not.toThrow();
      });
    });
  });

  describe('uploadRecipeImage', () => {
    it('recipes 폴더에 업로드해야 한다', async () => {
      const file = createMockFile('image/jpeg');
      mockStorageService.upload.mockResolvedValue('https://example.com/recipes/image.jpg');

      const result = await service.uploadRecipeImage(file);

      expect(mockStorageService.upload).toHaveBeenCalledWith(file, 'recipes');
      expect(result).toContain('recipes');
    });
  });

  describe('uploadProfileImage', () => {
    it('profiles 폴더에 업로드해야 한다', async () => {
      const file = createMockFile('image/jpeg');
      mockStorageService.upload.mockResolvedValue('https://example.com/profiles/image.jpg');

      const result = await service.uploadProfileImage(file);

      expect(mockStorageService.upload).toHaveBeenCalledWith(file, 'profiles');
      expect(result).toContain('profiles');
    });
  });

  describe('deleteImage', () => {
    it('이미지를 삭제해야 한다', async () => {
      mockStorageService.delete.mockResolvedValue(undefined);

      await service.deleteImage('https://example.com/image.jpg');

      expect(mockStorageService.delete).toHaveBeenCalledWith(
        'https://example.com/image.jpg',
      );
    });
  });
});
