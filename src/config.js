// API 配置文件
// 后端接口地址
export const API_BASE_URL = 'https://www.mpgapay.cn/website'
// export const API_BASE_URL = 'http://localhost:8014/website'

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
  queryArticleStatics: '/admin/article/queryArticleStatics',

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


  // 文章标签
  insertArticleTag: (id, name, color) => `/admin/article/insertTag?id=${id || ''}&tagName=${encodeURIComponent(name)}&tagColor=${encodeURIComponent(color)}`,
  deleteArticleTag: (tagId) => `/admin/article/deleteTag?id=${tagId}`,

  // 系统设置
  getSetting: '/setting/getSetting',
  switchTheme: (theme) => `/setting/switchTheme?theme=${encodeURIComponent(theme)}`,
}

// 完整 API URL
export const getApiUrl = (path) => `${API_BASE_URL}${path}`

export default {
  API_BASE_URL,
  API_PATHS,
  getApiUrl
}
