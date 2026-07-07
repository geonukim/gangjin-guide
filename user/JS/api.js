/**
 * 강진 여행 가이드 - 사용자 페이지 API 호출 공통 함수
 *
 * admin/js/api.js 와 동일하게 GET 파라미터 방식으로 호출합니다.
 * 공개 페이지이므로 비밀번호(password)는 절대 붙이지 않습니다.
 *
 * ⚠️ 참고: getContents / getCollections / getCollection 응답의 정확한 형태는
 * Apps Script 코드에 따라 다를 수 있어 아래에서 몇 가지 흔한 형태를
 * 모두 인식하도록 방어적으로 정규화합니다. 실제 배포 후 콘솔에서
 * 응답 형태가 다르게 나온다면 normalize* 함수만 손보면 됩니다.
 */

const API = {

  async call(action, params = {}) {
    const url = new URL(CONFIG.API_URL);
    url.searchParams.set('action', action);

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
      if (data.error) throw new Error(data.error);
      return data;
    } catch (err) {
      console.error(`API 오류 [${action}]:`, err);
      throw err;
    }
  },

  getCategories()          { return this.call('getCategories'); },
  getContents(params = {}) { return this.call('getContents', params); },
  getContent(id)           { return this.call('getContent', { id }); },
  getCollections(p = {})   { return this.call('getCollections', p); },
  getCollection(id)        { return this.call('getCollection', { id }); },
  getSettings()            { return this.call('getSettings'); },
  getTags()                { return this.call('getTags'); },
};

/* ===================== 응답 정규화 유틸 ===================== */

/**
 * getContents() 응답을 { contents:[], images:[], tags:[] } 형태로 통일.
 * - res.data 가 배열이면 그 자체를 contents 로 사용 (images/tags가 각 항목에
 *   내장돼 있으면 그대로 펼쳐서 별도 배열도 만들어 준다)
 * - res.data 가 {contents,images,tags} 객체면 그대로 사용
 */
function normalizeContents(res) {
  const data = res?.data;
  if (!data) return { contents: [], images: [], tags: [] };

  if (Array.isArray(data)) {
    const contents = data;
    const images = [];
    const tags   = [];
    contents.forEach(c => {
      (c.images || []).forEach(img => images.push({ ContentID: c.ID, ...img }));
      (c.tags   || []).forEach(t   => tags.push({ ContentID: c.ID, TagName: t }));
    });
    return { contents, images, tags };
  }

  return {
    contents: data.contents || [],
    images  : data.images   || [],
    tags    : data.tags     || [],
  };
}

/** 콘텐츠 배열 + 별도 images 배열을 각 콘텐츠에 imgList로 합쳐준다 */
function attachThumbs(contents, images) {
  return contents.map(c => {
    if (c.images) return c; // 이미 내장돼 있으면 그대로
    const own = images.filter(img => img.ContentID === c.ID).sort((a, b) => (a.SortOrder||0) - (b.SortOrder||0));
    return { ...c, images: own };
  });
}

/** 콘텐츠 배열 + 별도 tags 배열을 각 콘텐츠에 tags로 합쳐준다 */
function attachTags(contents, tags) {
  return contents.map(c => {
    if (Array.isArray(c.tags)) return c;
    const own = tags.filter(t => t.ContentID === c.ID).map(t => t.TagName || t);
    return { ...c, tags: own };
  });
}

/**
 * getCollections() 응답을 컬렉션 배열로 통일.
 */
function normalizeCollections(res) {
  const data = res?.data;
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.collections || [];
}

/**
 * getCollection(id) 단건 응답을 { meta, itemIds } 형태로 통일.
 * items가 이미 완전한 콘텐츠 객체(Title 존재)인지, ID 목록/매핑 객체인지 구분한다.
 */
function normalizeCollection(res) {
  const data = res?.data || {};
  const rawItems = data.items || data.contents || data.mappings || data.places || [];

  const hydrated = rawItems.length > 0 && typeof rawItems[0] === 'object' && 'Title' in rawItems[0];

  return {
    meta: {
      CollectionID: data.CollectionID || data.ID,
      Type        : data.Type,
      Title       : data.Title,
      Subtitle    : data.Subtitle,
      CoverImage  : data.CoverImage,
      SortOrder   : data.SortOrder,
    },
    hydratedItems: hydrated ? rawItems : null,
    refs: hydrated ? null : rawItems.map(it => ({
      ContentID: typeof it === 'string' ? it : (it.ContentID || it.id || it.ID),
      SortOrder: typeof it === 'object' ? (it.SortOrder ?? 0) : 0,
      Note     : typeof it === 'object' ? (it.Note || it.note || '') : '',
    })),
  };
}
