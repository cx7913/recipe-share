# Recipe Share - 빠른 시작 가이드

5분 안에 개발 환경을 구축하는 가이드입니다.

## 사전 요구사항

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

## 1. 프로젝트 클론

```bash
git clone <repository-url>
cd recipe-share
```

## 2. 의존성 설치

```bash
pnpm install
```

## 3. 환경 변수 설정

```bash
# API 환경 변수
cp apps/api/.env.example apps/api/.env
```

## 4. 개발 환경 실행

### 옵션 A: Docker 사용 (권장)

```bash
# 모든 서비스 실행
pnpm docker:dev:build

# 로그 확인
pnpm docker:dev:logs
```

접속:
- Web: http://localhost:3000
- API: http://localhost:4000
- API Docs: http://localhost:4000/api

### 옵션 B: 로컬 실행

```bash
# 1. DB만 Docker로 실행
docker compose up -d postgres redis

# 2. DB 마이그레이션
pnpm db:migrate

# 3. 시드 데이터 (선택)
pnpm db:seed

# 4. 개발 서버 실행
pnpm dev
```

## 5. 동작 확인

```bash
# Health check
curl http://localhost:4000/health

# API 문서 확인
open http://localhost:4000/api
```

## 6. 테스트 실행

```bash
# Unit tests
pnpm test

# E2E tests (Chromium만)
pnpm test:e2e
```

## 유용한 명령어

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 로컬 개발 서버 실행 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm lint` | 코드 린트 검사 |
| `pnpm test` | 유닛 테스트 |
| `pnpm test:e2e` | E2E 테스트 |
| `pnpm docker:dev` | Docker 개발 환경 |
| `pnpm docker:dev:down` | Docker 환경 중지 |
| `pnpm docker:dev:clean` | Docker 환경 완전 삭제 |
| `make help` | Makefile 명령어 목록 |

## 문제 해결

### 포트 충돌
```bash
# 사용 중인 포트 확인
lsof -i :3000
lsof -i :4000

# 프로세스 종료
kill -9 <PID>
```

### Docker 문제
```bash
# 컨테이너 재시작
pnpm docker:dev:down
pnpm docker:dev:build
```

### 의존성 문제
```bash
# 클린 설치
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 다음 단계

- [단계별 구축 가이드](./STEP_BY_STEP_GUIDE.md) - 처음부터 만들기
- [체크리스트](./CHECKLIST.md) - 구현 진행 상황 추적
- [API 문서](http://localhost:4000/api) - Swagger UI
