# Recipe Share - 단계별 구축 가이드

최소한의 보일러플레이트에서 시작하여 점진적으로 기능을 추가하는 실습 가이드입니다.

## 목차

1. [Phase 1: 프로젝트 초기 설정](#phase-1-프로젝트-초기-설정)
2. [Phase 2: 개발 인프라 구축](#phase-2-개발-인프라-구축)
3. [Phase 3: Backend API 기초](#phase-3-backend-api-기초)
4. [Phase 4: Frontend 기초](#phase-4-frontend-기초)
5. [Phase 5: 인증 시스템](#phase-5-인증-시스템)
6. [Phase 6: 핵심 기능 구현](#phase-6-핵심-기능-구현)
7. [Phase 7: 테스트](#phase-7-테스트)
8. [Phase 8: 배포 준비](#phase-8-배포-준비)

---

## Phase 1: 프로젝트 초기 설정

### 1.1 모노레포 구조 생성

```bash
# 프로젝트 디렉토리 생성
mkdir recipe-share && cd recipe-share

# Git 초기화
git init

# pnpm 초기화
pnpm init
```

### 1.2 pnpm workspace 설정

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 1.3 루트 package.json 설정

```json
{
  "name": "recipe-share",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

### 1.4 기본 설정 파일 생성

```bash
# .gitignore
cat > .gitignore << 'EOF'
node_modules
dist
.next
.env
.env.local
coverage
*.log
.DS_Store
EOF

# .nvmrc (Node.js 버전 고정)
echo "20" > .nvmrc

# EditorConfig
cat > .editorconfig << 'EOF'
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
EOF
```

### 1.5 앱 디렉토리 구조 생성

```bash
mkdir -p apps/api apps/web
```

**체크포인트**: `pnpm install` 실행 후 에러 없이 완료되어야 합니다.

---

## Phase 2: 개발 인프라 구축

### 2.1 Docker Compose 기본 설정

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: recipe_user
      POSTGRES_PASSWORD: recipe_password
      POSTGRES_DB: recipe_share
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

volumes:
  postgres_data:
```

### 2.2 환경 변수 템플릿

```bash
# .env.example
DATABASE_URL=postgresql://recipe_user:recipe_password@localhost:5432/recipe_share
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key-min-32-characters
```

### 2.3 개발 환경 실행

```bash
# Docker 서비스 시작
docker compose up -d

# 상태 확인
docker compose ps
```

**체크포인트**: PostgreSQL과 Redis가 정상 실행되어야 합니다.

---

## Phase 3: Backend API 기초

### 3.1 NestJS 프로젝트 생성

```bash
cd apps/api

# NestJS CLI로 프로젝트 생성
pnpm dlx @nestjs/cli new . --skip-git --package-manager pnpm

# package.json 수정 (name 변경)
# "name": "@recipe-share/api"
```

### 3.2 Prisma 설정

```bash
# Prisma 설치
pnpm add @prisma/client
pnpm add -D prisma

# Prisma 초기화
pnpm dlx prisma init
```

### 3.3 기본 스키마 정의

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}
```

### 3.4 첫 번째 마이그레이션

```bash
# .env 파일 생성
cp ../../.env.example .env

# 마이그레이션 실행
pnpm dlx prisma migrate dev --name init

# Prisma Studio로 확인
pnpm dlx prisma studio
```

### 3.5 Health Check 엔드포인트

```typescript
// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
```

### 3.6 API 실행 및 테스트

```bash
# 개발 서버 실행
pnpm dev

# Health check 테스트
curl http://localhost:4000/health
```

**체크포인트**: `{"status":"ok","timestamp":"..."}` 응답을 받아야 합니다.

---

## Phase 4: Frontend 기초

### 4.1 Next.js 프로젝트 생성

```bash
cd apps/web

# Next.js 생성
pnpm dlx create-next-app . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# package.json 수정
# "name": "@recipe-share/web"
```

### 4.2 기본 레이아웃 설정

```typescript
// src/app/layout.tsx
import './globals.css';

export const metadata = {
  title: 'Recipe Share',
  description: '맛있는 레시피를 공유하세요',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
```

### 4.3 홈페이지 생성

```typescript
// src/app/page.tsx
export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center">
        Recipe Share
      </h1>
      <p className="text-center text-gray-600 mt-4">
        맛있는 레시피를 공유하세요
      </p>
    </main>
  );
}
```

### 4.4 API 클라이언트 설정

```typescript
// src/lib/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  withCredentials: true,
});
```

### 4.5 Frontend 실행

```bash
pnpm dev
```

**체크포인트**: http://localhost:3000 에서 홈페이지가 표시되어야 합니다.

---

## Phase 5: 인증 시스템

### 5.1 Backend - Auth 모듈 설치

```bash
cd apps/api

pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt bcryptjs
pnpm add -D @types/passport-jwt @types/bcryptjs
```

### 5.2 User 스키마 확장

```prisma
// prisma/schema.prisma에 추가
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  name         String
  password     String
  refreshToken String?  @map("refresh_token")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@map("users")
}
```

### 5.3 Auth 모듈 생성

```bash
# NestJS CLI로 모듈 생성
pnpm dlx @nestjs/cli generate module auth
pnpm dlx @nestjs/cli generate controller auth
pnpm dlx @nestjs/cli generate service auth
```

### 5.4 회원가입 DTO

```typescript
// src/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

### 5.5 Auth Service 구현

```typescript
// src/auth/auth.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (exists) {
      throw new ConflictException('이미 존재하는 이메일입니다');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
    });

    return this.generateTokens(user.id, user.email);
  }

  private generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }
}
```

### 5.6 Frontend - 회원가입 페이지

```typescript
// src/app/auth/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      router.push('/recipes');
    } catch (err: any) {
      setError(err.response?.data?.message || '회원가입 실패');
    }
  };

  return (
    <main className="max-w-md mx-auto mt-20 p-6">
      <h1 className="text-2xl font-bold mb-6">회원가입</h1>

      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">이름</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1">이메일</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1">비밀번호</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border rounded px-3 py-2"
            minLength={8}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          회원가입
        </button>
      </form>
    </main>
  );
}
```

**체크포인트**: 회원가입 후 DB에 사용자가 생성되어야 합니다.

---

## Phase 6: 핵심 기능 구현

### 6.1 Recipe 스키마 추가

```prisma
// prisma/schema.prisma
enum Difficulty {
  easy
  medium
  hard
}

model Recipe {
  id          String     @id @default(uuid())
  title       String
  description String?
  cookingTime Int        @map("cooking_time")
  servings    Int
  difficulty  Difficulty
  authorId    String     @map("author_id")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")

  author      User       @relation(fields: [authorId], references: [id])
  ingredients Ingredient[]
  steps       Step[]

  @@map("recipes")
}

model Ingredient {
  id       String @id @default(uuid())
  name     String
  amount   String
  unit     String
  recipeId String @map("recipe_id")

  recipe   Recipe @relation(fields: [recipeId], references: [id], onDelete: Cascade)

  @@map("ingredients")
}

model Step {
  id          String @id @default(uuid())
  order       Int
  description String
  recipeId    String @map("recipe_id")

  recipe      Recipe @relation(fields: [recipeId], references: [id], onDelete: Cascade)

  @@map("steps")
}
```

### 6.2 Recipe 모듈 생성

```bash
pnpm dlx @nestjs/cli generate resource recipes
# REST API 선택
```

### 6.3 레시피 생성 DTO

```typescript
// src/recipes/dto/create-recipe.dto.ts
import { IsString, IsInt, IsEnum, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class IngredientDto {
  @IsString()
  name: string;

  @IsString()
  amount: string;

  @IsString()
  unit: string;
}

class StepDto {
  @IsInt()
  order: number;

  @IsString()
  description: string;
}

export class CreateRecipeDto {
  @IsString()
  title: string;

  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  cookingTime: number;

  @IsInt()
  @Min(1)
  servings: number;

  @IsEnum(['easy', 'medium', 'hard'])
  difficulty: 'easy' | 'medium' | 'hard';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredientDto)
  ingredients: IngredientDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepDto)
  steps: StepDto[];
}
```

### 6.4 Recipe Service 구현

```typescript
// src/recipes/recipes.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateRecipeDto) {
    return this.prisma.recipe.create({
      data: {
        title: dto.title,
        description: dto.description,
        cookingTime: dto.cookingTime,
        servings: dto.servings,
        difficulty: dto.difficulty,
        authorId: userId,
        ingredients: {
          create: dto.ingredients,
        },
        steps: {
          create: dto.steps,
        },
      },
      include: {
        ingredients: true,
        steps: { orderBy: { order: 'asc' } },
        author: { select: { id: true, name: true } },
      },
    });
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [recipes, total] = await Promise.all([
      this.prisma.recipe.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, name: true } },
        },
      }),
      this.prisma.recipe.count(),
    ]);

    return {
      data: recipes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: true,
        steps: { orderBy: { order: 'asc' } },
        author: { select: { id: true, name: true } },
      },
    });

    if (!recipe) {
      throw new NotFoundException('레시피를 찾을 수 없습니다');
    }

    return recipe;
  }
}
```

### 6.5 Frontend - 레시피 목록 페이지

```typescript
// src/app/recipes/page.tsx
import { api } from '@/lib/api';
import Link from 'next/link';

async function getRecipes() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recipes`, {
    cache: 'no-store',
  });
  return res.json();
}

export default async function RecipesPage() {
  const { data: recipes } = await getRecipes();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">레시피 목록</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {recipes.map((recipe: any) => (
          <Link
            key={recipe.id}
            href={`/recipes/${recipe.id}`}
            className="block bg-white rounded-lg shadow hover:shadow-lg transition"
          >
            <div className="p-4">
              <h2 className="text-xl font-semibold">{recipe.title}</h2>
              <p className="text-gray-600 mt-2">
                {recipe.cookingTime}분 · {recipe.servings}인분
              </p>
              <p className="text-sm text-gray-500 mt-2">
                by {recipe.author.name}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {recipes.length === 0 && (
        <p className="text-center text-gray-500">
          아직 레시피가 없습니다
        </p>
      )}
    </main>
  );
}
```

**체크포인트**: 레시피 CRUD가 정상 작동해야 합니다.

---

## Phase 7: 테스트

### 7.1 Backend 유닛 테스트 설정

```bash
cd apps/api

