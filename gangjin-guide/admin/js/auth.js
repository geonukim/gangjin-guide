/**
 * 강진 여행 가이드 - 관리자 인증 관리
 */

const Auth = {

  // 로그인 여부 확인
  isLoggedIn() {
    return sessionStorage.getItem(CONFIG.SESSION_KEY) === 'true';
  },

  // 저장된 비밀번호 반환
  getPassword() {
    return sessionStorage.getItem(CONFIG.SESSION_PW_KEY) || '';
  },

  // 로그인 처리
  login(password) {
    sessionStorage.setItem(CONFIG.SESSION_KEY, 'true');
    sessionStorage.setItem(CONFIG.SESSION_PW_KEY, password);
  },

  // 로그아웃 처리
  logout() {
    sessionStorage.removeItem(CONFIG.SESSION_KEY);
    sessionStorage.removeItem(CONFIG.SESSION_PW_KEY);
    window.location.href = './index.html';
  },

  // 로그인 필요 페이지에서 호출 - 미로그인 시 로그인 페이지로 이동
  require() {
    if (!this.isLoggedIn()) {
      window.location.href = './index.html';
      return false;
    }
    return true;
  },
};
