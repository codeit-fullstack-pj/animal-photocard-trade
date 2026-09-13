# api

백엔드 API 서버 (포트 4000). DB는 Postgres + Prisma, 인증은 Supabase Auth. Node 22.9 이상 필요

## 구조

```
src/
├─ server.js          # 포트 열기
├─ app.js             # express 설정, /api/v1 라우터 등록, 에러 핸들러
├─ routes/            # URL → 컨트롤러 연결 (auth.routes.js, health.routes.js, image.routes.js)
├─ controllers/       # 요청 본문 검사(superstruct), 응답 형태 결정 (auth.controller.js, image.controller.js)
├─ services/          # 비즈니스 로직, Supabase·DB 조합 (auth.service.js, image.service.js)
├─ repositories/      # Prisma 쿼리 (user.repository.js, image.repository.js)
├─ middlewares/       # error-handler, csrf, require-auth (로그인 여부 확인, req.user 채움)
└─ lib/               # prisma, supabase 클라이언트, ApiError, score-config (관상 지수 축 정의)
```

파일 이름은 `{도메인}.{계층}.js`로 통일한다 (`auth.routes.js`, `auth.controller.js`, `auth.service.js`, `user.repository.js`). 새 도메인은 같은 규칙으로 파일을 추가한다.

## 응답 규약

- 성공: `{ "data": ... }`
- 실패: `{ "code": "UPPER_SNAKE", "message": "설명" }` (docs/conventions.md §3)

## Supabase Storage (이미지 업로드용) 수동 설정

`POST /images/upload`는 Supabase Storage에 파일을 올린다. 코드만으로는 버킷이 안 생기므로, Supabase 대시보드에서 한 번만 설정한다 (지금 공용 개발 DB엔 이미 되어 있음 — 새 프로젝트로 옮길 때만 다시 필요).

1. Storage → New bucket → 이름 `card-images` (`.env`의 `SUPABASE_STORAGE_BUCKET`과 동일하게), **Public bucket** 체크
2. 버킷의 Policies에서 INSERT 정책 추가 — 로그인한 사용자가 자기 uid 폴더에만 올리도록 제한:
   ```sql
   create policy "card-images authenticated insert own folder"
   on storage.objects for insert
   to authenticated
   with check (
     bucket_id = 'card-images'
     and auth.uid()::text = (storage.foldername(name))[1]
   );
   ```
   업로드 경로의 첫 폴더명은 `User.id`(우리 앱 PK)가 아니라 **`User.providerUid`(Supabase Auth uid)**를 쓴다 — `auth.uid()`가 비교하는 값이 Supabase Auth uid라서, 앱 PK를 쓰면 정책이 절대 통과하지 못한다 (`image.service.js`의 `authUid` 참고).

## 테스트

- `test/health.http`: 서버 상태, 404
- `test/auth.http`: 회원가입(201·409·400), 로그인(200·401·400), 토큰 재발급·로그아웃(CSRF 헤더 필요, 403), 소셜 콜백(401) 케이스
- `test/images.http`: 이미지 업로드 (인증·CSRF 필요, 201·400·401·403)
