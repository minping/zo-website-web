import { api } from './article'

// ========== 前端公开 API（数据与 Admin 隔离） ==========

// 首页开放 API 列表
export const getHomeApis = () => api.getHomeApiList()

// ApiPage API 列表（支持搜索和标签筛选）
export const getApis = (searchValue = '', tag = '') => api.getPublicApiList(searchValue, tag)

// API 详情
export const getApiDetail = (id) => api.getPublicApiDetail(id)

// API 标签列表（前端 ApiPage 筛选用）
export const getApiTags = () => api.getPublicApiTags()

// API 方法颜色映射
export const methodColors = {
  GET: '#10b981',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  DELETE: '#ef4444'
}
