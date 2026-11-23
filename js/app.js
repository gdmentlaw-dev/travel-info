/* =========================================================
   화면 렌더링 + 스크롤 애니메이션(Lenis + GSAP ScrollTrigger) + 지도(Leaflet)
   ========================================================= */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const CAT = { sight: '관광', activity: '액티비티', relax: '휴양' };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis ↔ ScrollTrigger ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;
  }
  const scrollToEl = (el, offset = -80) => {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = $(a.getAttribute('href'));
    if (t) { e.preventDefault(); scrollToEl(t, a.getAttribute('href') === '#top' ? 0 : -70); }
  }));

  /* ---------- 고정 애니메이션 (히어로, 상단바) ---------- */
  ScrollTrigger.create({
    start: () => window.innerHeight * 0.85, end: 'max',
    onToggle: self => $('.topbar').classList.toggle('solid', self.isActive),
  });
  if (!reduce) {
    gsap.to('.hero-media img', { yPercent: 12, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-inner', { y: -80, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: true } });
  }

  /* ---------- 폼 ---------- */
  const form = $('#searchForm'), citySel = $('#citySelect'), monthSel = $('#monthSelect'), seg = $('#daysSeg'), msg = $('#searchMsg');
  // 남쪽 → 북쪽 순서로 드롭다운 구성
  const cities = Object.values(DESTINATIONS).sort((a, b) => a.center[0] - b.center[0]);
  citySel.innerHTML = cities.map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join('');
  for (let m = 1; m <= 12; m++) monthSel.insertAdjacentHTML('beforeend', `<option value="${m}">${m}월</option>`);
  [2, 3, 4, 5].forEach(d => seg.insertAdjacentHTML('beforeend',
    `<label><input type="radio" name="days" value="${d}"><span>${d - 1}박 ${d}일</span></label>`));

  const findDest = q => {
    const k = String(q || '').trim().toLowerCase();
    return DESTINATIONS[k] || Object.values(DESTINATIONS).find(d => d.aliases.some(a => a.toLowerCase() === k));
  };

  const params = new URLSearchParams(location.search);
  const state = {
    city: params.get('city') || 'okinawa',
    month: Math.min(12, Math.max(1, +params.get('month') || 12)),
    days: +params.get('days') || 4,
  };
  const initDest = findDest(state.city) || DESTINATIONS.okinawa;
  citySel.value = initDest.id;
  monthSel.value = state.month;
  (seg.querySelector(`input[value="${state.days}"]`) || seg.querySelector('input[value="4"]')).checked = true;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const dest = DESTINATIONS[citySel.value];
    msg.textContent = '';
    const month = +monthSel.value, days = +(seg.querySelector('input:checked')?.value || 4);
    history.replaceState(null, '', `?city=${dest.id}&month=${month}&days=${days}`);
    render(dest, month, days);
    requestAnimationFrame(() => scrollToEl($('#season'), -40));
  });

  /* ---------- 지도 ---------- */
  const map = L.map('map', { zoomControl: false, scrollWheelZoom: true, attributionControl: true });
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  let layer = L.layerGroup().addTo(map);
  let markers = {}, dayLayers = [], currentDays = [], activeMarker = null, activeDay = 0;

  function drawMap(dest, days) {
    layer.clearLayers(); markers = {}; dayLayers = [];
    days.forEach((d, di) => {
      const g = L.layerGroup();
      const pts = [[d.start.lat, d.start.lng], ...d.spots.map(s => [s.lat, s.lng]), [d.end.lat, d.end.lng]];
      g.addLayer(L.polyline(pts, { color: d.color, weight: 4, opacity: .85, dashArray: '2 8', lineCap: 'round' }));
      d.spots.forEach((s, i) => {
        const icon = L.divIcon({ className: '', html: `<div class="mk" style="--c:${d.color}"><span>${i + 1}</span></div>`, iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28] });
        const m = L.marker([s.lat, s.lng], { icon, riseOnHover: true })
          .bindPopup(`<div class="pop"><img src="${imgUrl(s.img, 500)}" alt=""><b>Day ${d.day} · ${esc(s.name)}</b><small>${esc(s.local)} · ${CAT[s.cat]}</small></div>`);
        m.on('click', () => scrollToEl($(`#ti-${s.id}`), -window.innerHeight * 0.3));
        markers[s.id] = m;
        g.addLayer(m);
      });
      [d.start, d.end].forEach(b => g.addLayer(L.marker([b.lat, b.lng], {
        icon: L.divIcon({ className: '', html: '<div class="mk-base"></div>', iconSize: [14, 14], iconAnchor: [7, 7] }),
      }).bindTooltip(b.name)));
      dayLayers.push({ g, pts });
    });

    $('#mapDays').innerHTML = `<button data-d="0" class="on">전체</button>` +
      days.map(d => `<button data-d="${d.day}" style="--c:${d.color}">Day ${d.day}</button>`).join('');
    showDay(0, false);
  }

  function showDay(n, animate = true) {
    activeDay = n;
    layer.clearLayers();
    dayLayers.forEach((dl, i) => { if (n === 0 || n === i + 1) layer.addLayer(dl.g); });
    $$('#mapDays button').forEach(b => b.classList.toggle('on', +b.dataset.d === n));
    const pts = n === 0 ? dayLayers.flatMap(d => d.pts) : dayLayers[n - 1]?.pts;
    if (pts?.length) {
      const b = L.latLngBounds(pts);
      animate && !reduce ? map.flyToBounds(b, { padding: [60, 60], duration: 1.1, maxZoom: 13 }) : map.fitBounds(b, { padding: [60, 60], maxZoom: 13 });
    }
  }
  $('#mapDays').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const n = +b.dataset.d;
    showDay(n);
    if (n) scrollToEl($(`#day-${n}`), -80);
  });

  function focusSpot(id, dayN) {
    if (activeDay !== dayN) showDay(dayN, false);
    const m = markers[id]; if (!m) return;
    if (activeMarker) activeMarker.getElement()?.querySelector('.mk')?.classList.remove('on');
    activeMarker = m;
    m.getElement()?.querySelector('.mk')?.classList.add('on');
    reduce ? map.setView(m.getLatLng(), 13) : map.flyTo(m.getLatLng(), 13, { duration: 1.2 });
  }

  /* ---------- 렌더 ---------- */
  let ctx = null;

  function render(dest, month, days) {
    ctx && ctx.revert();
    const plan = Planner.build(dest, month, days);
    currentDays = plan;
    const cl = dest.climate[month];

    // hero
    $('#heroImg').src = imgUrl(dest.hero, 1920);
    $('#heroCredit').href = imgCredit(dest.hero);
    $('#heroCredit').textContent = creditLabel(dest.hero);
    $('#heroEyebrow').textContent = `${dest.nameEn} · ${month}월 · ${plan.length - 1}박 ${plan.length}일`;
    $('#heroTitle').innerHTML = splitChars(`${month}월의 ${dest.name}`);
    $('#heroSub').textContent = dest.tagline;
    document.title = `${month}월 ${dest.name} ${plan.length}일 여행 — 여행노트`;

    // season
    $('#seasonKicker').textContent = `${dest.nameEn} IN ${['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'][month - 1]}`;
    $('#seasonTitle').innerHTML = `${month}월 ${dest.name}는 <em>${seasonPhrase(cl.t, month)}</em>`;
    const temps = Object.values(dest.climate).map(c => c.t), tMin = Math.min(...temps) - 3, tMax = Math.max(...temps);
    $('#climate').innerHTML = `
      <div class="c-big"><b>${Math.round(cl.t)}°</b><small>평균 기온 · 낮 최고 ${cl.hi}°C</small></div>
      <dl><dt>강수량</dt><dd>${cl.rain}mm</dd></dl>
      ${cl.sea ? `<dl><dt>수온</dt><dd>약 ${cl.sea}°C</dd></dl>` : `<dl><dt>연중 기온 범위</dt><dd>${Math.round(Math.min(...temps))}° ~ ${Math.round(Math.max(...temps))}°</dd></dl>`}
      <dl style="grid-column:1/-1"><dt>옷차림</dt><dd>${esc(cl.wear || wearFor(cl.t))}</dd></dl>
      <div class="temp-bars" aria-label="월별 평균 기온">${temps.map((t, i) => `<i class="${i + 1 === month ? 'on' : ''}" data-m="${i + 1}" style="height:${((t - tMin) / (tMax - tMin) * 100).toFixed(0)}%" title="${i + 1}월 ${t}°C"></i>`).join('')}</div>
      <p class="c-note" style="margin-top:14px">${esc(cl.note)}</p>`;
    const hls = dest.monthHighlights?.[month] ||
      [...(dest.events || []).filter(e => e.m.includes(month)), ...autoHighlights(dest, month)].slice(0, 4);
    $('#highlights').innerHTML = hls.map(h => `<div class="hl"><div class="i">${h.icon}</div><h3>${esc(h.title)}</h3><p>${esc(h.text)}</p></div>`).join('');

    // gallery
    const picks = Planner.monthPicks(dest, month);
    $('#picksTitle').innerHTML = `${month}월에 가기 좋은 <em>${dest.name}</em>`;
    $('#chips').innerHTML = [['all', '전체'], ['sight', '관광'], ['activity', '액티비티'], ['relax', '휴양']]
      .map(([k, v], i) => `<button class="chip" role="tab" data-cat="${k}" aria-selected="${i === 0}">${v} <small>${k === 'all' ? picks.length : picks.filter(p => p.cat === k).length}</small></button>`).join('');
    $('#gallery').innerHTML = picks.map((s, i) => {
      const size = i === 0 || i === 7 ? 'big' : (i % 5 === 3 ? 'tall' : '');
      const badge = s.only ? `<span class="badge only">${month}월 한정 시즌</span>` : (s.months?.includes(month) ? `<span class="badge">${month}월 추천</span>` : '');
      return `<button class="card ${size}" data-cat="${s.cat}" data-id="${s.id}" type="button">
        <img src="${imgUrl(s.img, size === 'big' ? 1920 : 960)}" alt="${esc(s.name)}" loading="lazy" onerror="this.style.display='none'">
        ${badge}
        <a class="credit" href="${imgCredit(s.img)}" target="_blank" rel="noopener" title="사진 원본·라이선스 보기">${esc(creditLabel(s.img))}</a>
        <div class="meta"><div class="cat">${CAT[s.cat]} · ${dest.regions[s.region].name}</div><h3>${esc(s.name)}</h3><p>${esc(s.desc)}</p></div>
      </button>`;
    }).join('');

    // timeline
    $('#planTitle').innerHTML = `동선을 따라 짠 <em>${plan.length - 1}박 ${plan.length}일</em>`;
    $('#planNote').textContent = (dest.move === 'car'
      ? '렌터카 이동 기준 예상 시간입니다.'
      : '전철·버스·도보 기준 예상 시간입니다 (공항은 공항철도·리무진 기준).') + ' 지도의 선은 방문 순서를 잇는 직선이에요.';
    $('#timeline').innerHTML = plan.map(d => dayHTML(d, dest, month)).join('');

    drawMap(dest, plan);
    requestAnimationFrame(() => map.invalidateSize());
    animate();
  }

  function autoHighlights(dest, month) {
    return Planner.monthPicks(dest, month).slice(0, 4).map(s => ({ icon: { sight: '🏯', activity: '🤿', relax: '🌴' }[s.cat], title: s.name, text: s.desc }));
  }

  function seasonPhrase(t, m) {
    if (t < 0) return '눈과 온천의 한겨울';
    if (t < 7) return [12, 1, 2].includes(m) ? '맑고 쌀쌀한 겨울 여행' : '아직 쌀쌀한 날씨';
    if (t < 13) return [3, 4, 5].includes(m) ? '봄을 기다리는 산뜻한 계절' : '선선한 늦가을·초겨울';
    if (t < 20) return [3, 4, 5].includes(m) ? '꽃 피는 봄 산책' : [9, 10, 11].includes(m) ? '걷기 좋은 가을' : '선선한 겨울 여행';
    if (t < 25) return '쾌적한 여행 날씨';
    return '뜨거운 여름의 계절';
  }

  function splitChars(t) {
    return t.split(' ').map(w => `<span style="display:inline-block;white-space:nowrap">${[...w].map(c => `<span class="ch">${esc(c)}</span>`).join('')}</span>`).join(' ');
  }

  function dayHTML(d, dest, month) {
    let n = 0;
    const rows = d.items.map(it => {
      if (it.type === 'move') {
        const ic = { walk: '🚶 도보', car: '🚗', transit: '🚃', ferry: '⛴ 페리 포함' }[it.mode];
        return `<div class="ti move">${ic} 약 ${it.min}분${it.mode === 'walk' ? '' : ` · ${it.km.toFixed(0)}km`}</div>`;
      }
      if (it.type === 'base') return `<div class="ti base"><span class="dot"></span><span class="time">${it.time}</span><div><b>${esc(it.name)}</b> <small>${esc(it.label)}</small></div></div>`;
      if (it.type === 'meal') return `<div class="ti meal"><span class="dot">🍜</span><span class="time">${it.time}</span><div class="txt"><b>점심</b> · ${esc(it.text)}</div></div>`;
      if (it.type === 'free') return `<div class="ti free"><span class="dot">☕</span><span class="time">${it.time}</span><div class="txt"><b>${esc(it.name)}</b> · ${esc(it.text)}</div></div>`;
      const s = it.spot; n++;
      const mNote = s.monthNote?.[month];
      const h = Math.floor(it.dur / 60), m = it.dur % 60;
      return `<article class="ti spot" id="ti-${s.id}" data-id="${s.id}" data-day="${d.day}">
        <span class="dot">${n}</span>
        <div class="scard">
          <div class="ph">
            <img src="${imgUrl(s.img, 1280)}" alt="${esc(s.name)}" loading="lazy" onerror="this.style.display='none'">
            <span class="ptime">${it.time} <small>– ${it.endTime}</small></span>
            <a class="credit" href="${imgCredit(s.img)}" target="_blank" rel="noopener" title="사진 원본·라이선스 보기">${s.photoNote ? esc(s.photoNote) + ' · ' : ''}${esc(creditLabel(s.img))}</a>
          </div>
          <div class="body">
            <div class="row"><span class="cat">${CAT[s.cat]}</span><span>·</span><span>${dest.regions[s.region].name}</span><span>·</span><span>체류 ${h ? h + '시간 ' : ''}${m ? m + '분' : ''}</span></div>
            <h4>${esc(s.name)}</h4>
            <div class="local">${esc(s.local)}</div>
            <p class="desc">${esc(s.desc)}</p>
            ${mNote ? `<p class="note"><b>${month}월 팁</b> ${esc(mNote)}</p>` : ''}
            ${s.tip ? `<p class="note"><b>TIP</b> ${esc(s.tip)}</p>` : ''}
            <div class="tags">${s.tags.map(t => `<span>#${esc(t)}</span>`).join('')}</div>
          </div>
        </div>
      </article>`;
    }).join('');
    return `<section class="day" id="day-${d.day}" data-day="${d.day}" style="--c:${d.color}">
      <header class="day-head">
        <span class="day-num">${String(d.day).padStart(2, '0')}</span>
        <div><h3>Day ${d.day} · ${esc(d.title)}</h3><p>${esc(d.subtitle)}${d.subtitle ? ' 중심 · ' : ''}${d.spots.length ? d.spots.length + '곳' : '여유 일정'} ·이동 약 ${d.totalKm}km · ${d.endTime} 일정 종료</p></div>
      </header>
      <div class="tl"><span class="tl-line"></span><span class="tl-progress"></span>${rows}</div>
    </section>`;
  }

  /* ---------- 스크롤 애니메이션 ---------- */
  function animate() {
    ctx = gsap.context(() => {
      // 히어로 타이틀
      gsap.from('.hero-title .ch', { yPercent: 110, opacity: 0, duration: .9, stagger: .035, ease: 'power3.out' });
      gsap.from(['.hero-eyebrow', '.hero-sub'], { y: 20, opacity: 0, duration: .9, delay: .2, ease: 'power2.out' });

      if (reduce) return;

      $$('.reveal').forEach(el => gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }));
      gsap.from('.hl', { y: 40, opacity: 0, duration: .8, stagger: .1, ease: 'power2.out', scrollTrigger: { trigger: '.highlights', start: 'top 80%' } });
      gsap.from('.temp-bars i', { scaleY: 0, transformOrigin: 'bottom', duration: .8, stagger: .04, ease: 'power2.out', scrollTrigger: { trigger: '.climate', start: 'top 75%' } });

      // 갤러리 카드
      gsap.set('.card', { y: 60, opacity: 0 });
      ScrollTrigger.batch('.card', {
        start: 'top 92%',
        onEnter: b => gsap.to(b, { y: 0, opacity: 1, duration: .9, stagger: .08, ease: 'power3.out', overwrite: true }),
      });
      $$('.card img').forEach(img => gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));

      // 타임라인
      $$('.day').forEach(day => {
        const n = +day.dataset.day;
        gsap.fromTo($('.tl-progress', day), { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: $('.tl', day), start: 'top 60%', end: 'bottom 60%', scrub: true } });
        gsap.from($('.day-num', day), { yPercent: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: day, start: 'top 80%' } });
        gsap.from($('.day-head h3', day), { x: -30, opacity: 0, duration: .9, delay: .1, ease: 'power3.out', scrollTrigger: { trigger: day, start: 'top 80%' } });
        ScrollTrigger.create({ trigger: day, start: 'top 55%', end: 'bottom 55%', onEnter: () => showDay(n), onEnterBack: () => showDay(n) });
      });

      $$('.ti').forEach(el => {
        if (el.classList.contains('spot')) {
          const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 82%' } });
          tl.from($('.dot', el), { scale: 0, duration: .5, ease: 'back.out(2.5)' })
            .fromTo($('.scard', el), { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: .9, ease: 'power3.out' }, '<.05')
            .from($('.ph', el), { clipPath: 'inset(0 100% 0 0)', duration: 1.1, ease: 'power4.inOut' }, '<')
            .from($$('.body > *', el), { y: 16, opacity: 0, duration: .6, stagger: .06, ease: 'power2.out' }, '-=.6');
          gsap.fromTo($('.ph img', el), { yPercent: -10 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
          ScrollTrigger.create({
            trigger: el, start: 'top 50%', end: 'bottom 50%',
            onToggle: self => {
              el.classList.toggle('active', self.isActive);
              if (self.isActive) focusSpot(el.dataset.id, +el.dataset.day);
            },
          });
        } else {
          gsap.fromTo(el, { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: .6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
        }
      });
    });
    ScrollTrigger.refresh();
  }

  /* ---------- 갤러리 필터 & 클릭 ---------- */
  $('#chips').addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    $$('.chip').forEach(c => c.setAttribute('aria-selected', c === b));
    const cat = b.dataset.cat;
    const cards = $$('.card');
    cards.forEach(c => c.classList.toggle('is-hidden', cat !== 'all' && c.dataset.cat !== cat));
    gsap.fromTo(cards.filter(c => !c.classList.contains('is-hidden')), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .05, ease: 'power2.out', overwrite: true });
    ScrollTrigger.refresh();
  });
  $('#gallery').addEventListener('click', e => {
    if (e.target.closest('.credit')) return;
    const c = e.target.closest('.card'); if (!c) return;
    const target = $(`#ti-${c.dataset.id}`);
    if (target) scrollToEl(target, -window.innerHeight * 0.25);
    else {
      msg.textContent = '';
      const d = Object.values(DESTINATIONS).find(x => x.spots.some(s => s.id === c.dataset.id));
      const s = d.spots.find(s => s.id === c.dataset.id);
      scrollToEl($('#plan'), -60);
      setTimeout(() => {
        showDay(0);
        L.popup().setLatLng([s.lat, s.lng]).setContent(`<div class="pop"><img src="${imgUrl(s.img, 500)}" alt=""><b>${esc(s.name)}</b><small>이번 일정엔 포함되지 않았어요. 일수를 늘려 보세요.</small></div>`).openOn(map);
      }, 900);
    }
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
  render(initDest, state.month, $('#daysSeg input:checked').value | 0);
})();
