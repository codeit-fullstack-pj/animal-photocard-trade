# animal-photocard-trade

코드잇 부트캠프 풀스택 14기 (중급 프로젝트) — 동물 관상 평가 + 포토카드 거래

반려동물(강아지/고양이) 사진으로 관상 카드를 만들어 소장·판매·교환하는 서비스.

## 구조

| 경로                  | 설명                                                               |
| --------------------- | ------------------------------------------------------------------ |
| `apps/web`            | 프론트엔드 (Next.js + TypeScript + Tailwind, 포트 3000)            |
| `apps/api`            | 백엔드 API 서버 (Next.js Route Handlers, 포트 4000, Supabase 예정) |
| `docs/conventions.md` | 팀 컨벤션 (코드·포맷·에러 처리·브랜치·커밋·PR·CI)                  |
| `docs/setup-guide.md` | 개발 환경 최초 설정 가이드                                         |

## API 명세 (단일 소스)

API 명세와 목 서버는 별도 레포에서 관리한다.

- 명세·목 서버 레포: [codeit-fullstack-pj/photocard-trade-api-test](https://github.com/codeit-fullstack-pj/photocard-trade-api-test)
- 단일 소스: `openapi/openapi.yaml` (사람용 명세: `docs/api-spec.md`)
- 목 서버: `http://localhost:4000` (Swagger UI 포함) — `apps/api` 완성 전까지 프론트 개발용으로 사용

목 서버와 `apps/api`는 같은 포트(4000)·같은 명세를 쓰므로 프론트 설정 변경 없이 교체할 수 있다.

## 실행

```
cd apps/web && npm install && npm run dev   # http://localhost:3000
cd apps/api && npm install && npm run dev   # http://localhost:4000
```

루트에서 최초 1회 `npm install` (Prettier·husky·lint-staged 설치, 커밋 훅 활성화).

## 브랜치

`main ← dev ← {type}/{이슈번호}-{설명}` — 상세 규칙은 [docs/conventions.md](docs/conventions.md) 참고.