# Jest 설정 확인 (NestJS 기본 포함)
pnpm test
```

### 7.2 Service 테스트 작성

```typescript
// src/recipes/recipes.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { RecipesService } from './recipes.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RecipesService', () => {
  let service: RecipesService;
  let prisma: PrismaService;

  const mockPrisma = {
    recipe: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RecipesService>(RecipesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated recipes', async () => {
      const mockRecipes = [{ id: '1', title: 'Test Recipe' }];
      mockPrisma.recipe.findMany.mockResolvedValue(mockRecipes);
      mockPrisma.recipe.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(result.data).toEqual(mockRecipes);
      expect(result.meta.total).toBe(1);
    });
  });
});
```

### 7.3 E2E 테스트 설정

```bash
# e2e 패키지 생성
mkdir -p apps/e2e
cd apps/e2e
pnpm init

# Playwright 설치
pnpm add -D @playwright/test
pnpm dlx playwright install chromium
```

### 7.4 E2E 테스트 작성

```typescript
// tests/home.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display title', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Recipe Share');
  });

  test('should navigate to recipes', async ({ page }) => {
    await page.goto('/');
    await page.click('text=레시피');
    await expect(page).toHaveURL('/recipes');
  });
});
```

### 7.5 테스트 실행

```bash
# Unit tests
pnpm --filter @recipe-share/api test

