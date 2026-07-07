/**
 * 강진 여행 가이드 - 사용자 페이지 공통 유틸
 */

/* ===================== 저장(북마크) - 로그인 없이 브라우저에 보관 ===================== */
const Bookmarks = {
  _read() {
    try { return JSON.parse(localStorage.getItem(CONFIG.BOOKMARK_KEY)) || []; }
    catch { return []; }
  },
  all() { return this._read(); },
  has(id) { return this._read().includes(id); },
  toggle(id) {
    const list = this._read();
    const idx  = list.indexOf(id);
    if (idx >= 0) { list.splice(idx, 1); }
    else          { list.push(id); }
    localStorage.setItem(CONFIG.BOOKMARK_KEY, JSON.stringify(list));
    return idx < 0; // true면 새로 저장됨
  },
};

/* ===================== 토스트 ===================== */
function showToast(msg) {
  let t = document.getElementById('globalToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'globalToast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 1800);
}

/* ===================== 하트(저장) 버튼 바인딩 ===================== */
function heartSvg() {
  return '<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
}
function renderHeartBtn(id, size = '') {
  const saved = Bookmarks.has(id);
  return `<button class="heart-btn ${size} ${saved ? 'saved' : ''}" data-heart="${id}" onclick="event.stopPropagation();onHeartClick(this,'${id}')">${heartSvg()}</button>`;
}
function onHeartClick(btn, id) {
  const nowSaved = Bookmarks.toggle(id);
  document.querySelectorAll(`[data-heart="${id}"]`).forEach(b => b.classList.toggle('saved', nowSaved));
  showToast(nowSaved ? '저장한 곳에 추가했어요' : '저장을 취소했어요');
}

/* ===================== 거리 계산 (가까운순 정렬용) ===================== */
function haversineKm(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some(v => v === undefined || v === null || v === '' || isNaN(v))) return Infinity;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function getUserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      ()  => resolve(null),
      { timeout: 5000 }
    );
  });
}

/* ===================== 외부 지도 링크 ===================== */
function kakaoMapLink(place) {
  const { Title, Latitude, Longitude, Address } = place;
  if (Latitude && Longitude) {
    return `https://map.kakao.com/link/to/${encodeURIComponent(Title || '목적지')},${Latitude},${Longitude}`;
  }
  return `https://map.kakao.com/link/search/${encodeURIComponent(Address || Title || '강진')}`;
}

/* ===================== 이미지 / 썸네일 ===================== */
function firstThumb(content) {
  const imgs = content.images || [];
  const sorted = [...imgs].sort((a,b)=>(a.SortOrder||0)-(b.SortOrder||0));
  return sorted[0]?.DriveURL || '';
}
function imgFallbackAttr() {
  return `onerror="this.closest('.thumb, .hero, .editorial-banner, .course-hero')?.classList.add('img-error');this.style.display='none';"`;
}

/* ===================== 카테고리 아이콘/이름 ===================== */
function categoryMeta(catId, categories) {
  const found = (categories || []).find(c => (c.CategoryID || c.ID) === catId);
  if (found) return { name: found.Name || found.name || catId, icon: found.Icon || found.icon || '📍' };
  const fb = CONFIG.CATEGORY_FALLBACK[catId];
  return fb || { name: catId || '기타', icon: '📍' };
}

/* ===================== 공유 ===================== */
async function sharePage(title, text) {
  const url = location.href;
  if (navigator.share) {
    try { await navigator.share({ title, text, url }); return; } catch { /* 취소됨 */ return; }
  }
  try {
    await navigator.clipboard.writeText(url);
    showToast('링크가 복사되었어요');
  } catch {
    showToast('공유하기를 지원하지 않는 브라우저예요');
  }
}

/* ===================== 날짜/문자 유틸 ===================== */
function truncate(str, n) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '…' : str;
}

/* ===================== URL 쿼리 헬퍼 ===================== */
function qs(key) { return new URLSearchParams(location.search).get(key); }

