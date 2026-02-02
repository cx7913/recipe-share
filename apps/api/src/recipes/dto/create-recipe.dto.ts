import {
  IsString,
  IsInt,
  IsEnum,
  IsUUID,
  IsArray,
  IsOptional,
  ValidateNested,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty } from '@prisma/client';

export { Difficulty };

export class IngredientDto {
  @ApiProperty({ example: '돼지고기' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: '300' })
  @IsString()
  amount: string;

  @ApiProperty({ example: 'g' })
  @IsString()
  unit: string;
}

class StepDto {
  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  order?: number;

  @ApiProperty({ example: '돼지고기를 한입 크기로 썰어주세요.' })
  @IsString()
  @MinLength(1)
  description: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class CreateRecipeDto {
  @ApiProperty({ example: '매콤 돼지불고기' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({ example: '간단하고 맛있는 돼지불고기 레시피입니다.' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiProperty({ example: 30, description: '조리 시간 (분)' })
  @IsInt()
  @Min(1)
  @Max(1440)
  cookingTime: number;

  @ApiProperty({ example: 2, description: '인분' })
  @IsInt()
  @Min(1)
  @Max(100)
  servings: number;

  @ApiProperty({ enum: Difficulty, example: 'medium' })
  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ type: [IngredientDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredientDto)
  ingredients: IngredientDto[];

  @ApiProperty({ type: [StepDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepDto)
  steps: StepDto[];
}
