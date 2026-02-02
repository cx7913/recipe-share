import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

describe('UploadController', () => {
  let controller: UploadController;
  let service: jest.Mocked<UploadService>;

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
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: UploadService,
          useValue: {
            uploadRecipeImage: jest.fn(),
            uploadProfileImage: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    service = module.get(UploadService);
  });

  describe('uploadImage', () => {
    it('레시피 이미지를 업로드해야 한다', async () => {
      const file = createMockFile();
      service.uploadRecipeImage.mockResolvedValue('https://example.com/recipes/image.jpg');

      const result = await controller.uploadImage(file);

      expect(service.uploadRecipeImage).toHaveBeenCalledWith(file);
      expect(result).toEqual({ url: 'https://example.com/recipes/image.jpg' });
    });
  });

  describe('uploadProfileImage', () => {
    it('프로필 이미지를 업로드해야 한다', async () => {
      const file = createMockFile();
      service.uploadProfileImage.mockResolvedValue('https://example.com/profiles/image.jpg');

      const result = await controller.uploadProfileImage(file);

      expect(service.uploadProfileImage).toHaveBeenCalledWith(file);
      expect(result).toEqual({ url: 'https://example.com/profiles/image.jpg' });
    });
  });
});
