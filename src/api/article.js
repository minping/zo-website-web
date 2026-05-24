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

// API 接口
export const api = {
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
        sortOrder: res.data.sort_order
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

  // 获取技术标签列表
  async getTags() {
    const res = await request(API_PATHS.tags)
    // 适配新接口字段: tag_id -> id, tag_name -> name
    if (res.data) {
      res.data = res.data.map(tag => ({
        id: tag.tag_id,
        name: tag.tag_name,
        color: tag.color || '#42b883'
      }))
    }
    return res
  },

  // 新增标签
  async insertTag(tagName, tagColor) {
    return await request(API_PATHS.insertTag(tagName, tagColor))
  },

  // 删除标签
  async deleteTag(tagId) {
    return await request(API_PATHS.deleteTag(tagId))
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
      recommendReadTime: articleData.readTime
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
      recommendReadTime: articleData.readTime
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
  }
}

export default api
