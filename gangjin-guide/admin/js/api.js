/**
 * 강진 여행 가이드 - API 호출 공통 함수
 */

const API = {

  // ── GET 요청 (공개 데이터 조회) ──────────────────
  async get(action, params = {}) {
    const url = new URL(CONFIG.API_URL);
    url.searchParams.set('action', action);
    Object.keys(params).forEach(k => {
      if (params[k] !== undefined && params[k] !== '') {
        url.searchParams.set(k, params[k]);
      }
    });

    try {
      const res  = await fetch(url.toString());
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data;
    } catch (err) {
      console.error(`API GET 오류 [${action}]:`, err);
      throw err;
    }
  },

  // ── POST 요청 (관리자 CRUD) ──────────────────────
  async post(action, body = {}) {
    try {
      const res = await fetch(CONFIG.API_URL, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          action,
          password: Auth.getPassword(),
          ...body,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data;
    } catch (err) {
      console.error(`API POST 오류 [${action}]:`, err);
      throw err;
    }
  },

  // ── 자주 쓰는 API 단축 함수 ─────────────────────

  // 카테고리
  getCategories()          { return this.get('getCategories'); },

  // 콘텐츠
  getContents(params = {}) { return this.get('getContents', params); },
  getContent(id)           { return this.get('getContent', { id }); },
  createContent(data)      { return this.post('createContent', { data }); },
  updateContent(id, data)  { return this.post('updateContent', { id, data }); },
  deleteContent(id)        { return this.post('deleteContent', { id }); },

  // 이미지
  addImage(data)                        { return this.post('addImage', { data }); },
  deleteImage(imageId)                  { return this.post('deleteImage', { imageId }); },
  reorderImages(contentId, order)       { return this.post('reorderImages', { contentId, order }); },

  // 컬렉션
  getCollections(params = {})           { return this.get('getCollections', params); },
  getCollection(id)                     { return this.get('getCollection', { id }); },
  createCollection(data)                { return this.post('createCollection', { data }); },
  updateCollection(id, data)            { return this.post('updateCollection', { id, data }); },
  deleteCollection(id)                  { return this.post('deleteCollection', { id }); },

  // 설정
  getSettings()                         { return this.get('getSettings'); },
  updateSettings(data)                  { return this.post('updateSettings', { data }); },
  changePassword(newPassword)           { return this.post('changePassword', { newPassword }); },

  // 관리자 전체 데이터
  adminGetAll() {
    return this.get('adminGetAll', { password: Auth.getPassword() });
  },

  // 태그
  getTags() { return this.get('getTags'); },
};
