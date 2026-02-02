# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

### Quick Start
```bash
pnpm install              # Install all dependencies
pnpm db:up                # Start PostgreSQL and Redis containers
pnpm db:migrate           # Run database migrations
pnpm db:seed              # Seed initial data
pnpm dev                  # Run all dev servers in parallel
```

### Running Services Individually
```bash
pnpm dev:web              # Frontend only (port 3000)
pnpm dev:api              # Backend only (port 4000)
```

### Database Operations
```bash
pnpm db:studio            # Open Prisma Studio GUI
pnpm --filter @recipe-share/api db:generate  # Regenerate Prisma client after schema changes
```

### Testing

**Unit & Integration Tests (Jest)**
```bash
pnpm test                 # Run all tests (API + Web)
pnpm test:api             # Run API tests only
pnpm test:web             # Run Web tests only
pnpm test:cov             # Run tests with coverage (all)
pnpm test:cov:api         # API coverage report
pnpm test:cov:web         # Web coverage report
pnpm --filter @recipe-share/api test:watch   # Watch mode for backend tests
```

**E2E Tests (Playwright)**
```bash
pnpm test:e2e             # Run all E2E tests
pnpm test:e2e:headed      # Run with browser visible
pnpm test:e2e:ui          # Run with Playwright UI
pnpm --filter @recipe-share/e2e test:chromium    # Run on Chromium only
pnpm --filter @recipe-share/e2e test:firefox     # Run on Firefox only
pnpm --filter @recipe-share/e2e test:mobile      # Run mobile tests
pnpm --filter @recipe-share/e2e report           # Open HTML report
pnpm --filter @recipe-share/e2e codegen          # Generate tests interactively
```

**Test Locations**
- API unit tests: `apps/api/src/**/*.spec.ts`
- Web component tests: `apps/web/src/__tests__/**/*.test.tsx`
- E2E tests: `e2e/tests/**/*.spec.ts`

### Building
```bash
pnpm build                # Build all packages
pnpm build:web            # Build frontend only
pnpm build:api            # Build backend only
```

### Docker Development Environment
```bash
pnpm docker:dev           # Start all services with hot reload
pnpm docker:dev:build     # Rebuild and start all services
pnpm docker:dev:down      # Stop all services
pnpm docker:dev:logs      # View all logs
pnpm docker:dev:logs:api  # View API logs only
pnpm docker:dev:logs:web  # View Web logs only
pnpm docker:dev:clean     # Remove containers, volumes, and images
```

### Docker Production Environment
```bash
# Setup: copy .env.production.example to .env.production and configure
pnpm docker:prod          # Start production services (detached)
pnpm docker:prod:build    # Rebuild and start production services
pnpm docker:prod:down     # Stop production services
pnpm docker:prod:logs     # View production logs
pnpm docker:prod:ps       # Show running containers
pnpm docker:prod:clean    # Remove all containers, volumes, and images
```

## Architecture Overview

This is a **pnpm monorepo** with two main applications:

### Frontend (`apps/web`)
- **Next.js 14 with App Router** - Server-first React framework
- **Zustand** for global state management
- **React Hook Form + Zod** for form handling and validation
- **Axios** client with automatic JWT refresh interceptor
- API client singleton at `src/lib/api.ts`

### Backend (`apps/api`)
- **NestJS** with modular architecture
- **Prisma ORM** for PostgreSQL
- **Redis** for session/cache storage
- **Swagger UI** available at `/api/docs`

### Module Structure (Backend)
- `auth/` - JWT authentication with Passport.js (access + refresh tokens)
- `recipes/` - Recipe CRUD with categories, ingredients, steps, likes
- `upload/` - File uploads with pluggable storage (local or S3)
- `users/` - User profile management
- `common/prisma/` - Global database service
- `common/redis/` - Global cache service

### Authentication Flow
1. User authenticates → receives access token (7d) + refresh token (30d)
2. Tokens stored in localStorage (frontend)
3. Axios interceptor auto-refreshes on 401 responses
4. Refresh tokens stored in Redis (backend)

### Storage Abstraction
The `upload/` module uses a `StorageService` interface with two implementations:
- `LocalStorageService` - Development/MVP
- `S3StorageService` - Production

Switch via `STORAGE_TYPE` environment variable.

## Key Files

- `apps/api/prisma/schema.prisma` - Database schema (User, Recipe, Category, Ingredient, Step, Like)
- `apps/api/src/main.ts` - NestJS entry point with Swagger setup
- `apps/web/src/lib/api.ts` - Frontend API client with interceptors
- `.env.example` - All required environment variables

## Environment Setup

Copy `.env.example` to `.env` and configure:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET` - Authentication secrets
- `STORAGE_TYPE` - `local` or `s3`
- `NEXT_PUBLIC_API_URL` - Backend URL for frontend

## Ports

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`
- Swagger Docs: `http://localhost:4000/api/docs`
- Prisma Studio: `http://localhost:5555` (when running db:studio)

## Documentation

- [빠른 시작 가이드](./docs/QUICK_START.md) - 5분 안에 개발 환경 구축
- [단계별 구축 가이드](./docs/STEP_BY_STEP_GUIDE.md) - 처음부터 프로젝트 만들기
- [구현 체크리스트](./docs/CHECKLIST.md) - 진행 상황 추적

## Makefile Commands

Docker 작업을 위한 편의 명령어:

```bash
make help           # 사용 가능한 모든 명령어 보기
make dev            # 개발 환경 실행
make dev-build      # 개발 환경 빌드 후 실행
make dev-clean      # 개발 환경 완전 삭제
make db-shell       # PostgreSQL 쉘 접속
make redis-shell    # Redis CLI 접속
```
