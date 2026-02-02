# 레시피 공유 서비스 - 기술적 리스크 분석 보고서

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | Recipe Share (레시피 공유 서비스) |
| **아키텍처** | 모노레포 (pnpm workspace) |
| **Frontend** | Next.js 14 + TypeScript |
| **Backend** | NestJS + TypeScript + Prisma |
| **Database** | PostgreSQL (단일) + Redis |
| **인증** | JWT (Access + Refresh Token) |
| **스토리지** | Local → S3 전환 구조 |
| **팀 구성** | 풀스택 개발자 2명 |
| **기간** | 3개월 (12주) |

---

## 리스크 요약 매트릭스

| ID | 리스크 항목 | 발생 가능성 | 영향도 | 위험 등급 | 카테고리 |
|----|------------|-------------|--------|-----------|----------|
| R1 | 이미지 업로드 용량/성능 이슈 | **높음** | 높음 | **Critical** | 기능 |
| R2 | JWT 토큰 보안 취약점 | 중간 | **치명적** | **High** | 보안 |
| R3 | PostgreSQL 단일 장애점 | 중간 | 높음 | **High** | 인프라 |
| R4 | 팀 리소스 부족 (2인 개발) | **높음** | 중간 | **High** | 일정 |
| R5 | Next.js 14 App Router 학습 곡선 | 중간 | 중간 | **Medium** | 기술 |
| R6 | 레시피 검색 성능 저하 | 중간 | 중간 | **Medium** | 성능 |
| R7 | S3 전환 시 마이그레이션 이슈 | 낮음 | 중간 | **Medium** | 인프라 |
| R8 | Prisma ORM 성능 한계 | 낮음 | 중간 | **Low** | 성능 |
| R9 | Redis 세션 관리 장애 | 낮음 | 높음 | **Medium** | 인프라 |
| R10 | 모노레포 빌드/배포 복잡성 | 중간 | 낮음 | **Low** | 개발 |

---

## 상세 리스크 분석

### R1. 이미지 업로드 용량/성능 이슈 - Critical

#### 현황 분석

```typescript
// 현재 설계: upload.service.ts
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// 설정된 제한
MAX_FILE_SIZE=10485760  // 10MB
```

#### 리스크 설명
- 레시피당 썸네일 1장 + 조리 단계별 이미지 (평균 5-10장)
- 고해상도 이미지 업로드 시 스토리지 급증
- 이미지 로딩 시간으로 인한 UX 저하
- 로컬 스토리지 용량 한계

#### 영향 범위
```
레시피 1,000개 × 평균 6장 × 5MB = 약 30GB
일일 신규 레시피 50개 가정 시, 월간 약 9GB 증가
```

#### 대응 방안

**즉시 조치 (개발 중)**
```typescript
// 이미지 리사이징 미들웨어 추가
import sharp from 'sharp';

async resizeImage(buffer: Buffer, maxWidth = 1200): Promise<Buffer> {
  return sharp(buffer)
    .resize(maxWidth, null, { withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
}

// 썸네일 자동 생성
async generateThumbnail(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(400, 300, { fit: 'cover' })
    .jpeg({ quality: 70 })
    .toBuffer();
}
```

**단기 조치 (1개월)**
- 이미지 CDN 적용 (CloudFront)
- Lazy Loading 구현
- WebP 포맷 자동 변환

**중기 조치 (런칭 후)**
- 이미지 최적화 서비스 도입 (Cloudinary, imgix)
- 사용자별 스토리지 쿼터 설정

---

### R2. JWT 토큰 보안 취약점 - High

#### 현황 분석

```typescript
// 현재 설계: auth.service.ts
const accessToken = this.jwtService.sign(payload);  // 7d 만료
const refreshToken = this.jwtService.sign(payload, {
  expiresIn: '30d',
});

// Redis에 refreshToken 저장
await this.redisService.set(`refresh:${userId}`, refreshToken, refreshExpiresIn);
```

#### 리스크 설명
- Access Token 만료 시간 7일은 과도하게 김
- Refresh Token 탈취 시 장기간 악용 가능
- 토큰 블랙리스트 미구현
- XSS 공격 시 localStorage 토큰 노출

