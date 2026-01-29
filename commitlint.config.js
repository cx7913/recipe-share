module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // type 규칙
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 새로운 기능
        'fix',      // 버그 수정
        'docs',     // 문서 변경
        'style',    // 코드 포맷팅 (기능 변경 없음)
        'refactor', // 리팩토링
        'test',     // 테스트 추가/수정
        'chore',    // 빌드, 설정 변경
        'perf',     // 성능 개선
        'ci',       // CI 설정 변경
        'revert',   // 커밋 되돌리기
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    // scope 규칙 (선택사항)
    'scope-enum': [
      1,
      'always',
      [
        'web',      // 프론트엔드
        'api',      // 백엔드
        'db',       // 데이터베이스
        'auth',     // 인증
        'recipe',   // 레시피 기능
        'upload',   // 파일 업로드
        'deps',     // 의존성
        'config',   // 설정
      ],
    ],
    'scope-case': [2, 'always', 'lower-case'],

    // subject 규칙
    'subject-empty': [2, 'never'],
    'subject-max-length': [2, 'always', 100],

    // body 규칙
    'body-max-line-length': [1, 'always', 100],

    // header 규칙
    'header-max-length': [2, 'always', 100],
  },
};
