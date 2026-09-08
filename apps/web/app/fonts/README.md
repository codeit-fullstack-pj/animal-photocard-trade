# fonts

`next/font/local`로 로드하는 폰트 파일을 여기에 둡니다.

## 사용 폰트 — 배스킨라빈스체 (BR)

| 용도                  | 파일                          | weight | 토큰                    |
| --------------------- | ----------------------------- | ------ | ----------------------- |
| 제목(heading)         | `BaskinRobbins-Regular.woff2` | 400    | `--font-baskin-robbins` |
| 제목(heading, "BR B") | `BaskinRobbins-Bold.woff2`    | 700    | `--font-baskin-robbins` |

- `apps/web/app/layout.jsx`에서 `next/font/local`로 등록, `--font-baskin-robbins` 변수에 매핑
- 컴포넌트에서는 `globals.css`의 유틸리티 `font-primary`(400) / `font-primary-bold`(700)로 참조
- 본문 서체(Noto Sans KR)는 `font-sans-400 ~ font-sans-700`

## 라이선스

배스킨라빈스체는 배스킨라빈스코리아가 배포한 무료 폰트(상업적 이용 가능).
사용 조건은 배포처 안내를 확인하세요.
