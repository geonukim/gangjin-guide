/**
 * 강진 여행 가이드 - 설정 파일
 * ⚠️ Apps Script 배포 URL과 관리자 비밀번호를 입력하세요.
 */

const CONFIG = {
  // Apps Script 배포 URL
  API_URL: 'https://script.google.com/macros/s/AKfycbywKVHVslokEbxE0D-oOrVmfCXGFlBAsjzARHWH_RhH147q1w54Tdj75SOWtGDeoCHrgA/exec',

  // 관리자 비밀번호 (로그인 시 브라우저에서 직접 비교)
  // ⚠️ 비밀번호 변경 시 여기도 함께 수정하세요
  ADMIN_PASSWORD: '1234',

  // 세션 키
  SESSION_KEY   : 'gangjin_admin',
  SESSION_PW_KEY: 'gangjin_admin_pw',
};
