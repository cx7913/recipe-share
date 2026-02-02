# Recipe Share

레시피 공유 서비스 - Monorepo

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | NestJS, TypeScript, Prisma |
| Database | PostgreSQL, Redis |
| Authentication | JWT (Access + Refresh Token) |
| Storage | Local / AWS S3 (전환 가능) |

## 프로젝트 구조

```
recipe-share/
├── apps/
│   ├── web/          # Next.js 14 프론트엔드
│   └── api/          # NestJS 백엔드
├── packages/
│   └── shared/       # 공유 타입/유틸리티
├── docker-compose.yml
└── pnpm-workspace.yaml
```

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
```

### 3. 데이터베이스 실행

```bash
pnpm db:up
```

### 4. 데이터베이스 마이그레이션

```bash
cd apps/api
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 5. 개발 서버 실행

```bash
# 전체 실행
pnpm dev

# 개별 실행
pnpm dev:web   # Frontend (http://localhost:3000)
pnpm dev:api   # Backend (http://localhost:4000)
```

## API 문서

- Swagger UI: http://localhost:4000/api/docs

## 주요 기능

- **회원**: 가입, 로그인, JWT 인증
- **레시피**: CRUD, 이미지 업로드, 좋아요
- **검색**: 제목/설명 검색, 카테고리 필터

## 이미지 업로드

`.env`에서 `STORAGE_TYPE` 설정:

```bash
# 로컬 저장
STORAGE_TYPE=local

# S3 저장 (AWS 설정 필요)
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=your-bucket
```
