# api

백엔드 API 서버 (포트 4000). DB는 Postgres + Prisma, 인증은 Supabase Auth. Node 22.9 이상 필요

## 구조

```
src/
├─ server.js          # 포트 열기
├─ app.js             # express 설정, /api/v1 라우터 등록, 에러 핸들러
├─ routes/            # URL → 컨트롤러 연결 (auth.routes.js, health.routes.js)
├─ controllers/       # 요청 본문 검사(superstruct), 응답 형태 결정 (auth.controller.js)
├─ services/          # 비즈니스 로직, Supabase·DB 조합 (auth.service.js)
├─ repositories/      # Prisma 쿼리 (user.repository.js)
├─ middlewares/       # error-handler
└─ lib/               # prisma, supabase 클라이언트, ApiError
```

파일 이름은 `{도메인}.{계층}.js`로 통일한다 (`auth.routes.js`, `auth.controller.js`, `auth.service.js`, `user.repository.js`). 새 도메인은 같은 규칙으로 파일을 추가한다.

## 응답 규약

- 성공: `{ "data": ... }`
- 실패: `{ "code": "UPPER_SNAKE", "message": "설명" }` (docs/conventions.md §3)

## 테스트

- `test/health.http`: 서버 상태, 404
- `test/auth.http`: 회원가입(201·409·400), 로그인(200·401·400), 토큰 재발급·로그아웃(CSRF 헤더 필요, 403), 소셜 콜백(401) 케이스
