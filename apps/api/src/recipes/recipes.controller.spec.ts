import { Test, TestingModule } from '@nestjs/testing';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';

describe('RecipesController', () => {
  let controller: RecipesController;
  let service: jest.Mocked<RecipesService>;

  const mockRecipe = {
    id: 'recipe-123',
    title: '김치찌개',
    description: '맛있는 김치찌개',
    author: { id: 'user-123', name: 'Test User', profileImage: null },
    likesCount: 5,
    isLiked: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipesController],
      providers: [
        {
          provide: RecipesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            like: jest.fn(),
            unlike: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RecipesController>(RecipesController);
    service = module.get(RecipesService);
  });

  describe('create', () => {
    const createDto = {
      title: '김치찌개',
      description: '맛있는 김치찌개',
      cookingTime: 30,
      servings: 2,
      difficulty: 'MEDIUM' as const,
      ingredients: [{ name: '김치', amount: '200', unit: 'g' }],
      steps: [{ description: '김치를 썬다' }],
    };

    it('레시피를 생성해야 한다', async () => {
      service.create.mockResolvedValue(mockRecipe as any);

      const result = await controller.create('user-123', createDto);

      expect(service.create).toHaveBeenCalledWith('user-123', createDto);
      expect(result).toEqual(mockRecipe);
    });
  });

  describe('findAll', () => {
    const mockResponse = {
      data: [mockRecipe],
      meta: { total: 1, page: 1, limit: 12, totalPages: 1 },
    };

    it('레시피 목록을 조회해야 한다', async () => {
      service.findAll.mockResolvedValue(mockResponse as any);

      const result = await controller.findAll(1, 12);

      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 12,
        categoryId: undefined,
        search: undefined,
        userId: undefined,
      });
      expect(result).toEqual(mockResponse);
    });

    it('카테고리와 검색어로 필터링해야 한다', async () => {
      service.findAll.mockResolvedValue(mockResponse as any);

      await controller.findAll(1, 12, 'category-123', '김치');

      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 12,
        categoryId: 'category-123',
        search: '김치',
        userId: undefined,
      });
    });
  });

  describe('findOne', () => {
    it('레시피 상세 정보를 조회해야 한다', async () => {
      service.findOne.mockResolvedValue(mockRecipe as any);

      const result = await controller.findOne('recipe-123');

      expect(service.findOne).toHaveBeenCalledWith('recipe-123', undefined);
      expect(result).toEqual(mockRecipe);
    });

    it('로그인한 사용자 ID를 전달해야 한다', async () => {
      service.findOne.mockResolvedValue(mockRecipe as any);

      await controller.findOne('recipe-123', 'user-123');

      expect(service.findOne).toHaveBeenCalledWith('recipe-123', 'user-123');
    });
  });

  describe('update', () => {
    const updateDto = { title: '수정된 김치찌개' };

    it('레시피를 수정해야 한다', async () => {
      const updatedRecipe = { ...mockRecipe, title: '수정된 김치찌개' };
      service.update.mockResolvedValue(updatedRecipe as any);

      const result = await controller.update('recipe-123', 'user-123', updateDto);

      expect(service.update).toHaveBeenCalledWith('recipe-123', 'user-123', updateDto);
      expect(result.title).toBe('수정된 김치찌개');
    });
  });

  describe('remove', () => {
    it('레시피를 삭제해야 한다', async () => {
      service.remove.mockResolvedValue({ message: '레시피가 삭제되었습니다.' });

      const result = await controller.remove('recipe-123', 'user-123');

      expect(service.remove).toHaveBeenCalledWith('recipe-123', 'user-123');
      expect(result.message).toBe('레시피가 삭제되었습니다.');
    });
  });

  describe('like', () => {
    it('좋아요를 추가해야 한다', async () => {
      service.like.mockResolvedValue({ message: '좋아요가 추가되었습니다.' });

      const result = await controller.like('recipe-123', 'user-123');

      expect(service.like).toHaveBeenCalledWith('recipe-123', 'user-123');
      expect(result.message).toBe('좋아요가 추가되었습니다.');
    });
  });

  describe('unlike', () => {
    it('좋아요를 취소해야 한다', async () => {
      service.unlike.mockResolvedValue({ message: '좋아요가 취소되었습니다.' });

      const result = await controller.unlike('recipe-123', 'user-123');

      expect(service.unlike).toHaveBeenCalledWith('recipe-123', 'user-123');
      expect(result.message).toBe('좋아요가 취소되었습니다.');
    });
  });
});
