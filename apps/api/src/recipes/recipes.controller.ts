import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private recipesService: RecipesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '레시피 생성' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateRecipeDto,
  ) {
    return this.recipesService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: '레시피 목록 조회' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @CurrentUser('id') userId?: string,
  ) {
    return this.recipesService.findAll({ page, limit, categoryId, search, userId });
  }

  @Get(':id')
  @ApiOperation({ summary: '레시피 상세 조회' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId?: string,
  ) {
    return this.recipesService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '레시피 수정' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateRecipeDto,
  ) {
    return this.recipesService.update(id, userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '레시피 삭제' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.recipesService.remove(id, userId);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '레시피 좋아요' })
  async like(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.recipesService.like(id, userId);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '레시피 좋아요 취소' })
  async unlike(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.recipesService.unlike(id, userId);
  }
}
