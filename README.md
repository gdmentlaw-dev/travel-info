# 여행노트 — 도시·시기별 여행 가이드

도시, 여행 달, 일수(1박 2일~4박 5일)를 고르면 그 시기에 좋은 관광지·액티비티·휴양지를 사진과 함께 소개하고, 동선을 고려한 일정을 지도와 함께 보여 주는 정적 웹사이트입니다.

- 지원 도시: 오키나와, 가고시마, 다카마쓰, 오사카, 도쿄, 하코다테, 삿포로
- 스크롤 애니메이션: [Lenis](https://github.com/darkroomengineering/lenis) + [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- 지도: [Leaflet](https://leafletjs.com/) + OpenStreetMap
- 빌드 과정 없음 — HTML/CSS/JS 파일 그대로 배포

## 로컬에서 보기

```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1
```

브라우저에서 http://localhost:5173 을 엽니다. 주소에 `?city=okinawa&month=12&days=4`처럼 조건을 붙일 수 있어요.

## 구조

| 파일 | 내용 |
| --- | --- |
| `index.html` | 페이지 뼈대 |
| `css/style.css` | 스타일 |
| `js/data.js` | 오키나와 데이터 + 공통 도우미(이미지 URL, 기후, 옷차림, 사진 표기) |
| `js/cities/*.js` | 도시별 데이터 (관광지, 기후, 월별 행사, 일정 배치) |
| `js/credits.js` | 사진별 작가·라이선스 |
| `js/planner.js` | 일정 생성 (권역 배치 → 월별 점수 → 최근접 순서 → 시간표) |
| `js/app.js` | 화면 렌더링, 스크롤 애니메이션, 지도 연동 |

### 도시 추가하기

1. `js/cities/`에 기존 파일과 같은 형식으로 `DESTINATIONS.<id> = { ... }` 파일을 만듭니다.
2. `index.html`에 `<script src="js/cities/<id>.js"></script>`를 추가합니다.
3. 새 사진이 있다면 `js/credits.js`에 작가·라이선스를 추가합니다.

## 출처·라이선스

- 사진: Wikimedia Commons 기여자. 각 사진 위에 작가와 라이선스를 표기하고 원본 페이지로 연결했습니다. 사진은 Wikimedia 서버에서 직접 불러오며, 이 저장소에는 포함되어 있지 않습니다.
- 지도 타일: © OpenStreetMap contributors. 방문자가 많아지면 [타일 사용 정책](https://operations.osmfoundation.org/policies/tiles/)에 따라 별도 타일 제공 업체로 바꾸는 것이 좋습니다.
- 기후: 각 도시 기상 관측소 평년값(1991–2020) 기준 근사치.
- 운영 시간·요금·투어 운항 등은 바뀔 수 있으니 방문 전 공식 정보를 확인하세요.
