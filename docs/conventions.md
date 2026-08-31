# 팀 컨벤션 — 펫관상 포토카드 거래 서비스

> 5명 동시 작업 기준. 이 문서와 개인 취향이 갈리면 이 문서가 우선한다.
> API 계약은 `docs/api-spec.md` + `openapi/openapi.yaml`이 단일 소스이며, 이 문서와 충돌하면 명세가 우선한다.

## 0. 목표

1. **포매팅 오염 방지** — 10번 줄만 고쳤는데 탭·줄바꿈 차이로 10~40번 줄이 diff에 잡히는 일을 없앤다.
2. **컨플릭트 최소화** — 같은 파일을 만져도 충돌이 잘 나지 않는 구조·습관·자동화를 강제한다.

## 1. 코드 컨벤션

- **스택**: Next.js(App Router) + TypeScript strict + Tailwind CSS, 패키지 매니저 npm 고정
- **네이밍**
  - 변수·함수 `camelCase`, 컴포넌트·타입 `PascalCase`, 상수 `UPPER_SNAKE_CASE`
  - boolean은 `is`/`has` 접두, 이벤트 핸들러는 `handle*`, 커스텀 훅은 `use*`
  - 폴더·일반 파일 `kebab-case`, 컴포넌트 파일만 `PascalCase.tsx`
- **TypeScript**
  - `any` 금지 (불가피하면 `unknown` + 좁히기), 외부 입력(요청 본문·쿼리·응답)은 검증 후 사용
  - 실패할 수 있는 코드(fetch, JSON.parse, 파일 IO)는 반드시 실패 경로를 처리. floating Promise 금지
- **주석은 최소화** — 코드로 표현하고, "왜"가 필요한 곳에만 짧게
- **매직 넘버 금지** — 의미 있는 상수로 추출 (예: `OVER_LIMIT_COST = 100`)
- **`"use client"` 최소화** — 서버 컴포넌트 기본, 상호작용 있는 말단만 클라이언트
- **barrel 파일(index.ts 재수출) 금지** — 여러 명이 같은 파일에 export 한 줄씩 추가하다 충돌하는 대표 핫스팟
- 파일이 200줄을 넘보면 분리를 검토한다. 한 파일 = 한 책임

## 2. 포매팅 (오염 방지 규칙)

> 원리: **전원이 같은 포매터·같은 버전·같은 설정**을 쓰면 포매팅은 멱등이 되어, 남의 줄이 diff에 섞일 수 없다.

- **Prettier 단일 포매터**. 설정은 `.prettierrc.json` 공유, 버전은 `package.json`에 **정확 버전으로 고정**(`"prettier": "3.x.y"`, `^` 금지)
- **줄바꿈 LF 통일**: `.gitattributes`(`* text=auto eol=lf`)로 Git 저장 시점에 강제 — Windows/맥 혼용 팀의 CRLF diff 원천 차단
- `.editorconfig`: 2칸 스페이스, UTF-8, 파일 끝 개행
- **VSCode 공유 설정**(`.vscode/`): 저장 시 자동 포맷 + Prettier 기본 포매터. 다른 에디터 사용자는 Prettier 플러그인 설정을 동일하게 맞춘다
- **pre-commit 훅(husky + lint-staged)**: 커밋 대상 파일만 포맷·린트 — 손대지 않은 파일이 커밋에 섞이지 않는다
- **포맷 전용 변경은 `style:` 커밋으로 분리**하고 기능 커밋에 섞지 않는다
- 도입 첫날 전체 1회 포맷(`npm run format`)을 단독 커밋으로 처리한 뒤 시작한다

## 3. 에러 처리 컨벤션

- **응답 규약**: 실패 응답은 항상 `{ "code": "UPPER_SNAKE", "message": "설명" }`. HTTP 상태·코드 표는 `docs/api-spec.md` §2를 따른다 (새 코드가 필요하면 명세에 먼저 추가)
- **서버(라우트 핸들러)**
  - `ApiError(status, code, message)` 클래스 + 공용 `handle()` 래퍼로 통일 — 라우트마다 try/catch 반복 금지
  - 예상 못한 예외는 500 `INTERNAL_ERROR` 한 가지로만 응답하고, 상세(스택·쿼리·내부 상태)는 서버 로그에만 남긴다. **내부 정보를 응답에 노출하지 않는다**
  - 인증·소유자 검증은 핸들러 첫 부분에서 공용 헬퍼(`requireAuth` 등)로 수행
- **클라이언트**
  - fetch는 공용 래퍼 하나로만 호출 — 에러 파싱·토큰 첨부·재발급을 한 곳에서 처리
  - 사용자 노출 메시지는 한국어로 가공하고, `code`로 분기한다 (message 문자열 비교 금지)
  - 세그먼트별 `error.tsx` / `not-found.tsx`를 두고, 빈 목록·로딩·실패 상태를 컴포넌트에서 모두 처리
- `console.log` 잔재 커밋 금지. 서버 로깅 지점에서만 `console.error`

## 4. 디렉터리 구조