#### 대응 방안

**보안 강화 설정**
```typescript
// 권장 설정
JWT_EXPIRES_IN=15m        // Access Token: 15분
JWT_REFRESH_EXPIRES_IN=7d // Refresh Token: 7일

// 토큰 블랙리스트 구현
async logout(userId: string, accessToken: string) {
  // Refresh Token 삭제
  await this.redisService.del(`refresh:${userId}`);

  // Access Token 블랙리스트 추가 (남은 만료 시간만큼)
  const decoded = this.jwtService.decode(accessToken);
  const ttl = decoded.exp - Math.floor(Date.now() / 1000);
  if (ttl > 0) {
    await this.redisService.set(`blacklist:${accessToken}`, '1', ttl);
  }
}

// 블랙리스트 검증 미들웨어
async validateToken(token: string): Promise<boolean> {
  const isBlacklisted = await this.redisService.exists(`blacklist:${token}`);
  return !isBlacklisted;
}
```

**클라이언트 측 보안**
```typescript
// httpOnly 쿠키 사용 권장
// apps/web/src/lib/api.ts 수정
this.client = axios.create({
  baseURL: API_URL,
  withCredentials: true,  // 쿠키 전송
});

// 백엔드: 쿠키로 토큰 전달
response.cookie('accessToken', accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000, // 15분
});
```

---

### R3. PostgreSQL 단일 장애점 (SPOF) - High

#### 현황 분석

```yaml
# docker-compose.yml
postgres:
  image: postgres:16-alpine
  container_name: recipe-share-postgres
  # 단일 인스턴스, 복제본 없음
```

```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // 단일 연결
}
```

#### 리스크 설명
- DB 장애 시 전체 서비스 중단
- 데이터 백업 정책 미수립
- 개발/스테이징/프로덕션 환경 분리 미흡

#### 대응 방안

**MVP 단계 (즉시)**
```yaml
# docker-compose.yml에 백업 추가
postgres-backup:
  image: postgres:16-alpine
  depends_on:
    - postgres
  volumes:
    - ./backups:/backups
  entrypoint: |
    sh -c 'while true; do
      pg_dump -h postgres -U recipe_user recipe_share > /backups/backup_$$(date +%Y%m%d_%H%M%S).sql
      sleep 21600
    done'
```

**런칭 전 (11주차)**
```
개발: docker-compose (로컬)
스테이징: 클라우드 단일 인스턴스
프로덕션: 클라우드 Managed DB (RDS, Cloud SQL)
         - 자동 백업 활성화
         - 읽기 복제본 1개
```

---

### R4. 팀 리소스 부족 (2인 개발) - High

#### 현황 분석

```
프로젝트 범위:
- 백엔드: 11개 주요 작업 (인증, 레시피, 업로드, 검색 등)
- 프론트엔드: 11개 주요 작업 (10개 페이지 + 공통 컴포넌트)
- 인프라: CI/CD, Docker, 배포

개발자 2명 × 12주 = 24 man-weeks
실제 개발 시간: 약 20 man-weeks (회의, 리뷰 등 제외)
```

#### 리스크 설명
- 개발자 1명 부재 시 50% 생산성 저하
- 코드 리뷰 품질 저하 (상호 리뷰 한계)
- 병렬 작업 시 병합 충돌 증가
- 번아웃 위험

#### 대응 방안

**기능 우선순위 재조정**
```
P0 (Must): 인증, 레시피 CRUD, 이미지 업로드, 기본 UI
P1 (Should): 검색, 좋아요, 마이페이지
P2 (Could): 댓글, 다크모드, 반응형 완성도
P3 (Won't): 소셜 로그인, 추천, 알림 (MVP 제외)
```

**효율화 전략**
```
1. UI 라이브러리 활용: shadcn/ui, Radix UI
2. 보일러플레이트 최소화: NestJS CLI, Next.js 템플릿
3. 테스트 범위 조정: 핵심 로직만 단위 테스트
4. 주간 스프린트 리뷰로 조기 리스크 감지
```

