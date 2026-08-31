# 개발 환경 설정 가이드

컨벤션 설정(Prettier·LF·husky·CI)은 이 레포에 이미 적용되어 있다. 팀원은 아래만 하면 된다.

## 팀원 각자 1회

1. 루트에서 `npm install` — Prettier·husky·lint-staged 설치 + 커밋 훅 활성화 (이걸 빼먹으면 커밋 시 자동 포맷이 안 돈다)
2. `cd apps/web && npm install`, 이어서 `cd ../api && npm install`
3. VSCode에서 열면 추천 확장(Prettier·ESLint·Tailwind·EditorConfig) 설치 안내가 뜬다 → 모두 설치
   - 다른 에디터 사용자는 "저장 시 Prettier로 포맷 + LF"를 동일하게 설정
4. `git config pull.rebase true` 권장 (개인 브랜치 rebase 습관화)

## 적용되어 있는 것 (참고)

| 파일                                 | 역할                                                       |
| ------------------------------------ | ---------------------------------------------------------- |
| `docs/conventions.md`                | 컨벤션 본문 (코드·포맷·에러 처리·브랜치·커밋·PR·CI)        |
| `.gitattributes`                     | LF 통일 (줄바꿈 diff 차단)                                 |
| `.editorconfig`                      | 에디터 공통 (들여쓰기·개행)                                |
| `.prettierrc.json` `.prettierignore` | 포매터 설정 (루트에서 전체 관리, 정확 버전 고정)           |
| `.vscode/`                           | 저장 시 자동 포맷 + 추천 확장                              |
| `.github/workflows/ci.yml`           | PR 필수 체크 — 포맷·린트·빌드 (web·api 각각)               |
| `.github/PULL_REQUEST_TEMPLATE.md`   | PR 템플릿                                                  |
| `.husky/pre-commit`                  | 커밋 전 lint-staged (변경 파일만 포맷 + 앱별 eslint --fix) |

- 포맷 명령: 루트에서 `npm run format` / 검사 `npm run format:check`
- 린트·빌드 일괄: 루트에서 `npm run lint` / `npm run build`
- 각 앱의 `eslint.config.mjs` 마지막에 `eslint-config-prettier`가 있어 포맷 룰 충돌이 없다

## GitHub 설정 (조직 레포 관리자 1회)

1. Settings → Branches → `main`, `dev` 각각 branch protection rule 추가
   - Require a pull request before merging (승인 1+)
   - Require status checks to pass → `check`(ci.yml의 job) 지정
   - Force push 금지, 직접 푸시 금지
2. Settings → General → Pull Requests → Squash merge·Merge commit 허용, Rebase merge 비활성 (머지 방식은 레포 전역 설정이라 브랜치별 강제 불가 — dev PR은 Squash 버튼, main 릴리스 PR은 Merge commit 버튼을 쓰는 팀 규율로 운영)
3. 기본 브랜치를 `dev`로 지정 (PR 기본 대상)