/* ===================== 하단 네비게이션 (공통 삽입) ===================== */
function renderBottomNav(active) {
  const root = document.getElementById('bottomNavRoot');
  if (!root) return;
  const item = (key, label, path, svg) => `
    <button class="nav-btn ${active === key ? 'active' : ''}" onclick="location.href='${path}'">
      ${svg}<span>${label}</span>
    </button>`;

  root.innerHTML = `
    <nav class="bottom-nav">
      ${item('home','홈','index.html','<svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/></svg>')}
      ${item('explore','탐색','list.html','<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.6" y2="16.6"/></svg>')}
      ${item('saved','저장','list.html?view=saved','<svg viewBox="0 0 24 24"><path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>')}
      ${item('map','지도','list.html?view=map','<svg viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>')}
      <button class="nav-btn" onclick="openMoreSheet()">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg><span>더보기</span>
      </button>
    </nav>
    <div class="sheet-overlay" id="moreSheetOverlay" onclick="if(event.target===this)closeMoreSheet()">
      <div class="sheet">
        <div class="sheet-handle"></div>
        <h3>강진 여행 가이드</h3>
        <div class="sheet-link" onclick="sharePage('강진 여행 가이드','천천히, 강진을 느껴보세요');closeMoreSheet();">
          <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>
          친구에게 공유하기
        </div>
        <div class="sheet-link" onclick="location.href='list.html?view=saved'">
          <svg viewBox="0 0 24 24"><path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          저장한 곳 모아보기
        </div>
        <div class="sheet-link" onclick="location.href='course.html?filterType=course'">
          <svg viewBox="0 0 24 24"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
          추천 코스 둘러보기
        </div>
        <div id="moreSheetContact" class="sheet-link" style="display:none;"></div>
        <div class="sheet-link" onclick="closeMoreSheet()" style="color:var(--muted);">
          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          닫기
        </div>
      </div>
    </div>`;

  // 설정에서 문의 이메일을 가져와 표시 (있을 때만)
  API.getSettings().then(res => {
    const email = res?.data?.contact_email;
    if (!email) return;
    const el = document.getElementById('moreSheetContact');
    el.style.display = 'flex';
    el.innerHTML = `<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="m22 6-10 7L2 6"/></svg>${email} 로 문의하기`;
    el.onclick = () => { location.href = `mailto:${email}`; };
  }).catch(() => {});
}

function openMoreSheet()  { document.getElementById('moreSheetOverlay')?.classList.add('show'); }
function closeMoreSheet() { document.getElementById('moreSheetOverlay')?.classList.remove('show'); }

/* ===================== 지도 (Leaflet + OpenStreetMap, API 키 불필요) ===================== */
let _leafletLoading = null;
function loadLeaflet() {
  if (window.L) return Promise.resolve();
  if (_leafletLoading) return _leafletLoading;
  _leafletLoading = new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
  return _leafletLoading;
}

const pinDivIcon = (color = '#2B3D2C', emoji = '') => window.L.divIcon({
  className: '',
  html: `<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.35);border:2px solid #fff;">
           <span style="transform:rotate(45deg);font-size:13px;">${emoji}</span>
         </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 29],
  popupAnchor: [0, -28],
});

/** 단일 마커 지도 (detail.html) */
async function renderSingleMap(elId, place) {
  const el = document.getElementById(elId);
  if (!el) return;
  const lat = parseFloat(place.Latitude), lng = parseFloat(place.Longitude);
  if (!lat || !lng) {
    el.innerHTML = `<div class="map-fallback">등록된 좌표가 없어요.<br>${place.Address || ''}</div>`;
    return;
  }
  try {
    await loadLeaflet();
    const map = L.map(el, { zoomControl: false, attributionControl: false }).setView([lat, lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.marker([lat, lng], { icon: pinDivIcon('#2B3D2C', '📍') }).addTo(map);
  } catch {
    el.innerHTML = `<div class="map-fallback">지도를 불러오지 못했어요.</div>`;
  }
}

/** 여러 지점 지도 (list.html 지도뷰, course.html 코스뷰) */
async function renderMultiMap(elId, places, { route = false, onPinClick = null } = {}) {
  const el = document.getElementById(elId);
  if (!el) return null;
  const pts = places
    .map(p => ({ ...p, lat: parseFloat(p.Latitude), lng: parseFloat(p.Longitude) }))
    .filter(p => p.lat && p.lng);

  try {
    await loadLeaflet();
    const center = pts.length ? [pts[0].lat, pts[0].lng] : [CONFIG.DEFAULT_LAT, CONFIG.DEFAULT_LNG];
    const map = L.map(el, { zoomControl: true, attributionControl: false }).setView(center, pts.length ? 12 : 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const markers = pts.map((p, i) => {
      const icon = route ? pinDivIcon('#2B3D2C', String(i + 1)) : pinDivIcon('#4A6B4C', '📍');
      const m = L.marker([p.lat, p.lng], { icon }).addTo(map);
      if (onPinClick) m.on('click', () => onPinClick(p));
      return m;
    });

    if (route && pts.length > 1) {
      L.polyline(pts.map(p => [p.lat, p.lng]), { color: '#4A6B4C', weight: 3, dashArray: '6 6' }).addTo(map);
    }
    if (pts.length > 1) {
      map.fitBounds(L.latLngBounds(pts.map(p => [p.lat, p.lng])), { padding: [32, 32] });
    }
    return map;
  } catch {
    el.innerHTML = `<div class="map-fallback">지도를 불러오지 못했어요.</div>`;
    return null;
  }
}
