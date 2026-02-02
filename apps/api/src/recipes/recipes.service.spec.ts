import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { Difficulty } from '@prisma/client';

describe('RecipesService', () => {
  let service: RecipesService;
  let prisma: jest.Mocked<PrismaService>;

  const mockRecipe = {
    id: 'recipe-123',
    title: '김치찌개',
    description: '맛있는 김치찌개',
    thumbnailUrl: 'https://example.com/image.jpg',
    cookingTime: 30,
    servings: 2,
    difficulty: 'MEDIUM',
    authorId: 'user-123',
    categoryId: 'category-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    author: { id: 'user-123', name: 'Test User', profileImage: null },
    category: { id: 'category-123', name: '한식' },
    ingredients: [{ id: '1', name: '김치', amount: '200', unit: 'g', recipeId: 'recipe-123' }],
    steps: [{ id: '1', description: '김치를 썬다', order: 1, imageUrl: null, recipeId: 'recipe-123' }],
    _count: { likes: 5 },
    likes: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
        {
          provide: PrismaService,
          useValue: {
            recipe: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            ingredient: {
              deleteMany: jest.fn(),
            },
            step: {
              deleteMany: jest.fn(),
            },
            like: {
              findUnique: jest.fn(),
              create: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RecipesService>(RecipesService);
    prisma = module.get(PrismaService);
  });

  describe('create', () => {
    const createDto: CreateRecipeDto = {
      title: '김치찌개',
      description: '맛있는 김치찌개',
      thumbnailUrl: 'https://example.com/image.jpg',
      cookingTime: 30,
      servings: 2,
      difficulty: Difficulty.MEDIUM,
      categoryId: 'category-123',
      ingredients: [{ name: '김치', amount: '200', unit: 'g' }],
      steps: [{ description: '김치를 썬다', imageUrl: undefined }],
    };

    it('레시피를 생성해야 한다', async () => {
      (prisma.recipe.create as jest.Mock).mockResolvedValue(mockRecipe);

      const result = await service.create('user-123', createDto);

      expect(prisma.recipe.create).toHaveBeenCalled();
      expect(result).toEqual(mockRecipe);
    });
  });

  describe('findAll', () => {
    it('레시피 목록을 반환해야 한다', async () => {
      (prisma.recipe.findMany as jest.Mock).mockResolvedValue([mockRecipe]);
      (prisma.recipe.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 12 });

      expect(prisma.recipe.findMany).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('카테고리로 필터링해야 한다', async () => {
      (prisma.recipe.findMany as jest.Mock).mockResolvedValue([mockRecipe]);
      (prisma.recipe.count as jest.Mock).mockResolvedValue(1);

      await service.findAll({ categoryId: 'category-123' });

      expect(prisma.recipe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ categoryId: 'category-123' }),
        }),
      );
    });

    it('검색어로 필터링해야 한다', async () => {
      (prisma.recipe.findMany as jest.Mock).mockResolvedValue([mockRecipe]);
      (prisma.recipe.count as jest.Mock).mockResolvedValue(1);

      await service.findAll({ search: '김치' });

      expect(prisma.recipe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });

    it('페이지네이션이 적용되어야 한다', async () => {
      (prisma.recipe.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.recipe.count as jest.Mock).mockResolvedValue(25);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(prisma.recipe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
      expect(result.meta.totalPages).toBe(3);
    });
  });

  describe('findOne', () => {
    it('레시피를 찾아 반환해야 한다', async () => {
      (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(mockRecipe);

      const result = await service.findOne('recipe-123');

      expect(prisma.recipe.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'recipe-123' } }),
      );
      expect(result.likesCount).toBe(5);
    });

    it('레시피가 없으면 NotFoundException을 던져야 한다', async () => {
      (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('로그인한 사용자의 좋아요 여부를 반환해야 한다', async () => {
      const recipeWithLike = { ...mockRecipe, likes: [{ id: 'like-1' }] };
      (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(recipeWithLike);

      const result = await service.findOne('recipe-123', 'user-123');

      expect(result.isLiked).toBe(true);
    });
  });

  describe('update', () => {
    const updateDto = {
      title: '수정된 김치찌개',
      description: '더 맛있는 김치찌개',
      ingredients: [{ name: '김치', amount: '300', unit: 'g' }],
      steps: [{ description: '김치를 크게 썬다' }],
    };

    it('레시피를 수정해야 한다', async () => {
      (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(mockRecipe);
      (prisma.ingredient.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
      (prisma.step.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
      (prisma.recipe.update as jest.Mock).mockResolvedValue({
        ...mockRecipe,
        ...updateDto,
      });

      const result = await service.update('recipe-123', 'user-123', updateDto);

      expect(prisma.recipe.update).toHaveBeenCalled();
      expect(result.title).toBe('수정된 김치찌개');
    });

    it('레시피가 없으면 NotFoundException을 던져야 한다', async () => {
      (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update('non-existent', 'user-123', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('작성자가 아니면 ForbiddenException을 던져야 한다', async () => {
      (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(mockRecipe);

      await expect(
        service.update('recipe-123', 'other-user', updateDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('레시피를 삭제해야 한다', async () => {
      (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(mockRecipe);
      (prisma.recipe.delete as jest.Mock).mockResolvedValue(mockRecipe);

      const result = await service.remove('recipe-123', 'user-123');

      expect(prisma.recipe.delete).toHaveBeenCalledWith({
        where: { id: 'recipe-123' },
      });
      expect(result.message).toBe('레시피가 삭제되었습니다.');
    });

    it('레시피가 없으면 NotFoundException을 던져야 한다', async () => {
      (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.remove('non-existent', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('작성자가 아니면 ForbiddenException을 던져야 한다', async () => {
      (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(mockRecipe);

      await expect(service.remove('recipe-123', 'other-user')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('like', () => {
    it('좋아요를 추가해야 한다', async () => {
      (prisma.like.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.like.create as jest.Mock).mockResolvedValue({ id: 'like-1' });

      const result = await service.like('recipe-123', 'user-123');

      expect(prisma.like.create).toHaveBeenCalledWith({
        data: { userId: 'user-123', recipeId: 'recipe-123' },
      });
      expect(result.message).toBe('좋아요가 추가되었습니다.');
    });

    it('이미 좋아요한 경우 메시지를 반환해야 한다', async () => {
      (prisma.like.findUnique as jest.Mock).mockResolvedValue({ id: 'like-1' });

      const result = await service.like('recipe-123', 'user-123');

      expect(prisma.like.create).not.toHaveBeenCalled();
      expect(result.message).toBe('이미 좋아요한 레시피입니다.');
    });
  });

  describe('unlike', () => {
    it('좋아요를 취소해야 한다', async () => {
      (prisma.like.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await service.unlike('recipe-123', 'user-123');

      expect(prisma.like.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-123', recipeId: 'recipe-123' },
      });
      expect(result.message).toBe('좋아요가 취소되었습니다.');
    });
  });
});
