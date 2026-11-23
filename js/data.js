/* =========================================================
   여행지 데이터
   - 새 도시는 DESTINATIONS 에 같은 구조로 추가하면 됩니다.
   - img: Wikimedia Commons 경로 "a/ab/File_name.jpg" 와 원본 가로폭(w)
   - months: 특히 추천하는 달(점수 가산), only: 이 달에만 가능
   - when: 'morning' | 'evening' | 'any' (동선 정렬에 사용)
   ========================================================= */

const DESTINATIONS = {
  okinawa: {
    id: 'okinawa',
    name: '오키나와',
    nameEn: 'OKINAWA',
    aliases: ['오키나와', 'okinawa', '沖縄', '나하', 'naha'],
    center: [26.45, 127.85],
    zoom: 9,
    hero: { p: '6/64/Nago_Okinawa_Kouri-Bridge-02.jpg', w: 5739 },
    tagline: '에메랄드빛 바다와 류큐 왕국의 시간이 흐르는 섬',

    move: 'car',
    stayFor: { north: 'onna' },
    // 숙소/이동 거점
    bases: {
      airport: { name: '나하 공항', lat: 26.2063, lng: 127.6466 },
      hotel:   { name: '나하 시내 숙소', lat: 26.2150, lng: 127.6820 },
      onna:    { name: '온나 리조트', lat: 26.4790, lng: 127.8350 },
    },

    regions: {
      naha:    { name: '나하 시내', color: '#ef6c4d' },
      south:   { name: '남부',     color: '#f2a93b' },
      central: { name: '중부',     color: '#2bb5a4' },
      north:   { name: '북부',     color: '#2f80d1' },
      islands: { name: '바다 투어', color: '#7b61d9' },
    },

    // 일정 일수별 지역 배치 (동선: 공항 → 시내 → 북부 → 중부 → 남부 → 공항)
    dayPlans: {
      2: [['naha', 'south'], ['central', 'south']],
      3: [['naha'], ['north', 'central'], ['south', 'naha']],
      4: [['naha'], ['north'], ['central'], ['south']],
      5: [['naha'], ['north'], ['central'], ['islands', 'naha', 'central'], ['south']],
    },

    // 지역별 점심 추천
    lunch: {
      naha:    '마키시 시장 2층 식당가 — 고야 참프루 & 라후테',
      south:   '남부 해안 카페 — 바다 전망 타코라이스',
      central: '온나·요미탄 — 오키나와 소바 & 아구 돼지 샤브',
      north:   '모토부 소바 거리 — 소키 소바 한 그릇',
      islands: '도마리항 주변 — 해산물 덮밥',
    },

    climate: {
      1:  { t: 17.3, hi: 19.8, rain: 107, sea: 21, wear: '얇은 니트 + 바람막이', note: '연중 가장 선선한 달. 1월 말 나고·모토부에 벚꽃이 핍니다.' },
      2:  { t: 17.5, hi: 20.1, rain: 120, sea: 21, wear: '긴팔 + 가벼운 겉옷', note: '벚꽃 시즌, 고래 관찰 최성수기.' },
      3:  { t: 19.1, hi: 21.8, rain: 161, sea: 22, wear: '긴팔·반팔 레이어드', note: '바다 개장 직전. 고래 시즌 마무리.' },
      4:  { t: 21.5, hi: 24.1, rain: 165, sea: 23, wear: '반팔 + 얇은 겉옷', note: '해변 개장. 골든위크는 붐빕니다.' },
      5:  { t: 24.2, hi: 26.7, rain: 231, sea: 25, wear: '반팔, 우산', note: '5월 중순부터 장마 시작.' },
      6:  { t: 27.2, hi: 29.6, rain: 247, sea: 27, wear: '반팔, 래시가드', note: '6월 하순 장마가 끝나면 최고의 바다.' },
      7:  { t: 29.1, hi: 31.8, rain: 141, sea: 29, wear: '반팔, 선크림 필수', note: '맑고 뜨거운 한여름. 태풍 예보 확인.' },
      8:  { t: 29.0, hi: 31.6, rain: 240, sea: 29, wear: '반팔, 모자', note: '불꽃놀이·에이사 축제 시즌. 태풍 주의.' },
      9:  { t: 27.9, hi: 30.7, rain: 261, sea: 28, wear: '반팔', note: '여전히 여름. 태풍 빈도가 가장 높은 달.' },
      10: { t: 25.5, hi: 28.1, rain: 153, sea: 27, wear: '반팔 + 얇은 긴팔', note: '바다 수영이 가능한 마지막 쾌적한 시기.' },
      11: { t: 22.4, hi: 24.9, rain: 110, sea: 25, wear: '긴팔 셔츠', note: '건조하고 쾌적. 일루미네이션이 시작됩니다.' },
      12: { t: 19.0, hi: 21.5, rain: 103, sea: 23, wear: '긴팔 + 바람막이(북풍)', note: '비수기라 항공·숙소가 저렴. 해수욕보다는 드라이브·일루미네이션·수족관이 주인공.' },
    },

    monthHighlights: {
      12: [
        { icon: '✨', title: '겨울 일루미네이션', text: '동남식물낙원 등 대형 빛 축제가 11월~2월에 열립니다.' },
        { icon: '🐋', title: '고래 시즌 개막', text: '12월 하순부터 케라마 해역에 혹등고래가 찾아옵니다.' },
        { icon: '🏃', title: 'NAHA 마라톤', text: '12월 첫째 일요일. 나하 시내 교통 통제에 주의.' },
        { icon: '💸', title: '여행 비수기', text: '연말 직전까지는 항공·호텔 가격이 가장 낮은 편.' },
      ],
    },

    spots: [
      // ---------------- 나하 ----------------
      {
        id: 'shuri', name: '슈리성 공원', local: '首里城', region: 'naha', cat: 'sight',
        lat: 26.2170, lng: 127.7195, dur: 90, prio: 5, when: 'morning',
        img: { p: '5/56/Naha_Okinawa_Japan_Shuri-Castle-01.jpg', w: 5395 },
        desc: '450년 류큐 왕국의 왕궁. 붉은 기와와 성벽 사이로 나하 시내가 내려다보입니다.',
        tip: '2019년 화재 후 정전 복원이 2026년 완공 목표로 진행돼 왔어요. 방문 전 공개 구역을 확인하세요.',
        tags: ['세계유산', '역사'],
      },
      {
        id: 'kokusai', name: '국제거리', local: '国際通り', region: 'naha', cat: 'sight',
        lat: 26.2149, lng: 127.6856, dur: 90, prio: 5, when: 'evening', late: true,
        img: { p: 'e/e1/Night_at_Kokusai-dori_20250503183819.jpg', w: 5598 },
        desc: '1.6km 쇼핑 거리. 기념품, 이자카야, 오리온 맥주까지 밤이 더 활기찬 곳.',
        tip: '일요일 낮에는 차 없는 거리로 운영돼 걷기 좋아요.',
        tags: ['쇼핑', '야경', '먹거리'],
      },
      {
        id: 'makishi', name: '마키시 공설시장', local: '第一牧志公設市場', region: 'naha', cat: 'sight',
        lat: 26.2147, lng: 127.6892, dur: 60, prio: 4, when: 'any',
        img: { p: '8/8f/Makishi_Public_Market_202202.jpg', w: 6000 },
        desc: '"나하의 부엌". 1층에서 산 생선을 2층 식당에서 바로 요리해 줍니다.',
        tags: ['시장', '먹거리'],
      },
      {
        id: 'naminoue', name: '나미노우에궁 & 해변', local: '波上宮', region: 'naha', cat: 'relax',
        lat: 26.2207, lng: 127.6713, dur: 45, prio: 3, when: 'any',
        img: { p: 'f/ff/Naha_Naminoue_Beach_%26_Naminoue-gu_12.jpg', w: 5147 },
        desc: '절벽 위 신사와 그 아래 도심 속 작은 해변. 시내에서 가장 가까운 바다.',
        tags: ['신사', '해변'],
      },
      {
        id: 'umikaji', name: '세나가지마 우미카지 테라스', local: '瀬長島ウミカジテラス', region: 'naha', cat: 'relax',
        lat: 26.1760, lng: 127.6420, dur: 80, prio: 4, when: 'evening',
        img: { p: '9/9f/Umikaji_Terrace_Senagajima.jpg', w: 4000 },
        desc: '공항 옆 작은 섬의 하얀 테라스 상점가. 이착륙하는 비행기와 석양을 함께.',
        tip: '공항에서 15분 — 도착일이나 출국일에 넣기 좋아요.',
        tags: ['석양', '카페', '공항근처'],
      },

      // ---------------- 남부 ----------------
      {
        id: 'sefa', name: '세이화 우타키', local: '斎場御嶽', region: 'south', cat: 'sight',
        lat: 26.1730, lng: 127.8275, dur: 70, prio: 5, when: 'morning',
        img: { p: '3/3d/Okinawa_Nanjo_Sefa-utaki_Gusuku_site_Yuinchi_01.jpg', w: 4864 },
        desc: '류큐 최고의 성지. 거대한 바위가 맞닿은 삼각 틈 너머로 신의 섬 구다카지마가 보입니다.',
        tip: '정기 휴관일(음력 기준)이 있으니 사전 확인.',
        tags: ['세계유산', '성지'],
      },
      {
        id: 'chinen', name: '치넨곶 공원', local: '知念岬公園', region: 'south', cat: 'relax',
        lat: 26.1590, lng: 127.8230, dur: 40, prio: 4, when: 'any',
        img: { p: 'c/ce/Chinen-Misaki-Park.jpg', w: 5471 },
        desc: '태평양으로 튀어나온 잔디 언덕. 360도로 펼쳐지는 바다 전망이 무료.',
        tags: ['전망', '무료'],
      },
      {
        id: 'gyokusendo', name: '교쿠센도 동굴 (오키나와 월드)', local: '玉泉洞', region: 'south', cat: 'activity',
        lat: 26.1406, lng: 127.7480, dur: 120, prio: 4, when: 'any',
        img: { p: 'c/c6/Gyokusendo_20221228-1.jpg', w: 5184 },
        desc: '30만 년 동안 자란 종유석 동굴 890m. 에이사 공연과 류큐 전통 마을도 함께.',
        tip: '동굴 안은 연중 20℃ 안팎 — 비 오는 날 대안으로 최고.',
        tags: ['동굴', '우천대안', '공연'],
      },
      {
        id: 'peace', name: '평화기념공원', local: '平和祈念公園', region: 'south', cat: 'sight',
        lat: 26.0952, lng: 127.7247, dur: 60, prio: 3, when: 'any',
        img: { p: '0/09/Itoman_Okinawa_Okinawa-Cornerstone-of-Peace-Memorial-01.jpg', w: 5422 },
        desc: '오키나와 전투 희생자를 기리는 평화의 초석. 마부니 언덕 해안 절벽이 장엄합니다.',
        tags: ['역사', '전망'],
      },

      // ---------------- 중부 ----------------
      {
        id: 'maeda', name: '마에다곶 푸른 동굴 스노클링', local: '真栄田岬 青の洞窟', region: 'central', cat: 'activity',
        lat: 26.4450, lng: 127.7710, dur: 150, prio: 5, when: 'morning',
        img: { p: '1/18/%E7%9C%9F%E6%A0%84%E7%94%B0%E5%B2%AC_-_panoramio.jpg', w: 7152 },
        desc: '햇빛이 동굴 안 바닷물을 형광 파랑으로 물들이는 오키나와 대표 액티비티.',
        monthNote: { 12: '12월 수온 약 23℃ — 웻슈트 포함 투어 이용. 북풍이 강한 날은 취소가 잦아요.', 1: '수온 21℃ 전후, 웻슈트 필수.', 2: '수온 21℃ 전후, 웻슈트 필수.' },
        tags: ['스노클링', '다이빙', '투어'],
      },
      {
        id: 'zanpa', name: '잔파곶', local: '残波岬', region: 'central', cat: 'sight',
        lat: 26.4410, lng: 127.7135, dur: 40, prio: 3, when: 'any',
        img: { p: '1/16/Cliff_at_Cape_Zanpa_from_Zanpa_Misaki_Lighthouse_201905.JPG', w: 4000 },
        desc: '높이 30m 절벽이 2km 이어지는 해안. 등대에 오르면 동중국해가 한눈에.',
        tags: ['절벽', '등대'],
      },
      {
        id: 'manzamo', name: '만좌모', local: '万座毛', region: 'central', cat: 'sight',
        lat: 26.5050, lng: 127.8510, dur: 45, prio: 5, when: 'any',
        img: { p: '5/53/Onna_Okinawa_Japan_Cape-Manzamo-01.jpg', w: 5387 },
        desc: '"만 명이 앉을 수 있는 들판". 코끼리 코 모양 절벽은 오키나와의 상징 같은 풍경.',
        tags: ['절벽', '포토스팟'],
      },
      {
        id: 'kaichu', name: '해중도로 & 하마히가섬', local: '海中道路', region: 'central', cat: 'relax',
        lat: 26.3300, lng: 127.9300, dur: 90, prio: 3, when: 'any',
        img: { p: 'f/f8/Kaichu_Road_-_panoramio.jpg', w: 4928 },
        desc: '바다 위를 4.7km 가로지르는 드라이브 코스. 끝에는 조용한 섬 마을과 성지가 있어요.',
        tags: ['드라이브', '섬'],
      },
      {
        id: 'botanical', name: '동남식물낙원 일루미네이션', local: '東南植物楽園', region: 'central', cat: 'relax',
        lat: 26.3475, lng: 127.8285, dur: 100, prio: 3, when: 'evening',
        months: [11, 12, 1, 2],
        img: { p: '8/8c/Southeast_Botanical_Garden_%E6%9D%B1%E5%8D%97%E6%A4%8D%E7%89%A9%E6%A8%82%E5%9C%92_-_panoramio.jpg', w: 5205 },
        desc: '야자수와 열대 식물원. 겨울밤에는 수백만 개의 전구가 정원을 빛의 숲으로 바꿉니다.',
        monthNote: { 11: '겨울 일루미네이션 시즌 시작.', 12: '12월은 일루미네이션 피크 — 해 진 뒤 17:30 이후 방문 추천.', 1: '일루미네이션 시즌.', 2: '일루미네이션 시즌 막바지.' },
        tags: ['일루미네이션', '야경', '정원'],
      },
      {
        id: 'american', name: '아메리칸 빌리지', local: '美浜アメリカンビレッジ', region: 'central', cat: 'relax',
        lat: 26.3160, lng: 127.7570, dur: 100, prio: 4, when: 'evening', late: true,
        img: { p: '6/6f/American_Village_-_panoramio.jpg', w: 2736 },
        desc: '대관람차와 컬러풀한 상점가, 선셋 비치. 해 질 녘 산책과 저녁 식사 코스.',
        tags: ['석양', '쇼핑', '저녁'],
      },

      // ---------------- 북부 ----------------
      {
        id: 'churaumi', name: '츄라우미 수족관', local: '沖縄美ら海水族館', region: 'north', cat: 'sight',
        lat: 26.6944, lng: 127.8779, dur: 150, prio: 5, when: 'morning',
        img: { p: '5/59/Okinawa_Churaumi_Aquarium_3.jpg', w: 4032 },
        desc: '고래상어가 헤엄치는 초대형 수조 "쿠로시오의 바다". 오키나와 여행의 필수 코스.',
        tip: '개관 직후나 16시 이후가 한산해요. 겨울에도 날씨 상관없이 즐길 수 있는 곳.',
        tags: ['수족관', '가족', '우천대안'],
      },
      {
        id: 'bise', name: '비세 후쿠기 가로수길', local: '備瀬のフクギ並木', region: 'north', cat: 'relax',
        lat: 26.7030, lng: 127.8790, dur: 50, prio: 4, when: 'any',
        img: { p: '6/62/Bise_Fukugi_Tree_Road_01.JPG', w: 2560 },
        desc: '수백 년 된 후쿠기 나무가 터널을 이룬 해변 마을. 자전거로 천천히 둘러보기.',
        tags: ['산책', '자전거', '마을'],
      },
      {
        id: 'nakijin', name: '나키진 성터', local: '今帰仁城跡', region: 'north', cat: 'sight',
        lat: 26.6913, lng: 127.9290, dur: 60, prio: 4, when: 'any',
        img: { p: '0/03/Nakijin_Castle_20221229.jpg', w: 5184 },
        desc: '만리장성처럼 굽이치는 1.5km 성벽. 류큐 통일 이전 북산 왕국의 거성.',
        monthNote: { 1: '1월 하순 히칸자쿠라(벚꽃) 축제가 열려요.' },
        months: [1, 2],
        tags: ['세계유산', '성곽'],
      },
      {
        id: 'kouri', name: '고우리 대교 & 고우리섬', local: '古宇利大橋', region: 'north', cat: 'relax',
        lat: 26.6930, lng: 128.0200, dur: 80, prio: 5, when: 'any',
        img: { p: '3/3c/Nago_Okinawa_Kouri-Bridge-01.jpg', w: 4967 },
        desc: '에메랄드빛 바다 위 2km 다리. 사랑의 섬 고우리의 하트록까지 드라이브.',
        tags: ['드라이브', '포토스팟', '바다'],
      },
      {
        id: 'pineapple', name: '나고 파인애플 파크', local: 'ナゴパイナップルパーク', region: 'north', cat: 'activity',
        lat: 26.6170, lng: 127.9690, dur: 60, prio: 2, when: 'any',
        img: { p: '2/20/Pineapple_Winery_%40_Nago_Pineapple_Park%2C_Okinawa_no.2.jpg', w: 4032 },
        desc: '파인애플 카트를 타고 농장을 돌고, 와이너리에서 시음까지. 아이와 함께라면 추천.',
        tags: ['가족', '시식'],
      },
      {
        id: 'hedo', name: '헤도곶', local: '辺戸岬', region: 'north', cat: 'sight',
        lat: 26.8710, lng: 128.2640, dur: 40, prio: 2, when: 'any',
        img: { p: '2/21/Cape_Hedo_202011.jpg', w: 6000 },
        desc: '오키나와 본섬 최북단. 얀바루 숲을 지나 도착하는 거친 바다와 절벽.',
        tags: ['최북단', '드라이브'],
      },

      // ---------------- 바다 투어 ----------------
      {
        id: 'whale', name: '케라마 고래 관찰 크루즈', local: 'ホエールウォッチング', region: 'islands', cat: 'activity',
        lat: 26.2290, lng: 127.6780, dur: 240, prio: 5, when: 'morning',
        only: [12, 1, 2, 3], months: [1, 2, 3],
        img: { p: '6/6e/031_Humpback_whale_lobtailing_Photo_by_Giles_Laurent.jpg', w: 5409 },
        desc: '나하 도마리항에서 출발해 케라마 해역의 혹등고래를 만나는 반나절 투어.',
        monthNote: { 12: '12월 하순부터 시즌 시작 — 예약 전 운항 개시일을 꼭 확인하세요.' },
        tags: ['고래', '크루즈', '투어'],
        photoNote: '사진은 참고 이미지',
      },
      {
        id: 'zamami', name: '자마미섬 당일치기', local: '座間味島', region: 'islands', cat: 'relax',
        lat: 26.2290, lng: 127.3050, dur: 420, prio: 4, when: 'morning',
        months: [4, 5, 6, 7, 8, 9, 10],
        img: { p: '5/58/Ama_beach_in_Zamami_Island.jpg', w: 3872 },
        desc: '"케라마 블루" 바다. 고속선으로 50분, 바다거북과 함께 헤엄치는 아마 비치.',
        monthNote: { 12: '겨울에는 바닷바람이 차가워 해수욕보다 산책 위주가 됩니다.' },
        tags: ['섬', '해변', '스노클링'],
      },
    ],
  },
};