---

### R5. Next.js 14 App Router 학습 곡선 - Medium

#### 현황 분석

```typescript
// 현재 설계: apps/web/src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
```

#### 리스크 설명
- App Router는 Pages Router와 다른 패러다임
- Server Components vs Client Components 혼동
- 데이터 페칭 패턴 변화 (getServerSideProps → fetch)
- 캐싱 전략 복잡성

#### 대응 방안

**컨벤션 문서화**
```markdown
## 컴포넌트 분류 규칙

### Server Component (기본값)
- 데이터 페칭이 필요한 페이지
- SEO가 중요한 콘텐츠
- 예: 레시피 목록, 상세 페이지

### Client Component ('use client')
- 상태 관리 (useState, useEffect)
- 이벤트 핸들러 (onClick, onChange)
- 브라우저 API 사용
- 예: 좋아요 버튼, 폼, 모달
```

**폴더 구조 표준화**
```
src/app/
├── (auth)/           # 인증 관련 (layout 공유)
│   ├── login/
│   └── register/
├── recipes/
│   ├── page.tsx      # Server Component (목록)
│   ├── [id]/
│   │   └── page.tsx  # Server Component (상세)
│   └── new/
│       └── page.tsx  # Client Component (작성)
└── components/
    ├── server/       # Server Components
    └── client/       # Client Components
```

---

### R6. 레시피 검색 성능 저하 - Medium

#### 현황 분석

```typescript
// 현재 설계: recipes.service.ts
if (search) {
  where.OR = [
    { title: { contains: search, mode: 'insensitive' } },
    { description: { contains: search, mode: 'insensitive' } },
  ];
}
```

#### 리스크 설명
- LIKE 쿼리는 인덱스 활용 불가 (앞에 와일드카드)
- 레시피 증가 시 검색 속도 저하
- 재료 검색 미지원
- 한글 형태소 분석 부재

#### 대응 방안

**단기 (MVP)**
```sql
-- PostgreSQL Full-Text Search 인덱스
CREATE INDEX idx_recipes_search ON recipes
USING gin(to_tsvector('simple', title || ' ' || description));

-- Prisma raw query
const recipes = await prisma.$queryRaw`
  SELECT * FROM recipes
  WHERE to_tsvector('simple', title || ' ' || description)
        @@ plainto_tsquery('simple', ${search})
  ORDER BY ts_rank(...) DESC
  LIMIT ${limit}
`;
```

**중기 (런칭 후)**
```
검색 고도화 옵션:
1. Elasticsearch / Meilisearch 도입
2. 재료 기반 검색
3. 자동완성 (Typeahead)
4. 인기 검색어
```

---

### R7. S3 전환 시 마이그레이션 이슈 - Medium

#### 현황 분석

```typescript
// 현재 설계: storage.interface.ts
export interface StorageService {
  upload(file: Express.Multer.File, folder: string): Promise<string>;
  delete(fileUrl: string): Promise<void>;
}

// Local과 S3 구현체 분리 (Good!)
// STORAGE_TYPE 환경변수로 전환 가능
```

#### 리스크 설명
- 기존 로컬 이미지 URL 변경 필요
- DB에 저장된 URL 일괄 업데이트
- 전환 중 이미지 접근 불가 시간
- S3 권한/CORS 설정 실수

#### 대응 방안

**무중단 마이그레이션 전략**
```
1. S3 버킷 생성 및 설정
2. 신규 업로드만 S3로 전환 (STORAGE_TYPE=s3)
3. 배치로 기존 이미지 S3 복사
4. DB URL 일괄 업데이트 (트랜잭션)
5. 로컬 파일 삭제 (검증 후)
```

**URL 호환성 유지**
```typescript
// 이미지 URL 정규화 유틸리티
function normalizeImageUrl(url: string): string {
  // 로컬 URL을 S3 URL로 변환
  if (url.startsWith('http://localhost:4000/uploads/')) {
    const path = url.replace('http://localhost:4000/uploads/', '');
    return `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${path}`;
  }
  return url;
}
```

