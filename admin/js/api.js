/**
 * 강진 여행 가이드 - API 호출 공통 함수
 * 
 * Apps Script는 CORS 문제로 POST를 지원하지 않으므로
 * 모든 요청을 GET 파라미터로 처리합니다.
 */

const API = {

  // ── 모든 요청을 GET으로 처리 ─────────────────
  async call(action, params = {}) {
    const url = new URL(CONFIG.API_URL);
    url.searchParams.set('action', action);

    // 비밀번호가 필요한 액션은 자동으로 추가
    const adminActions = [
      'adminGetAll','createContent','updateContent','deleteContent',
      'addImage','deleteImage','reorderImages',
      'createCollection','updateCollection','deleteCollection','updateMapping',
      'updateSettings','changePassword','updateCategory',
    ];
    if (adminActions.includes(action)) {
      url.searchParams.set('password', Auth.getPassword());
    }

    // 객체/배열 파라미터는 JSON 직렬화
    Object.keys(params).forEach(k => {
      const v = params[k];
      if (v === undefined || v === '') return;
      if (typeof v === 'object') {
        url.searchParams.set(k, encodeURIComponent(JSON.stringify(v)));
      } else {
        url.searchParams.set(k, v);
      }
    });

    try {
      const res  = await fetch(url.toString());
      const data = await res.json();
      if (data.code === 401) { Auth.logout(); return; }
      if (data.error) throw new Error(data.error);
      return data;
    } catch (err) {
      console.error(`API 오류 [${action}]:`, err);
      throw err;
    }
  },

  // ── 단축 함수 ────────────────────────────────

  // 공개
  getCategories()          { return this.call('getCategories'); },
  getContents(params = {}) { return this.call('getContents', params); },
  getContent(id)           { return this.call('getContent', { id }); },
  getCollections(p = {})   { return this.call('getCollections', p); },
  getCollection(id)        { return this.call('getCollection', { id }); },
  getSettings()            { return this.call('getSettings'); },
  getTags()                { return this.call('getTags'); },

  // 관리자
  adminGetAll()                   { return this.call('adminGetAll'); },
  createContent(data)             { return this.call('createContent',    { data }); },
  updateContent(id, data)         { return this.call('updateContent',    { id, data }); },
  deleteContent(id)               { return this.call('deleteContent',    { id }); },
  addImage(data)                  { return this.call('addImage',         { data }); },
  deleteImage(imageId)            { return this.call('deleteImage',      { imageId }); },
  createCollection(data)          { return this.call('createCollection', { data }); },
  updateCollection(id, data)      { return this.call('updateCollection', { id, data }); },
  deleteCollection(id)            { return this.call('deleteCollection', { id }); },
  updateSettings(data)            { return this.call('updateSettings',   { data }); },
  changePassword(newPassword)     { return this.call('changePassword',   { newPassword }); },
};
