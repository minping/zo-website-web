// API 配置文件
// 后端接口地址
export const API_BASE_URL = 'http://127.0.0.1:9066/website'

// API 接口路径配置
export const API_PATHS = {
  // 文章相关
  articles: '/index/article/queryIndexArticle',
  articleDetail: (id) => `/index/article/queryArticleDetail?id=${id}`,
  queryRecommendArticle: (id) => `/index/article/queryRecommendArticle?id=${id}`,
  articleLike: (id) => `/index/article/likeArticle?id=${id}`,
  viewArticle: (id) => `/index/article/viewArticle?id=${id}`,
  tags: '/index/article/queryAllTags',
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

  // 开放 API 相关
  openApis: '/open-apis',

  // 标签相关
  insertTag: (tagName, tagColor) => `/admin/article/insertTag?tagName=${encodeURIComponent(tagName)}&tagColor=${encodeURIComponent(tagColor)}`,
  deleteTag: (tagId) => `/admin/article/deleteTag?tagId=${tagId}`
}

// 完整 API URL
export const getApiUrl = (path) => `${API_BASE_URL}${path}`

export default {
  API_BASE_URL,
  API_PATHS,
  getApiUrl
}
