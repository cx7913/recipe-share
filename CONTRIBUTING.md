# Contributing to Recipe Share

Recipe Share 프로젝트에 기여해 주셔서 감사합니다.

## 개발 환경 설정

### 필수 요구사항
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose

### 로컬 환경 설정

```bash
# 저장소 클론
git clone <repository-url>
cd recipe-share

# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env

# 데이터베이스 시작
pnpm db:up

# 마이그레이션 및 시드
pnpm db:migrate
pnpm db:seed

# 개발 서버 실행
pnpm dev
```

## 브랜치 전략

- `main` - 프로덕션 브랜치
- `develop` - 개발 브랜치
- `feature/*` - 새 기능 개발
- `fix/*` - 버그 수정
- `docs/*` - 문서 작업

### 브랜치 네이밍 예시
```
feature/add-recipe-search
fix/login-token-refresh
docs/update-api-docs
```

## 커밋 메시지 규칙

[Conventional Commits](https://www.conventionalcommits.org/) 형식을 따릅니다.

```
<type>(<scope>): <subject>

<body>
```

### Type
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅 (기능 변경 없음)
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드, 설정 변경

### Scope
- `web`: 프론트엔드 관련
- `api`: 백엔드 관련
- `db`: 데이터베이스 관련
- `auth`: 인증 관련
- `recipe`: 레시피 기능 관련

### 예시
```
feat(api): 레시피 검색 API 추가
fix(web): 로그인 후 리다이렉트 오류 수정
docs(api): Swagger 문서 업데이트
```

## Pull Request 가이드

1. `develop` 브랜치에서 새 브랜치 생성
2. 변경사항 구현 및 테스트
3. 린트 검사 통과 확인: `pnpm lint`
4. 테스트 통과 확인: `pnpm test`
5. PR 생성 시 템플릿 작성

### PR 체크리스트
- [ ] 관련 이슈 연결
- [ ] 테스트 코드 작성/수정
- [ ] 문서 업데이트 (필요시)
- [ ] 린트 및 테스트 통과

## 코드 스타일

### TypeScript
- strict 모드 사용
- 명시적 타입 선언 권장
- any 타입 사용 지양

### Frontend (Next.js)
- App Router 패턴 준수
- 서버/클라이언트 컴포넌트 구분
- Zustand로 전역 상태 관리

### Backend (NestJS)
- 모듈 기반 구조 유지
- DTO로 요청/응답 검증
- Prisma를 통한 데이터베이스 접근

## 테스트

```bash
# 전체 테스트
pnpm test

# 백엔드 테스트 (watch 모드)
pnpm --filter @recipe-share/api test:watch

# 커버리지 리포트
pnpm --filter @recipe-share/api test:cov
```

## 이슈 보고

버그 리포트나 기능 요청은 GitHub Issues를 통해 제출해 주세요.
이슈 템플릿을 사용하여 필요한 정보를 제공해 주시면 빠른 처리에 도움이 됩니다.

## 질문

개발 관련 질문은 GitHub Discussions를 이용해 주세요.