---

### R9. Redis 세션 관리 장애 - Medium

#### 현황 분석

```typescript
// 현재 설계: redis.service.ts
this.client = new Redis({
  host: this.configService.get('REDIS_HOST', 'localhost'),
  port: this.configService.get('REDIS_PORT', 6379),
});

// Refresh Token 저장
await this.redisService.set(`refresh:${userId}`, refreshToken, refreshExpiresIn);
```

#### 리스크 설명
- Redis 장애 시 토큰 갱신 불가
- 모든 사용자 로그아웃 상태
- 단일 인스턴스 (복제본 없음)

#### 대응 방안

**Fallback 전략**
```typescript
// Redis 장애 시 graceful degradation
async refreshToken(refreshToken: string) {
  try {
    const storedToken = await this.redisService.get(`refresh:${payload.sub}`);
    if (storedToken !== refreshToken) {
      throw new UnauthorizedException();
    }
  } catch (error) {
    if (error instanceof RedisConnectionError) {
      // Redis 장애 시 토큰 자체 검증만 수행
      console.warn('Redis unavailable, skipping token store validation');
    } else {
      throw error;
    }
  }
  // ... 토큰 갱신 로직
}
```

---

## 리스크 대응 우선순위

### 즉시 조치 (개발 중)

| 순위 | 리스크 | 조치 사항 | 담당 |
|------|--------|----------|------|
| 1 | R1 | 이미지 리사이징 미들웨어 추가 | B |
| 2 | R2 | JWT 만료 시간 단축 (15분/7일) | B |
| 3 | R4 | 기능 우선순위 재조정 (P0~P3) | A, B |
| 4 | R5 | 컴포넌트 분류 컨벤션 문서화 | A |

### 단기 조치 (테스트 단계)

| 순위 | 리스크 | 조치 사항 | 담당 |
|------|--------|----------|------|
| 5 | R2 | 토큰 블랙리스트 구현 | B |
| 6 | R6 | PostgreSQL Full-Text Search 적용 | A |
| 7 | R3 | 자동 백업 스크립트 구성 | B |
| 8 | R9 | Redis Fallback 로직 추가 | B |

### 런칭 전 조치 (11-12주차)

| 순위 | 리스크 | 조치 사항 | 담당 |
|------|--------|----------|------|
| 9 | R7 | S3 마이그레이션 실행 | B |
| 10 | R3 | 프로덕션 Managed DB 설정 | A |
| 11 | R1 | CDN 적용 | A |

---

## 모니터링 지표

### 핵심 지표 (MVP)

| 지표 | 임계값 | 알림 |
|------|--------|------|
| API 응답 시간 | > 500ms | Warning |
| API 에러율 | > 1% | Critical |
| DB 연결 실패 | > 0 | Critical |
| Redis 연결 실패 | > 0 | Warning |
| 이미지 업로드 실패율 | > 5% | Warning |
| JWT 갱신 실패율 | > 1% | Warning |

### 모니터링 도구

```
로깅: Winston + 파일/콘솔 출력
에러 트래킹: Sentry (런칭 시)
APM: 추후 도입 (런칭 후)
```

---

## 결론

### 전체 리스크 현황

```
Critical: 1개 (이미지 업로드)
High:     3개 (JWT 보안, DB SPOF, 팀 리소스)
Medium:   4개 (App Router, 검색, S3 전환, Redis)
Low:      2개 (Prisma, 모노레포)
```

### 핵심 권장사항

1. **이미지 처리 강화**: 리사이징 필수, CDN 권장
2. **보안 설정 조정**: JWT 만료 15분, 블랙리스트 구현
3. **기능 범위 조정**: P0/P1 집중, P2 선택적
4. **컨벤션 문서화**: App Router, 코드 스타일

### 수용 가능한 리스크

- R8 (Prisma 성능): MVP 규모에서 문제없음
- R10 (모노레포 복잡성): Turborepo 도입 시 해결

---

*작성일: 2026-01-29*
*검토 주기: 스프린트마다 (2주)*
