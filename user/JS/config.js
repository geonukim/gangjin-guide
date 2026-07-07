/**
 * 강진 여행 가이드 - 사용자 페이지 설정
 * admin/js/config.js 의 API_URL과 반드시 동일한 값을 사용하세요.
 */

const CONFIG = {
  // Apps Script 배포 URL (admin과 동일)
  API_URL: 'https://script.google.com/macros/s/AKfycbwhogyj3Lhf5G6ywDZZdS7dl_iGYtRsiiMJ9Zzk69n95PuyeS-sT-kyHyNE0JLwmj1Amg/exec',

  // 카테고리 ID → 아이콘/이름 폴백 (getCategories API가 아직 없거나 실패했을 때 사용)
  CATEGORY_FALLBACK: {
    cat_001: { name: '맛집',   icon: '🍽️' },
    cat_002: { name: '카페',   icon: '☕' },
    cat_003: { name: '여행지', icon: '🌿' },
    cat_004: { name: '체험',   icon: '🎨' },
    cat_005: { name: '숙소',   icon: '🏡' },
  },

  COLLECTION_TYPE: {
    course:    { label: '추천코스',    icon: '🗺️' },
    situation: { label: '상황별 추천', icon: '⭐' },
    editorial: { label: '편집장 픽',   icon: '✍️' },
  },

  // 로컬(브라우저)에 저장하는 "저장한 곳" 북마크의 storage 키
  BOOKMARK_KEY: 'gangjin_bookmarks',

  // 강진군청 기본 좌표 (지도 초기 위치 폴백)
  DEFAULT_LAT: 34.6420,
  DEFAULT_LNG: 126.7671,
};