```
(repo)
├─ docs/            # 명세·컨벤션 문서
├─ openapi/         # openapi.yaml (API 단일 소스 — 이 프로젝트에서는 별도 명세 레포 photocard-trade-api-test에 있음)
└─ (app)            # Next.js 프로젝트 (모노레포면 apps/* 하위)
   ├─ app/          # 라우트 — URL 구조 그대로
   ├─ components/
   │  ├─ ui/        # 프로젝트 공용 (수정 시 단독 PR)
   │  └─ {도메인}/   # auth / card / gallery / market / trade / point / notification
   ├─ lib/          # api 클라이언트, 유틸, 상수
   ├─ hooks/
   └─ types/
```

- **도메인 단위 분담**: A 인증·유저 / B 카드 생성·마이갤러리 / C 마켓플레이스 / D 거래(구매·교환) / E 포인트·알림. 폴더가 곧 담당 영역이 되어 같은 파일을 만질 일 자체를 줄인다
- 공용 영역(`components/ui`, `lib`, 설정 파일) 수정은 **사전 공유 후 단독 PR**로만
- 새 파일은 담당 도메인 폴더에만 추가. 남의 도메인 수정이 필요하면 담당자에게 PR 리뷰를 요청

## 5. Git · 브랜치 전략

```
main ← dev ← {type}/{이슈번호}-{설명}
```

- **main**: 배포 브랜치. dev에서만 머지(merge commit). 직접 푸시 금지(보호)
- **dev**: 통합 브랜치. 작업 브랜치 PR만 머지(**squash merge**). 직접 푸시 금지(보호)
- **작업 브랜치**: `feat/12-card-create`, `fix/31-draw-cooldown` 형식. 수명 3일 이내, 작게 쪼갠다
- **매일 작업 시작 전 dev 최신을 자기 브랜치에 반영** — 오래 묵힐수록 충돌이 커진다
  - 개인 브랜치는 rebase 권장, 푸시는 `--force-with-lease`만 허용
  - dev·main에는 어떤 경우에도 force-push 금지
- `package-lock.json` 충돌 시 수동 병합 금지 — dev 쪽을 받고 `npm install`로 재생성
- 충돌이 났다면 **브랜치 소유자가** 해결하고, 애매하면 해당 줄 작성자와 같이 본다

## 6. 커밋 컨벤션 — Conventional Commits + 한국어

```
{type}: {한국어 제목 (50자 이내, 마침표 없이)}

{본문(선택): 무엇을·왜. 어떻게는 코드가 말한다}
```

| type     | 용도                            |
| -------- | ------------------------------- |
| feat     | 기능 추가                       |
| fix      | 버그 수정                       |
| docs     | 문서                            |
| style    | 포맷·세미콜론 등 동작 무관 변경 |
| refactor | 동작 동일한 구조 개선           |
| test     | 테스트                          |
| chore    | 빌드·설정·의존성                |
| ci       | CI 설정                         |

- 예: `feat: 카드 생성 API 연동`, `fix: 뽑기 쿨다운 자정 리셋 오류 수정`
- 1커밋 = 1의도. 포맷 변경과 기능 변경을 한 커밋에 섞지 않는다

## 7. PR · 코드리뷰

- **PR 크기**: 변경 ±300줄 이하 목표. 넘으면 쪼갠다 (리뷰 불가능한 PR이 컨플릭트의 주범)
- PR 제목은 커밋 컨벤션과 동일 형식, 본문은 템플릿(`.github/PULL_REQUEST_TEMPLATE.md`) 사용
- **머지 조건**: CI(포맷·린트·빌드) 초록 + 작업자 외 **1인 이상 승인**. self-merge 금지
- **리뷰 SLA 24시간** — 요청받으면 하루 안에 본다. 급하면 Draft PR로 미리 공유
- 리뷰 코멘트 등급을 접두어로 명시:
  - `[P1]` 머지 전 필수 수정 (버그·보안·명세 위반)
  - `[P2]` 권장 (다음 PR로 미뤄도 됨 — 미루면 이슈로 남긴다)
  - `[P3]` 사소·취향 (반영 자유)
- 리뷰는 코드에, 사람에게 하지 않는다. 이유 없는 지적 금지 ("왜"를 붙인다)

## 8. CI/CD (GitHub Actions)

- PR(→ dev, main)마다 자동 실행: **① Prettier 검사 ② ESLint ③ 빌드(tsc 포함)**
- 셋 중 하나라도 실패하면 머지 불가 — branch protection의 required checks로 등록
- 같은 PR의 이전 실행은 자동 취소(concurrency)해 대기시간 절약
- 배포 자동화(main → 배포)는 배포 대상 확정 후 이 워크플로에 job으로 추가

### branch protection 설정 (조직 레포 관리자가 1회)

- `main`, `dev`: 직접 푸시 금지 · PR 필수 · 승인 1+ · required checks(`check`) · force-push 금지

## 9. 로드맵 참고 (비확정 — 명세 반영 전까지 구현 금지)

시즌·이벤트 한정 관상 테마 / 품종·관상 유형별 인기 카드 랭킹 / 카드 상세 원본↔도트 비교 뷰어.
반영이 확정되면 `docs/api-spec.md`와 `openapi/openapi.yaml`을 먼저 갱신한 뒤 구현한다.
