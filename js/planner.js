/* =========================================================
   일정 생성기 (도시 공통)
   1) 일수별 지역 배치(dayPlans)로 하루 권역을 정하고
   2) 그 달 점수가 높은 곳부터 시간 예산 안에서 고른 뒤
   3) 아침형 → 오전형 → 상시 → 저녁형 → 야간형 순서로, 각 그룹은
      최근접 이웃 순으로 정렬해 이동 거리를 줄입니다.

   도시 데이터에서 쓰는 옵션
   - move: 'car' | 'transit'        이동 수단(시간 계산·문구)
   - bases.airport.transfer          공항 이동 고정 시간(분, 공항철도 등)
   - bases.hotel                     기본 숙소
   - stayFor: { region: baseKey }    그 지역을 도는 날 묵을 숙소
   - spot.early   아침에만 의미 있는 곳(시장 등) → 도착일 제외, 맨 앞
   - spot.late    해 진 뒤가 좋은 곳 → 맨 뒤
   - spot.ferry   배로 가는 곳 → 이동 시간 +15분, ⛴ 표시
   ========================================================= */

const Planner = (() => {
  const toRad = d => (d * Math.PI) / 180;
  function km(a, b) {
    const R = 6371;
    const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  const round5 = m => Math.max(10, Math.round(m / 5) * 5);

  function moveMin(a, b, mode) {
    const d = km(a, b) * 1.3;
    const ferry = !!(a.ferry || b.ferry) && a.region !== b.region;
    const fixed = a.transfer || b.transfer;
    if (d < 1.0 && !ferry) return { min: round5(d / 4.5 * 60 + 2), km: d, mode: 'walk' };
    let min;
    if (fixed) min = fixed;
    else if (mode === 'car') min = d / 40 * 60 + 8;                       // 렌터카: 평균 40km/h + 주차
    else min = 10 + Math.min(d, 8) / 18 * 60 + Math.max(0, d - 8) / 65 * 60; // 대중교통: 대기·환승 + 시내/교외 속도
    if (ferry) min += 15;
    return { min: round5(min), km: d, mode: ferry ? 'ferry' : mode };
  }

  const fmt = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

  function score(s, month, primary) {
    let v = s.prio;
    if (s.months) v += s.months.includes(month) ? 3 : -1.5;
    if (s.monthNote && s.monthNote[month] && !s.months) v += 0.5;
    if (s.region === primary) v += 1;
    return v;
  }

  function nearestOrder(list, from) {
    const rest = list.slice(), out = [];
    let cur = from;
    while (rest.length) {
      let bi = 0, bd = Infinity;
      rest.forEach((s, i) => { const d = km(cur, s); if (d < bd) { bd = d; bi = i; } });
      cur = rest.splice(bi, 1)[0];
      out.push(cur);
    }
    return out;
  }

  function order(list, from) {
    const groups = [
      list.filter(s => s.early),
      list.filter(s => !s.early && s.when === 'morning'),
      list.filter(s => !s.early && s.when === 'any'),
      list.filter(s => s.when === 'evening' && !s.late),
      list.filter(s => s.when === 'evening' && s.late),
    ];
    const out = [];
    for (const g of groups) out.push(...nearestOrder(g, out.at(-1) || from));
    return out;
  }

  // 순서가 정해진 장소 목록 → 시간표
  function schedule(list, ctx) {
    const { start, end, startTime, withLunch, lunchText, mode } = ctx;
    const items = [];
    let t = startTime, prev = start, lunchDone = !withLunch;

    items.push({ type: 'base', kind: 'start', name: start.name, lat: start.lat, lng: start.lng, time: fmt(t), label: ctx.startLabel });

    for (const s of list) {
      const mv = moveMin(prev, s, mode);
      if (!lunchDone && t >= 11 * 60 + 30) {
        items.push({ type: 'meal', time: fmt(t), name: '점심', text: lunchText, dur: 60 });
        t += 60; lunchDone = true;
      }
      items.push({ type: 'move', ...mv });
      t += mv.min;
      if (s.when === 'evening' && t < 16 * 60 + 30) {
        const gap = 16 * 60 + 30 - t;
        if (gap >= 30) items.push({ type: 'free', time: fmt(t), name: '자유 시간', text: '카페 · 숙소 체크인 · 휴식', dur: gap });
        t = 16 * 60 + 30;
      }
      items.push({ type: 'spot', spot: s, time: fmt(t), endTime: fmt(t + s.dur), dur: s.dur });
      t += s.dur;
      prev = s;
      if (!lunchDone && t >= 13 * 60) {
        items.push({ type: 'meal', time: fmt(t), name: '점심', text: lunchText, dur: 60 });
        t += 60; lunchDone = true;
      }
    }
    if (!list.length) { // 남은 명소가 없는 날 → 여유 일정
      items.push({ type: 'free', time: fmt(t), name: '자유 일정', text: ctx.freeText, dur: 120 });
      t += 120;
    }
    const mv = moveMin(prev, end, mode);
    items.push({ type: 'move', ...mv });
    t += mv.min;
    items.push({ type: 'base', kind: 'end', name: end.name, lat: end.lat, lng: end.lng, time: fmt(t), label: ctx.endLabel });
    return { items, endMin: t };
  }

  function build(dest, month, days) {
    const plans = dest.dayPlans;
    const keys = Object.keys(plans).map(Number);
    const n = Math.min(Math.max(days, Math.min(...keys)), Math.max(...keys));
    const plan = plans[n];
    const pool = dest.spots.filter(s => !s.only || s.only.includes(month));
    const used = new Set();
    const B = dest.bases;
    const mode = dest.move || 'car';
    const car = mode === 'car';
    let prevEnd = B.airport;
    const out = [];

    plan.forEach((regions, i) => {
      const first = i === 0, last = i === plan.length - 1;
      const primary = regions[0];
      const stayKey = dest.stayFor?.[primary];
      const end = last ? B.airport : (stayKey ? B[stayKey] : B.hotel);
      const startTime = first ? 13 * 60 : 9 * 60;
      const limit = last ? 15 * 60 + 30 : 20 * 60 + 30;
      const ctx = {
        start: prevEnd, end, startTime, mode,
        withLunch: !first,
        lunchText: dest.lunch[primary],
        startLabel: first ? (car ? '도착 · 렌터카 픽업' : '도착') : '출발',
        endLabel: last ? (car ? '렌터카 반납 · 출국' : '출국') : '숙박',
        freeText: last ? '숙소 근처 브런치 · 기념품 쇼핑 후 공항으로' : '마음에 든 곳 다시 가기 · 카페 · 쇼핑',
      };

      const cands = pool
        .filter(s => regions.includes(s.region) && !used.has(s.id) && !(first && s.early))
        .sort((a, b) => score(b, month, primary) - score(a, month, primary));

      let chosen = [];
      for (const c of cands) {
        if (chosen.length >= 6) break;
        const trial = [...chosen, c];
        if (schedule(order(trial, ctx.start), ctx).endMin <= limit) chosen = trial;
      }
      chosen.forEach(s => used.add(s.id));
      const ordered = order(chosen, ctx.start);
      const { items, endMin } = schedule(ordered, ctx);

      const names = ordered.filter(s => s.prio >= 4).slice(0, 2).map(s => s.name.split(' ')[0]);
      out.push({
        day: i + 1,
        regions,
        title: regions.map(r => dest.regions[r].name).join(' · '),
        subtitle: names.length ? names.join('와 ') : '',
        color: dest.regions[primary].color,
        items,
        spots: ordered,
        start: ctx.start,
        end,
        endTime: fmt(endMin),
        totalKm: Math.round(items.filter(x => x.type === 'move').reduce((a, x) => a + x.km, 0)),
      });
      prevEnd = end;
    });
    return out;
  }

  function monthPicks(dest, month) {
    return dest.spots
      .filter(s => !s.only || s.only.includes(month))
      .map(s => ({ s, v: score(s, month, null) }))
      .sort((a, b) => b.v - a.v)
      .map(x => x.s);
  }

  return { build, monthPicks, score };
})();