/* 이미지 URL (원본보다 작은 썸네일만 요청) */
function imgUrl(img, width = 1280) {
  if (!img) return '';
  const file = img.p.split('/').pop();
  if (img.w <= width) return `https://upload.wikimedia.org/wikipedia/commons/${img.p}`;
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${img.p}/${width}px-${file}`;
}
function imgCredit(img) {
  const file = decodeURIComponent(img.p.split('/').pop());
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}`;
}

/* 월별 기후 배열(1~12월) → climate 객체 */
function mkClimate({ t, hi, rain, sea, note }) {
  const out = {};
  for (let m = 1; m <= 12; m++) {
    out[m] = { t: t[m - 1], hi: hi[m - 1], rain: rain[m - 1], note: note[m - 1] };
    if (sea) out[m].sea = sea[m - 1];
  }
  return out;
}
/* 평균 기온 → 옷차림 */
function wearFor(t) {
  if (t < 0) return '두꺼운 패딩 · 장갑 · 미끄럼 방지 신발';
  if (t < 6) return '패딩 또는 두꺼운 코트 · 목도리';
  if (t < 11) return '코트 · 니트';
  if (t < 16) return '가벼운 코트 · 긴팔';
  if (t < 21) return '긴팔 · 얇은 겉옷';
  if (t < 25) return '반팔 + 얇은 긴팔';
  return '반팔 · 모자 · 선크림';
}
/* 사진 아래 표기: "© 작가 · 라이선스" */
function creditLabel(img) {
  const c = (typeof CREDITS !== 'undefined') && CREDITS[img.p];
  if (!c) return '사진: Wikimedia Commons';
  const [author, l] = c;
  const a = author === 'Unknown' ? 'Wikimedia Commons' : author;
  return l === 'Public domain' || l === 'CC0' ? `${a} · ${l}` : `© ${a} · ${l}`;
}
