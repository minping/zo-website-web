// API 配置文件
// 后端接口地址（开发环境 / 生产环境自动切换）
// export const API_BASE_URL = import.meta.env.PROD
//   ? 'https://www.mpgapay.cn/website'
//   : 'http://localhost:8014/website'
export const API_BASE_URL = 'http://localhost:8014/website'
// API 接口路径配置
export const API_PATHS = {
  // 文章相关
  articles: '/index/article/queryIndexArticle',
  allArticles: '/index/article/queryAllArticle',
  articleDetail: (id) => `/index/article/queryArticleDetail?id=${id}`,
  queryRecommendArticle: (id) => `/index/article/queryRecommendArticle?id=${id}`,
  articleLike: (id) => `/index/article/likeArticle?id=${id}`,
  viewArticle: (id) => `/index/article/viewArticle?id=${id}`,
  // API 标签（后台）
  apiTags: '/admin/api/queryApiTagList',
  // API 标签（前端开放）
  publicApiTags: '/index/api/queryApiTagList',
  // 文章标签
  articleTags: '/admin/article/queryAllTags',
  allTags: '/index/article/queryAllTags',
  // 标签统计
  allTagStatics: '/index/article/queryAllTagStatics',
  statics: '/index/queryStatics',

  // 管理相关
  adminArticles: '/admin/articles',
  adminArticle: (id) => `/admin/articles/${id}`,
  adminArticleStatus: (id) => `/admin/articles/${id}/status`,
  insertArticle: '/admin/article/insertArticle',
  dealArticle: (id, type) => `/admin/article/dealArticle?id=${id}&type=${type}`,
  queryArticleList: (searchValue, tag, status) => `/admin/article/queryArticle?searchValue=${encodeURIComponent(searchValue || '')}&tag=${encodeURIComponent(tag || '')}&status=${encodeURIComponent(status || '')}`,
  queryArticleDetail: (id) => `/admin/article/queryArticleDetail?id=${id}`,
  queryArticleStatics: '/admin/dashboard/queryArticleStatics',
  // 笔记统计（month 格式 yyyy-MM），返回 total/studying/finish/monthStudy/days
  queryNoteStatics: (month) => `/admin/dashboard/queryNoteStatics?month=${encodeURIComponent(month || '')}`,

  // ========== Admin 端 API 管理（后台） ==========
  openApis: '/admin/api/queryApiList',

  // ========== 前端公开 API 展示 ==========
  // 首页开放 API
  homeApis: '/index/api/querySomeApiList',
  // ApiPage API 列表（支持搜索和标签筛选）
  publicApis: (searchValue = '', tag = '') => `/index/api/queryAllApiList?searchValue=${encodeURIComponent(searchValue)}&tag=${encodeURIComponent(tag)}`,
  // API 详情
  publicApiDetail: (id) => `/index/api/queryApiById?id=${id}`,

  // API 管理
  saveApi: '/admin/api/saveApi',
  deleteApi: (id) => `/admin/api/deleteApi?id=${id}`,
  queryApiById: (id) => `/admin/api/queryApiById?id=${id}`,

  // API 标签
  saveApiTag: (id, name, color) => `/admin/api/saveApiTag?id=${id || ''}&name=${encodeURIComponent(name)}&color=${encodeURIComponent(color)}`,
  deleteApiTag: (tagId) => `/admin/api/deleteApiTag?id=${tagId}`,

  // 图片上传
  uploadImage: '/admin/article/uploadImage',
  // 附件上传
  uploadAttachment: '/file/upload',
  // 附件下载
  downloadFile: (fileId) => `/file/download/${fileId}`,

  // 个人信息
  queryInfo: '/auth/queryInfo',
  saveInfo: '/auth/saveInfo',
  aboutMe: '/index/aboutMe',

  // 项目经历
  saveProjectInfo: '/auth/saveProjectInfo',
  queryProjectList: '/auth/queryProjectList',
  queryProjectInfo: (id) => `/auth/queryProjectInfo?id=${id}`,

  // 产品信息（自研项目）
  saveProductInfo: '/auth/saveProductInfo',
  queryProductList: '/auth/queryProductList',
  queryProductInfo: (id) => `/auth/queryProductInfo?id=${id}`,

  // 笔记管理
  saveNoteInfo: '/admin/notes/saveNote',
  queryNoteList: '/admin/notes/queryNoteList',
  queryNoteInfo: '/admin/notes/queryNoteDetail',
  updateNoteStatus: '/admin/notes/updateStatus',
  deleteNoteInfo: (id) => `/admin/notes/deleteNote?id=${id}`,
  queryChapterList: (noteId) => `/admin/notes/queryChapterList?noteId=${noteId}`,
  // 章节详情（后台，id 为章节 id；返回 { id, title, orders, content }，正文在此接口）
  queryChapterAdmin: (id) => `/admin/notes/queryChapter?id=${encodeURIComponent(id)}`,
  saveChapter: '/admin/notes/saveChapter',
  deleteChapter: (id) => `/admin/notes/deleteChapter?id=${id}`,
  completeChapter: (id) => `/admin/notes/completeChapter?id=${id}`,
  // 已发布笔记列表（前台展示）
  queryNoteListPublished: '/index/notes/queryNoteListPublished',
  // 笔记标签维护（后台，传参与返参同文章标签接口）
  noteTags: '/admin/notes/queryAllTags',
  insertNoteTag: (id, name, color) => `/admin/notes/insertTag?id=${id || ''}&tagName=${encodeURIComponent(name)}&tagColor=${encodeURIComponent(color)}`,
  deleteNoteTag: (tagId) => `/admin/notes/deleteTag?id=${tagId}`,
  // 前台公开接口（只读预览）
  queryNoteDetailPublic: (id) => `/index/notes/queryNoteDetail?id=${id}`,
  queryChapterListPublic: (noteId) => `/index/notes/queryChapterList?noteId=${noteId}`,
  // 章节详情（前台公开，id 为章节 id；返回 { id, title, orders, content }，正文在此接口）
  queryChapterPublic: (id) => `/index/notes/queryChapter?id=${encodeURIComponent(id)}`,
  // 随机获取一篇笔记中的小节（前台公开，GET）
  // 返回 data: { name 笔记名称, title 小节标题, content 小节内容(markdown) }
  // 传 noteId 时只在指定笔记内随机，不传则全库随机
  getRandomContent: (noteId) => (noteId
    ? `/index/notes/getRandomContent?noteId=${encodeURIComponent(noteId)}`
    : '/index/notes/getRandomContent'),
  // 学习打卡记录保存（前台公开，POST）
  saveStudyRecord: '/index/study/saveStudyRecord',
  // 学习打卡历史记录查询（前台公开，GET，relationId 为小节 id）
  queryStudyRecord: (relationId) => `/index/study/queryStudyRecord?relationId=${encodeURIComponent(relationId)}`,
  // 笔记生命线查询（前台公开，GET，noteId 为笔记 id）
  getNoteLine: (noteId) => `/index/notes/getNoteLine?noteId=${encodeURIComponent(noteId)}`,
  // 斩杀知识点 / 取消关注本节知识（前台公开，POST）
  saveStudyBan: '/index/study/saveStudyBan',
  // 重点关注（前台公开，POST）：relationId 小节 id + followType
  // followType：1 点亮（设为重点关注）/ 0 取消点亮（取消重点关注）
  saveStudyLike: '/index/study/saveStudyLike',
  // 用户登录（POST，body 传参）：loginName 登录名 / password 密码 / loginType 固定 'account'
  // 成功返回 data: { user 基础用户信息, authorizationToken 授权token }
  // 后续所有请求需在 header 带上 authorization_token
  userLogin: '/user/login/userLogin',
  // 用户登出（POST，无 body，header 带 authorization_token）
  // 无 data 返回，根据 success 判断登出是否成功
  userLogout: '/user/login/userLogout',
  // 用户注册（前台公开，POST）：username 用户名 / phone 手机号 / sex 性别 / password 密码
  // sex：1 男 / 2 女（接口路径与取值均为暂定，按后端实际调整）
  registerUser: '/index/user/register',
  // 学习域数据（前台公开，GET）
  queryStudyDomain: '/index/study/queryStudyDomain',
  // 学习域指标对应的列表（前台公开，GET）
  // type: 0 今日已学习 / 1 今日需复习 / 2 记忆构建 / 3 记忆牢固 / 4 难标记 / 5 易标记
  //      6 重点关注 / 7 取消关注（暂定，按后端实际取值调整）
  queryStudyDomainNoticeList: (type) => `/index/study/queryStudyDomainNoticeList?type=${encodeURIComponent(type)}`,
  // 本周每日学习概况（前台公开，GET）
  // 返回 data 兼容三种结构：7 元素数组（周一~周日顺序） / { days: [{ day, num }] } / { 'yyyy-MM-dd': num }
  queryWeekStudy: '/index/study/queryWeekStudy',
  // 思维导图数据（前台公开，GET /index/notes/queryThinkingData）
  // 返回 data 为根节点数组（通常一个根）：[{ id, pid, title, children: [...] }]，children 可递归嵌套
  queryMindMap: '/index/notes/queryThinkingData',


  // 文章标签
  insertArticleTag: (id, name, color) => `/admin/article/insertTag?id=${id || ''}&tagName=${encodeURIComponent(name)}&tagColor=${encodeURIComponent(color)}`,
  deleteArticleTag: (tagId) => `/admin/article/deleteTag?id=${tagId}`,

  // 系统设置
  getSetting: '/setting/getSetting',
  switchTheme: (theme) => `/setting/switchTheme?theme=${encodeURIComponent(theme)}`,
}

// 完整 API URL
export const getApiUrl = (path) => `${API_BASE_URL}${path}`

// 当前登录用户的授权 token（登录接口返回 authorizationToken，登录成功后存入本地）
// 所有请求都需在 header 带上 authorization_token
export const getAuthToken = () => {
  try {
    return localStorage.getItem('authorization_token') || ''
  } catch (e) {
    return ''
  }
}

// 带授权 token 的请求头（未登录时返回空对象）
export const getAuthHeader = () => {
  const token = getAuthToken()
  return token ? { authorization_token: token } : {}
}

export default {
  API_BASE_URL,
  API_PATHS,
  getApiUrl,
  getAuthToken,
  getAuthHeader
}
