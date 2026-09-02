# 팀 컨벤션 — 펫관상 포토카드 거래 서비스

> 5명 동시 작업 기준. 이 문서와 개인 취향이 갈리면 이 문서가 우선한다.
> API 계약은 `docs/api-spec.md` + `openapi/openapi.yaml`이 단일 소스이며, 이 문서와 충돌하면 명세가 우선한다.

## 1. 코드 컨벤션

- **스택**: Next.js(App Router) + Tailwind CSS, 패키지 매니저 npm 고정
- **네이밍**
  - 변수·함수 `camelCase`, 컴포넌트·타입 `PascalCase`, 상수 `UPPER_SNAKE_CASE`
  - boolean은 `is`/`has` 접두, 이벤트 핸들러는 `handle*`, 커스텀 훅은 `use*`
  - 폴더·일반 파일 `kebab-case`, 컴포넌트 파일만 `PascalCase.jsx`
- **주석은 최소화** — 코드로 표현하고, "왜"가 필요한 곳에만 짧게

## 2. 포매팅 (오염 방지 규칙)

- 도입 첫날 전체 1회 포맷(`npm run format`)을 단독 커밋으로 처리한 뒤 시작한다

## 3. 에러 처리 컨벤션

- **응답 규약**: 실패 응답은 항상 `{ "code": "UPPER_SNAKE", "message": "설명" }`. HTTP 상태·코드 표는 `docs/api-spec.md` §2를 따른다 (새 코드가 필요하면 명세에 먼저 추가)

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

## 5. Git · 브랜치 전략

```
main ← dev ← {type}/{이슈번호}-{설명}
```

- **main**: 배포 브랜치. dev에서만 머지(merge commit). 직접 푸시 금지(보호)
- **dev**: 통합 브랜치. 작업 브랜치 PR만 머지(**squash merge**). 직접 푸시 금지(보호)
- **작업 브랜치**: `feat/12-card-create`, `fix/31-draw-cooldown` 형식.
- **수시로 dev 최신을 자기 브랜치에 반영** — 오래 묵힐수록 충돌이 커진다
  - 개인 브랜치는 rebase 권장, 푸시는 `--force-with-lease`만 허용
  - dev·main에는 어떤 경우에도 force-push 금지
- `package-lock.json` 충돌 시 수동 병합 금지 — dev 쪽을 받고 `npm install`로 재생성

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

- 코드 리뷰는 필수로 **순서대로 선택된 팀원**이 수행한다.
- PR 제목은 커밋 컨벤션과 동일 형식, 본문은 템플릿(`.github/PULL_REQUEST_TEMPLATE.md`) 사용
