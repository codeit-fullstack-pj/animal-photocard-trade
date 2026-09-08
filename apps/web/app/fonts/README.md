# fonts

`next/font/local`로 로드하는 폰트 파일을 여기에 둡니다.

## 사용 폰트 — 배스킨라빈스체 (BR)

| 용도 | 파일 | weight | 토큰 |
| --- | --- | --- | --- |
| 제목(heading) | `BaskinRobbins-Regular.otf` | 400 | `--font-heading` |
| 제목(heading, "BR B") | `BaskinRobbins-Bold.otf` | 700 | `--font-heading` |

- `apps/web/app/layout.jsx`에서 `next/font/local`로 등록, `--font-heading` 변수에 매핑
- 컴포넌트에서 `font-(family-name:--font-heading)`로 참조
- "BR B"(볼드)를 쓰려면 `font-bold`, 레귤러는 `font-normal`

## 라이선스

배스킨라빈스체는 배스킨라빈스코리아가 배포한 무료 폰트(상업적 이용 가능).
사용 조건은 배포처 안내를 확인하세요.
