import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateRecipeDto) {
    const { ingredients, steps, ...recipeData } = dto;
    return this.prisma.recipe.create({
      data: {
        title: recipeData.title,
        description: recipeData.description || '',
        thumbnailUrl: recipeData.thumbnailUrl,
        cookingTime: recipeData.cookingTime,
        servings: recipeData.servings,
        difficulty: recipeData.difficulty,
        author: { connect: { id: userId } },
        ...(recipeData.categoryId && { category: { connect: { id: recipeData.categoryId } } }),
        ingredients: {
          create: ingredients,
        },
        steps: {
          create: steps.map((step, index) => ({
            description: step.description,
            imageUrl: step.imageUrl,
            order: step.order || index + 1,
          })),
        },
      },
      include: {
        author: {
          select: { id: true, name: true, profileImage: true },
        },
        category: true,
        ingredients: true,
        steps: { orderBy: { order: 'asc' } },
        _count: { select: { likes: true } },
      },
    });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    userId?: string;
  }) {
    const { page = 1, limit = 12, categoryId, search, userId } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [recipes, total] = await Promise.all([
      this.prisma.recipe.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, profileImage: true },
          },
          category: true,
          _count: { select: { likes: true } },
          likes: userId ? { where: { userId }, select: { id: true } } : false,
        },
      }),
      this.prisma.recipe.count({ where }),
    ]);

    return {
      data: recipes.map((recipe) => ({
        ...recipe,
        likesCount: recipe._count.likes,
        isLiked: userId ? recipe.likes?.length > 0 : false,
        _count: undefined,
        likes: undefined,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId?: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, profileImage: true },
        },
        category: true,
        ingredients: true,
        steps: { orderBy: { order: 'asc' } },
        _count: { select: { likes: true } },
        likes: userId ? { where: { userId }, select: { id: true } } : false,
      },
    });

    if (!recipe) {
      throw new NotFoundException('레시피를 찾을 수 없습니다.');
    }

    return {
      ...recipe,
      likesCount: recipe._count.likes,
      isLiked: userId ? recipe.likes?.length > 0 : false,
      _count: undefined,
      likes: undefined,
    };
  }

  async update(id: string, userId: string, dto: UpdateRecipeDto) {
    const recipe = await this.prisma.recipe.findUnique({ where: { id } });

    if (!recipe) {
      throw new NotFoundException('레시피를 찾을 수 없습니다.');
    }

    if (recipe.authorId !== userId) {
      throw new ForbiddenException('수정 권한이 없습니다.');
    }

    // Delete existing ingredients and steps
    await this.prisma.ingredient.deleteMany({ where: { recipeId: id } });
    await this.prisma.step.deleteMany({ where: { recipeId: id } });

    const { ingredients, steps, ...recipeData } = dto;
    return this.prisma.recipe.update({
      where: { id },
      data: {
        title: recipeData.title,
        description: recipeData.description,
        thumbnailUrl: recipeData.thumbnailUrl,
        cookingTime: recipeData.cookingTime,
        servings: recipeData.servings,
        difficulty: recipeData.difficulty,
        category: recipeData.categoryId
          ? { connect: { id: recipeData.categoryId } }
          : undefined,
        ingredients: ingredients
          ? { create: ingredients }
          : undefined,
        steps: steps
          ? {
              create: steps.map((step, index) => ({
                ...step,
                order: index + 1,
              })),
            }
          : undefined,
      },
      include: {
        author: {
          select: { id: true, name: true, profileImage: true },
        },
        category: true,
        ingredients: true,
        steps: { orderBy: { order: 'asc' } },
      },
    });
  }

  async remove(id: string, userId: string) {
    const recipe = await this.prisma.recipe.findUnique({ where: { id } });

    if (!recipe) {
      throw new NotFoundException('레시피를 찾을 수 없습니다.');
    }

    if (recipe.authorId !== userId) {
      throw new ForbiddenException('삭제 권한이 없습니다.');
    }

    await this.prisma.recipe.delete({ where: { id } });
    return { message: '레시피가 삭제되었습니다.' };
  }

  async like(recipeId: string, userId: string) {
    const existing = await this.prisma.like.findUnique({
      where: { userId_recipeId: { userId, recipeId } },
    });

    if (existing) {
      return { message: '이미 좋아요한 레시피입니다.' };
    }

    await this.prisma.like.create({
      data: { userId, recipeId },
    });

    return { message: '좋아요가 추가되었습니다.' };
  }

  async unlike(recipeId: string, userId: string) {
    await this.prisma.like.deleteMany({
      where: { userId, recipeId },
    });

    return { message: '좋아요가 취소되었습니다.' };
  }
}
