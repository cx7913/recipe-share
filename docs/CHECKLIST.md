# Recipe Share - 구현 체크리스트

각 단계별로 완료 여부를 체크하세요.

## Phase 1: 프로젝트 초기 설정

- [ ] 모노레포 디렉토리 구조 생성
- [ ] pnpm workspace 설정
- [ ] 루트 package.json 작성
- [ ] .gitignore 설정
- [ ] .editorconfig 설정
- [ ] `pnpm install` 성공

**검증 명령어:**
```bash
pnpm install
# 에러 없이 완료되어야 함
```

---

## Phase 2: 개발 인프라 구축

- [ ] docker-compose.yml 작성
- [ ] PostgreSQL 컨테이너 실행
- [ ] Redis 컨테이너 실행
- [ ] .env.example 작성

**검증 명령어:**
```bash
docker compose up -d
docker compose ps
# postgres, redis 모두 running 상태
```

---

## Phase 3: Backend API 기초

- [ ] NestJS 프로젝트 생성
- [ ] Prisma 설치 및 초기화
- [ ] User 스키마 정의
- [ ] 첫 번째 마이그레이션 실행
- [ ] Health Check 엔드포인트 생성
- [ ] API 서버 실행 확인

**검증 명령어:**
```bash
curl http://localhost:4000/health
# {"status":"ok",...} 응답
```

---

## Phase 4: Frontend 기초

- [ ] Next.js 프로젝트 생성
- [ ] Tailwind CSS 설정
- [ ] 기본 레이아웃 작성
- [ ] 홈페이지 작성
- [ ] API 클라이언트 설정
- [ ] Frontend 서버 실행 확인

**검증 명령어:**
```bash
curl http://localhost:3000
# HTML 응답
```

---

## Phase 5: 인증 시스템

### Backend
- [ ] JWT, Passport 패키지 설치
- [ ] Auth 모듈 생성
- [ ] RegisterDto 작성
- [ ] LoginDto 작성
- [ ] AuthService 구현
- [ ] AuthController 구현
- [ ] JwtStrategy 구현
- [ ] AuthGuard 적용

### Frontend
- [ ] AuthContext 생성
- [ ] 회원가입 페이지
- [ ] 로그인 페이지
- [ ] 로그아웃 기능
- [ ] 인증 상태 표시 (Header)

**검증:**
```bash
# 회원가입 테스트
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트","email":"test@test.com","password":"password123"}'
# 토큰 응답
```

---

## Phase 6: 핵심 기능 구현

### Backend
- [ ] Recipe 스키마 정의
- [ ] Ingredient 스키마 정의
- [ ] Step 스키마 정의
- [ ] 마이그레이션 실행
- [ ] CreateRecipeDto 작성
- [ ] UpdateRecipeDto 작성
- [ ] RecipesService 구현
- [ ] RecipesController 구현

### Frontend
- [ ] 레시피 목록 페이지
- [ ] 레시피 상세 페이지
- [ ] 레시피 작성 페이지
- [ ] 레시피 수정 페이지
- [ ] 레시피 삭제 기능

**검증:**
```bash
# 레시피 목록 조회
curl http://localhost:4000/recipes
# 레시피 배열 응답
```

---

## Phase 7: 테스트

### Unit Tests
- [ ] Jest 설정 확인
- [ ] AuthService 테스트
- [ ] RecipesService 테스트
- [ ] 모든 유닛 테스트 통과

### E2E Tests
- [ ] Playwright 설치
- [ ] 홈페이지 테스트
- [ ] 인증 플로우 테스트
- [ ] 레시피 CRUD 테스트
- [ ] 모든 E2E 테스트 통과

**검증 명령어:**
```bash
pnpm test        # Unit tests
pnpm test:e2e    # E2E tests
```

---

## Phase 8: 배포 준비

- [ ] Production Dockerfile (API)
- [ ] Production Dockerfile (Web)
- [ ] docker-compose.prod.yml
- [ ] .env.production.example
- [ ] CI/CD 파이프라인 (선택)
- [ ] Production 빌드 성공

**검증 명령어:**
```bash
pnpm docker:prod:build
# 모든 이미지 빌드 성공
```

---

## 선택적 기능

- [ ] 이미지 업로드 (S3/Local)
- [ ] 좋아요 기능
- [ ] 북마크 기능
- [ ] 댓글 시스템
- [ ] 검색 기능
- [ ] 카테고리 필터
- [ ] 페이지네이션 UI
- [ ] 반응형 디자인
- [ ] 다크 모드
- [ ] PWA 지원

---

## 품질 체크리스트

### 코드 품질
- [ ] ESLint 에러 없음
- [ ] Prettier 포맷 적용
- [ ] TypeScript strict 모드
- [ ] 타입 에러 없음

### 보안
- [ ] 환경 변수로 시크릿 관리
- [ ] CORS 설정
- [ ] 입력 검증 (class-validator)
- [ ] SQL Injection 방지 (Prisma)
- [ ] XSS 방지

### 성능
- [ ] Docker 빌드 캐싱
- [ ] 볼륨 마운트 최적화
- [ ] 이미지 사이즈 최적화
- [ ] API 응답 시간 < 200ms

---

## 최종 검증

```bash
# 1. 전체 테스트
pnpm test:all

# 2. Lint 검사
pnpm lint

# 3. 빌드 검사
pnpm build

# 4. Docker 실행
pnpm docker:dev:build

# 5. 수동 테스트
# - 회원가입/로그인
# - 레시피 작성
# - 레시피 조회
# - 레시피 수정/삭제
```

모든 항목이 체크되면 MVP 완성입니다! 🎉
