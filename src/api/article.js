import { getApiUrl, API_PATHS } from '../config.js'

// 封装 fetch 请求
const request = async (path, options = {}) => {
  const url = getApiUrl(path)
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json'
    }
  }
  const response = await fetch(url, { ...defaultOptions, ...options })
  return response.json()
}

// 文件上传专用请求
const uploadRequest = async (path, formData) => {
  const url = getApiUrl(path)
  const response = await fetch(url, {
    method: 'POST',
    body: formData
  })
  return response.json()
}

// API 接口
export const api = {
  // 获取所有文章（含草稿及非公开文章，index 端检索用）
  // 接口返回 { key: [articles...] } 结构，key 为标签名
  async getAllArticles() {
    const res = await request(API_PATHS.allArticles)
    // 接口可能返回 { data: { tag1: [...], tag2: [...] } } 或直接返回 { tag1: [...], ... }
    const raw = res.data || res
    const list = []
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      Object.entries(raw).forEach(([tagName, articles]) => {
        if (Array.isArray(articles)) {
          articles.forEach(item => {
            list.push({
              id: item.zo_website_article_id,
              title: item.title,
              content: item.content,
              tagValue: item.tag_value || tagName,
              tag: item.tag_text || tagName,
              author: item.author_name,
              date: item.publish_time,
              readTime: item.recommend_read_time,
              gradient: item.cover_gradient,
              desc: item.summary,
              status: item.status_value === 1 ? 'published' : 'draft',
              likes: item.like_count,
              views: item.view_count
            })
          })
        }
      })
    }
    res.data = list
    return res
  },

  // 获取文章列表（首页）
  async getArticles() {
    const res = await request(API_PATHS.articles)
    // 适配新接口字段
    if (res.data) {
      res.data = res.data.map(item => ({
        id: item.zo_website_article_id,
        title: item.title,
        content: item.content,
        tagValue: item.tag_value,
        tag: item.tag_text,
        author: item.author_name,
        date: item.publish_time,
        readTime: item.recommend_read_time,
        gradient: item.cover_gradient,
        desc: item.summary,
        status: item.status_value === 1 ? 'published' : 'draft',
        likes: item.like_count,
        views: item.view_count
      }))
    }
    return res
  },

  // 获取文章详情
  async getArticleById(id) {
    const res = await request(API_PATHS.articleDetail(id))
    // 适配新接口字段
    if (res.data) {
      res.data = {
        id: res.data.zo_website_article_id,
        title: res.data.title,
        content: res.data.content,
        tagValue: res.data.tag_value,
        tag: res.data.tag_text,
        tagText: res.data.tag_text,
        tagColor: res.data.color,
        author: res.data.author_name,
        createTime: res.data.create_time,
        date: res.data.publish_time,
        readTime: res.data.recommend_read_time,
        gradient: res.data.cover_gradient,
        desc: res.data.summary,
        likes: res.data.like_count,
        views: res.data.view_count,
        statusValue: res.data.status_value,
        statusText: res.data.status_text,
        status: res.data.status_value === 1 ? 'published' : 'draft',
        sortOrder: res.data.sort_order,
        files: res.data.files || ''
      }
    }
    return res
  },

  // 获取推荐文章
  async getRecommendArticles(id) {
    const res = await request(API_PATHS.queryRecommendArticle(id))
    if (res.data) {
      res.data = res.data.slice(0, 6).map(item => ({
        id: item.zo_website_article_id,
        title: item.title,
        tag: item.tag_text,
        tagColor: item.color,
        author: item.author_name,
        date: item.publish_day,
        readTime: item.recommend_read_time,
        gradient: item.cover_gradient,
        desc: item.summary,
        likes: item.like_count,
        views: item.view_count
      }))
    }
    return res
  },

  // 点赞文章
  async likeArticle(id) {
    return await request(API_PATHS.articleLike(id))
  },

  // 浏览文章
  async viewArticle(id) {
    return await request(API_PATHS.viewArticle(id))
  },

  // 获取站点统计数据
  async getSiteStats() {
    const res = await request(API_PATHS.statics)
    if (res.data) {
      res.data = {
        articleCount: res.data.num || 0,
        likeCount: res.data.like_count || 0,
        viewCount: res.data.view_count || 0,
        days: res.data.days || 0
      }
    }
    return res
  },

  // ========== API 标签 ==========

  // 获取 API 标签列表
  async getApiTags() {
    const res = await request(API_PATHS.apiTags)
    if (res.data) {
      res.data = res.data.map(tag => ({
        id: tag.tag_id,
        name: tag.tag_name,
        color: tag.tag_color || tag.color || '#42b883'
      }))
    }
    return res
  },

  // 获取公开 API 标签（前端 ApiPage 筛选用）
  async getPublicApiTags() {
    const res = await request(API_PATHS.publicApiTags)
    if (res.data) {
      res.data = res.data.map(tag => ({
        id: tag.tag_id,
        name: tag.tag_name,
        color: tag.tag_color || '#6366f1'
      }))
    }
    return res
  },

  // 兼容旧调用（标签管理页面使用）
  async getTags() {
    return this.getApiTags()
  },

  // 保存/编辑 API 标签
  async saveApiTag(id, name, color) {
    return await request(API_PATHS.saveApiTag(id, name, color), {
      method: 'POST'
    })
  },

  // 删除 API 标签
  async deleteApiTag(tagId) {
    return await request(API_PATHS.deleteApiTag(tagId))
  },

  // 上传图片
  async uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    return await uploadRequest(API_PATHS.uploadImage, formData)
  },

  // 上传附件
  async uploadAttachment(file) {
    const formData = new FormData()
    formData.append('file', file)
    return await uploadRequest(API_PATHS.uploadAttachment, formData)
  },

  // ========== 文章标签 ==========

  // 获取文章标签列表
  async getArticleTags() {
    const res = await request(API_PATHS.articleTags)
    if (res.data) {
      res.data = res.data.map(tag => ({
        id: tag.tag_id || tag.id,
        name: tag.tag_name || tag.name,
        color: tag.tag_color || tag.color || '#42b883'
      }))
    }
    return res
  },

  // 获取所有文章标签（index 端，供检索用）
  async getIndexArticleTags() {
    const res = await request(API_PATHS.allTags)
    if (res.data) {
      res.data = res.data.map(tag => ({
        name: tag.tag_name || tag.name,
        color: tag.tag_color || tag.color || '#42b883'
      }))
    }
    return res
  },

  // 获取所有标签统计数据
  async getAllTagStatics() {
    const res = await request(API_PATHS.allTagStatics)
    if (res.data) {
      res.data = res.data.map(tag => ({
        id: tag.tag_id || tag.id,
        name: tag.tag_name || tag.name,
        color: tag.tag_color || tag.color || '#42b883',
        articleCount: tag.num ?? tag.article_count ?? tag.articleCount ?? 0,
        viewCount: tag.view_count ?? tag.viewCount ?? 0,
        likeCount: tag.like_count ?? tag.likeCount ?? 0
      }))
    }
    return res
  },

  // 新增/编辑文章标签
  async insertArticleTag(id, name, color) {
    return await request(API_PATHS.insertArticleTag(id || '', name, color), {
      method: 'POST'
    })
  },

  // 删除文章标签
  async deleteArticleTag(tagId) {
    return await request(API_PATHS.deleteArticleTag(tagId))
  },




  // ========== 兼容旧方法（已废弃，保留向后兼容） ==========

  // @deprecated 使用 deleteApiTag 替代
  async deleteTag(tagId) {
    return await this.deleteApiTag(tagId)
  },




  // ========== 开放 API 管理 ==========

  // 获取 API 列表
  async getApiList() {
    const res = await request(API_PATHS.openApis)
    if (res.data) {
      res.data = res.data.map(item => ({
        id: item.id || item.api_id || item.zo_website_api_id,
        name: item.name,
        description: item.description,
        endpoint: item.endpoint,
        method: item.method || 'GET',
        tagValue: item.tag_value || '',
        tagText: item.tag_text || '',
        tag: item.tag || item.tag_text,
        tagColor: item.tag_color || item.color || '#6366f1',
        isFree: item.is_free ?? true,
        price: item.price || 0,
        requestExample: item.request_example || '',
        responseExample: item.response_example || '',
        responseFormat: item.response_format || 'JSON',
        responseTime: item.response_time || 0,
        status: item.status ?? 1,
        inputParams: item.param_list || item.paramList || item.input_params || item.parameters || null,
        stats: {
          calls: item.call_count || 0,
          successRate: item.success_rate || 0,
          avgTime: item.avg_time || 0
        }
      }))
    }
    return res
  },

  // 保存 API（新增/编辑统一）
  async saveApi(data) {
    return await request(API_PATHS.saveApi, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // 根据 ID 查询 API
  async queryApiById(id) {
    const res = await request(API_PATHS.queryApiById(id))
    if (res.data) {
      const item = res.data
      res.data = {
        id: item.id || item.api_id || item.zo_website_api_id,
        name: item.name,
        description: item.description,
        endpoint: item.endpoint,
        method: item.method || 'GET',
        tagValue: item.tag_value || '',
        tagText: item.tag_text || '',
        tag: item.tag || item.tag_text,
        tagColor: item.tag_color || item.color || '#6366f1',
        isFree: item.is_free ?? true,
        price: item.price || 0,
        requestExample: item.request_example || '',
        responseExample: item.response_example || '',
        responseFormat: item.response_format || 'JSON',
        responseTime: item.response_time || 0,
        status: item.status ?? 1,
        inputParams: item.param_list || item.paramList || item.input_params || item.parameters || null
      }
    }
    return res
  },

  // 删除 API
  async deleteApi(id) {
    return await request(API_PATHS.deleteApi(id))
  },

  // ========== 前端公开 API（首页/ApiPage/ApiDetail） ==========

  // 公共：映射 API 列表数据
  _mapApiList(data) {
    return data.map(item => {
      const rawTags = item.tags || []
      const mappedTags = rawTags.map(t => ({
        text: t.tag_name || '',
        value: t.tag_id || '',
        color: t.tag_color || '#6366f1'
      }))
      const first = mappedTags[0] || {}
      return {
        id: item.id || item.api_id || item.zo_website_api_id,
        name: item.name,
        description: item.description,
        endpoint: item.endpoint,
        method: item.method || 'GET',
        tags: mappedTags,
        tag: first.text || '',
        tagColor: first.color || '#6366f1',
        tagValue: first.value || '',
        tagText: first.text || '',
        isFree: item.is_free ?? true,
        price: item.price || 0,
        responseTime: item.response_time || 0,
        stats: {
          calls: item.call_count || 0,
          successRate: item.success_rate || 0,
          avgTime: item.avg_time || 0,
          likes: item.like_count || 0
        }
      }
    })
  },

  // 首页开放 API 列表
  async getHomeApiList() {
    const res = await request(API_PATHS.homeApis)
    if (res.data) res.data = api._mapApiList(res.data)
    return res
  },

  // ApiPage API 列表（支持搜索和标签筛选）
  async getPublicApiList(searchValue = '', tag = '') {
    const res = await request(API_PATHS.publicApis(searchValue, tag))
    if (res.data) res.data = api._mapApiList(res.data)
    return res
  },

  // 获取公开 API 详情
  async getPublicApiDetail(id) {
    const res = await request(API_PATHS.publicApiDetail(id))
    if (res.data) {
      const item = res.data
      const rawTags = item.tags || []
      const mappedTags = rawTags.map(t => ({
        text: t.tag_name || '',
        value: t.tag_id || '',
        color: t.tag_color || '#6366f1'
      }))
      const first = mappedTags[0] || {}
      res.data = {
        id: item.id || item.api_id || item.zo_website_api_id,
        name: item.name,
        description: item.description,
        endpoint: item.endpoint,
        method: item.method || 'GET',
        tags: mappedTags,
        tag: first.text || '',
        tagColor: first.color || '#6366f1',
        tagValue: first.value || '',
        tagText: first.text || '',
        isFree: item.is_free ?? true,
        price: item.price || 0,
        requestExample: item.request_example || '',
        responseExample: item.response_example || '',
        responseFormat: item.response_format || 'JSON',
        responseTime: item.response_time || 0,
        status: item.status ?? 1,
        inputParams: item.param_list || item.paramList || item.input_params || item.parameters || null,
        stats: {
          calls: item.call_count || 0,
          successRate: item.success_rate || 0,
          avgTime: item.avg_time || 0,
          likes: item.like_count || 0
        }
      }
    }
    return res
  },

  // ========== 后台管理 API ==========

  // 获取所有文章（包含状态）
  async getAdminArticles(searchValue = '', tag = '', status = '') {
    const res = await request(API_PATHS.queryArticleList(searchValue, tag, status))
    // 适配新接口字段
    if (res.data) {
      res.data = res.data.map(item => ({
        id: item.zo_website_article_id,
        title: item.title,
        content: item.content,
        tagValue: item.tag_value,
        tag: item.tag_text,
        author: item.author_name,
        date: item.publish_time,
        createTime: item.create_time,
        readTime: item.recommend_read_time,
        gradient: item.cover_gradient,
        desc: item.summary,
        statusValue: item.status_value,
        statusText: item.status_text,
        status: item.status_value === '1' ? 'published' : 'draft',
        likes: item.like_count,
        views: item.view_count
      }))
    }
    return res
  },

  // 创建文章
  async createArticle(articleData) {
    // 适配新接口格式
    const params = {
      title: articleData.title,
      summary: articleData.desc,
      content: articleData.content,
      authorName: articleData.author,
      tagValue: articleData.tagValue,
      tagText: articleData.tagText,
      coverGradient: articleData.gradient,
      statusValue: articleData.status === 'published' ? 1 : 0,
      statusText: articleData.status === 'published' ? '发布' : '草稿',
      recommendReadTime: articleData.readTime,
      files: articleData.files || ''
    }
    return await request(API_PATHS.insertArticle, {
      method: 'POST',
      body: JSON.stringify(params)
    })
  },

  // 更新文章（使用新增接口，传入文章id即为更新）
  async updateArticle(articleData) {
    // 适配新接口格式
    const params = {
      id: articleData.id,
      title: articleData.title,
      summary: articleData.desc,
      content: articleData.content,
      authorName: articleData.author,
      tagValue: articleData.tagValue,
      tagText: articleData.tagText,
      coverGradient: articleData.gradient,
      statusValue: articleData.status === 'published' ? 1 : 0,
      statusText: articleData.status === 'published' ? '发布' : '草稿',
      recommendReadTime: articleData.readTime,
      files: articleData.files || ''
    }
    return await request(API_PATHS.insertArticle, {
      method: 'POST',
      body: JSON.stringify(params)
    })
  },

  // 更新文章状态（发布/下架）
  async updateArticleStatus(id, status) {
    const type = status === 'published' ? 'publish' : 'unpublish'
    return await request(API_PATHS.dealArticle(id, type))
  },

  // 删除文章
  async deleteArticle(id) {
    return await request(API_PATHS.dealArticle(id, 'delete'))
  },

  // 获取文章统计数据
  async getArticleStatics() {
    const res = await request(API_PATHS.queryArticleStatics)
    // 适配新接口字段
    if (res.data) {
      res.data = {
        totalArticles: res.data.num || 0,
        publishedArticles: res.data.publish_num || 0,
        draftArticles: res.data.un_publish_num || 0,
        totalViews: res.data.view_count || 0,
        totalLikes: res.data.like_count || 0
      }
    }
    return res
  },

  // ========== 个人信息 ==========

  // 获取个人信息
  async getMyInfo() {
    return await request(API_PATHS.queryInfo)
  },

  // 保存个人信息
  async saveInfo(data) {
    return await request(API_PATHS.saveInfo, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // 关于页面 - 获取博主信息
  async getAboutMe() {
    return await request(API_PATHS.aboutMe)
  },

  // ========== 项目经历 ==========

  // 保存项目经历（新增/编辑）
  async saveProject(data) {
    return await request(API_PATHS.saveProjectInfo, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // 获取项目列表
  async getProjectList() {
    const res = await request(API_PATHS.queryProjectList)
    if (res.data && Array.isArray(res.data)) {
      res.data = res.data.map(item => ({
        id: item.id,
        name: item.name,
        role: item.role,
        description: item.description,
        tech: item.tech || '',
        tags: item.tech ? item.tech.split(',').filter(t => t.trim()) : [],
        image: item.image || '',
        startDate: item.start_time || '',
        endDate: item.end_time || '',
        isCurrent: item.end_time === '至今',
        acceptance: item.finish_status || '',
        userBase: item.user_num || ''
      }))
    } else if (res.data && res.data.rows && Array.isArray(res.data.rows)) {
      // 兼容分页返回格式
      res.data = res.data.rows.map(item => ({
        id: item.id,
        name: item.name,
        role: item.role,
        description: item.description,
        tech: item.tech || '',
        tags: item.tech ? item.tech.split(',').filter(t => t.trim()) : [],
        image: item.image || '',
        startDate: item.start_time || '',
        endDate: item.end_time || '',
        isCurrent: item.end_time === '至今',
        acceptance: item.finish_status || '',
        userBase: item.user_num || ''
      }))
    }
    return res
  },

  // 获取项目详情
  async getProjectDetail(id) {
    const res = await request(API_PATHS.queryProjectInfo(id))
    if (res.data) {
      const item = res.data
      res.data = {
        id: item.id,
        name: item.name,
        role: item.role,
        description: item.description,
        tech: item.tech || '',
        tags: item.tech ? item.tech.split(',').filter(t => t.trim()) : [],
        image: item.image || '',
        startDate: item.start_time || '',
        endDate: item.end_time || '',
        isCurrent: item.end_time === '至今',
        acceptance: item.finish_status || '',
        userBase: item.user_num || ''
      }
    }
    return res
  },

  // ========== 产品信息（自研项目） ==========

  // 保存产品信息（新增/编辑）
  async saveProduct(data) {
    return await request(API_PATHS.saveProductInfo, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // 获取产品列表
  async getProductList() {
    const res = await request(API_PATHS.queryProductList)
    const parseTags = (tags) => {
      if (typeof tags === 'string') return tags.split(',').map(t => t.trim()).filter(Boolean)
      return tags || []
    }
    if (res.data && Array.isArray(res.data)) {
      res.data = res.data.map(item => ({
        id: item.id,
        name: item.name,
        icon: item.img || '',
        description: item.description,
        demoUrl: item.playUrl || '',
        githubUrl: item.githubUrl || '',
        tags: parseTags(item.tags)
      }))
    } else if (res.data && res.data.rows && Array.isArray(res.data.rows)) {
      // 兼容分页返回格式
      res.data = res.data.rows.map(item => ({
        id: item.id,
        name: item.name,
        icon: item.img || '',
        description: item.description,
        demoUrl: item.playUrl || '',
        githubUrl: item.githubUrl || '',
        tags: parseTags(item.tags)
      }))
    }
    return res
  },

  // ========== 系统设置 ==========

  // 获取系统设置（目前仅用于主题颜色）
  async getSetting() {
    const res = await request(API_PATHS.getSetting)
    if (res.data) {
      res.data = {
        theme: res.data.theme || 'dark'
      }
    }
    return res
  },

  // 切换主题
  async switchTheme(theme) {
    return await request(API_PATHS.switchTheme(theme), { method: 'POST' })
  },

  // 获取产品详情
  async getProductDetail(id) {
    const res = await request(API_PATHS.queryProductInfo(id))
    if (res.data) {
      const item = res.data
      const parseTags = (tags) => {
        if (typeof tags === 'string') return tags.split(',').map(t => t.trim()).filter(Boolean)
        return tags || []
      }
      res.data = {
        id: item.id,
        name: item.name,
        icon: item.img || '',
        description: item.description,
        demoUrl: item.playUrl || '',
        githubUrl: item.githubUrl || '',
        tags: parseTags(item.tags)
      }
    }
    return res
  },

}

export default api