# E2E tests
pnpm --filter @recipe-share/e2e test
```

**체크포인트**: 모든 테스트가 통과해야 합니다.

---

## Phase 8: 배포 준비

### 8.1 Production Dockerfile

```dockerfile
# docker/api/Dockerfile.prod
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/main.js"]
```

### 8.2 docker-compose.prod.yml

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: docker/api/Dockerfile.prod
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    ports:
      - '4000:4000'

  web:
    build:
      context: .
      dockerfile: docker/web/Dockerfile.prod
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    ports:
      - '3000:3000'
```

### 8.3 환경 변수 관리

```bash
# .env.production.example
DATABASE_URL=postgresql://user:password@db:5432/recipe_share
REDIS_HOST=redis
JWT_SECRET=production-secret-min-32-chars
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 8.4 CI/CD 파이프라인 (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

---

## 다음 단계

이 가이드를 완료한 후 추가할 수 있는 기능들:

1. **이미지 업로드** - AWS S3 또는 로컬 스토리지
2. **좋아요/북마크** - 사용자 상호작용
3. **댓글 시스템** - 레시피 피드백
4. **검색 기능** - 전문 검색 (Elasticsearch)
5. **알림 시스템** - WebSocket 실시간 알림
6. **소셜 로그인** - OAuth (Google, Kakao)
7. **모니터링** - Prometheus + Grafana
8. **로깅** - Winston + ELK Stack

---

## 트러블슈팅

### 자주 발생하는 문제

1. **Prisma 마이그레이션 실패**
   ```bash
   # DB 초기화
   pnpm dlx prisma migrate reset
   ```

2. **포트 충돌**
   ```bash
   # 사용 중인 포트 확인
   lsof -i :3000
   lsof -i :4000
   ```

3. **Docker 볼륨 문제**
   ```bash
   # 볼륨 정리
   docker compose down -v
   ```

4. **pnpm 의존성 문제**
   ```bash
   # 캐시 정리 후 재설치
   pnpm store prune
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

---

## 참고 자료

- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Docker Documentation](https://docs.docker.com)
