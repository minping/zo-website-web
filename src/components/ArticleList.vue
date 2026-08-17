<template>
  <div class="article-list-page">
    <!-- 背景效果 -->
    <div class="bg-grid"></div>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>

    <!-- 导航栏 -->
    <Navbar activeMenu="文章" @navigate="handleNavigate" />

    <!-- 页面标题 -->
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">技术文章</h1>
        <p class="page-desc">总该写点什么吧</p>
      </div>
    </section>

    <!-- 文章模块列表 -->
    <section class="article-sections">
      <div class="container">

        <!-- 检索栏（始终显示，加载中除外） -->
        <div v-if="!loading" class="filter-bar">
          <div class="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="搜索文章标题..."
            />
          </div>
          <span class="filter-divider"></span>
          <select v-model="selectedTag" class="tag-select">
            <option value="">全部标签</option>
            <option v-for="tag in availableTags" :key="tag" :value="tag">{{ tag }}</option>
          </select>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>

        <!-- 检索空结果 -->
        <div v-else-if="filteredGroups.length === 0 && (searchQuery || selectedTag)" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p>未找到匹配的文章</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="articleGroups.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <p>暂无文章</p>
        </div>

        <!-- 文章内容区（有结果时显示） -->
        <div v-else class="article-layout">
          <!-- 左侧缩略预览 -->
          <aside class="article-sidebar">
            <div class="sidebar-inner">
              <h3 class="sidebar-title">文章导航</h3>
              <nav class="sidebar-nav">
                <a
                  v-for="group in filteredGroups"
                  :key="group.tag"
                  class="sidebar-tag-item"
                  :class="{ active: activeTag === group.tag }"
                  :href="'#group-' + group.tag"
                  @click.prevent="scrollToGroup(group.tag)"
                >
                  <span class="sidebar-tag-dot" :style="{ background: group.tagColor }"></span>
                  <div class="sidebar-tag-info">
                    <span class="sidebar-tag-name">{{ group.tag }}</span>
                    <span class="sidebar-tag-count">{{ group.articles.length }} 篇</span>
                  </div>
                </a>
              </nav>
            </div>
          </aside>

          <!-- 右侧主内容 -->
          <div class="article-main">
            <!-- 文章分组列表 -->
            <div class="article-groups">
              <div v-for="group in filteredGroups" :key="group.tag" :id="'group-' + group.tag" class="article-group">
                <div class="group-header">
                  <div class="group-title-wrapper">
                    <span class="group-tag-dot" :style="{ background: group.tagColor }"></span>
                    <h2 class="group-title">{{ group.tag }}</h2>
                  </div>
                </div>
                <div class="group-articles">
                  <article 
                    v-for="article in group.articles" 
                    :key="article.id" 
                    class="article-list-item"
                    @click="goToArticle(article)"
                  >
                    <div class="article-list-main">
                      <h3 class="article-list-title">{{ article.title }}</h3>
                      <div class="article-list-meta">
                        <span class="article-list-date">发布于: {{ article.date }}</span>
                        <span class="article-list-read">推荐阅读时长: {{ article.readTime }} 分钟</span>
                      </div>
                    </div>
                    <span class="article-list-arrow">›</span>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api/article'
import Navbar from './Navbar.vue'
import Footer from './Footer.vue'

const router = useRouter()

const loading = ref(true)
const allArticles = ref([])
const articleGroups = ref([])

// 检索
const searchQuery = ref('')
const selectedTag = ref('')

// 所有可用标签（从接口获取）
const availableTags = ref([])

// 侧边栏当前激活的标签
const activeTag = ref('')

// 滚动到指定标签分组
const scrollToGroup = (tag) => {
  activeTag.value = tag
  const el = document.getElementById('group-' + tag)
  if (el) {
    const navbarHeight = 80
    const top = el.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

// 滚动监听，自动高亮当前可见分组
let scrollTimer = null
const handleScroll = () => {
  if (scrollTimer) return
  scrollTimer = requestAnimationFrame(() => {
    const groups = filteredGroups.value
    if (groups.length === 0) {
      scrollTimer = null
      return
    }
    const navbarHeight = 90
    let currentTag = groups[0].tag
    for (const group of groups) {
      const el = document.getElementById('group-' + group.tag)
      if (el) {
        const rect = el.getBoundingClientRect()
        if (rect.top <= navbarHeight + 100) {
          currentTag = group.tag
        }
      }
    }
    activeTag.value = currentTag
    scrollTimer = null
  })
}

onMounted(() => {
  fetchArticles()
  fetchTags()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 过滤后的分组
const filteredGroups = computed(() => {
  let filtered = allArticles.value

  // 按标题搜索
  if (searchQuery.value.trim()) {
    const keyword = searchQuery.value.trim().toLowerCase()
    filtered = filtered.filter(a => a.title && a.title.toLowerCase().includes(keyword))
  }

  // 按标签筛选
  if (selectedTag.value) {
    filtered = filtered.filter(a => a.tag === selectedTag.value)
  }

  return groupArticlesByTag(filtered)
})

const goToArticle = (article) => {
  router.push(`/article/${article.id}`)
}

// 按标签分组文章
const groupArticlesByTag = (articles) => {
  const groups = {}
  articles.forEach(article => {
    if (!groups[article.tag]) {
      groups[article.tag] = {
        tag: article.tag,
        tagColor: article.tagColor,
        articles: []
      }
    }
    groups[article.tag].articles.push(article)
  })
  return Object.values(groups)
}

// 获取所有文章
const fetchArticles = async () => {
  try {
    loading.value = true
    const res = await api.getAllArticles()
    // 兼容 res.success 和 res.data 两种判断方式
    const data = res.success ? res.data : (res.data ? res.data : [])
    if (res.success || res.data) {
      console.log('ArticleList 获取文章数据:', data)
      allArticles.value = data
      articleGroups.value = groupArticlesByTag(data)
    } else {
      console.warn('ArticleList 接口未返回有效数据:', res)
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取所有标签
const fetchTags = async () => {
  try {
    const res = await api.getIndexArticleTags()
    if (res.success) {
      availableTags.value = (res.data || []).map(t => t.name)
    }
  } catch (error) {
    console.error('获取标签列表失败:', error)
  }
}

</script>

<style scoped>
.article-list-page {
  position: relative;
  min-height: 100vh;
}

/* 背景效果 */
.bg-grid {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 0;
}

.bg-glow {
  position: fixed;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.3;
  pointer-events: none;
  z-index: 0;
}

.bg-glow-1 {
  top: -200px;
  right: -200px;
  background: var(--accent-primary);
}

.bg-glow-2 {
  bottom: -200px;
  left: -200px;
  background: var(--accent-secondary);
}

/* 页面标题 */
.page-header {
  padding: 100px 0 30px;
  text-align: left;
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: 30px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.page-desc {
  font-size: 15px;
  color: var(--text-muted);
  margin: 0;
}

/* 检索栏 */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 8px 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: border-color 0.3s, box-shadow 0.3s;
}

.filter-bar:focus-within {
  border-color: var(--accent-primary);
  box-shadow: 0 2px 16px rgba(59, 130, 246, 0.12);
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.3s;
}

.search-box:hover,
.search-box:focus-within {
  background: var(--bg-secondary);
}

.search-box svg {
  color: var(--text-secondary);
  flex-shrink: 0;
  transition: color 0.3s;
}

.search-box:focus-within svg {
  color: var(--accent-primary);
}

.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 15px;
  color: var(--text-primary);
}

.search-box input::placeholder {
  color: var(--text-secondary);
}

/* 竖向分隔线 */
.filter-divider {
  width: 1px;
  height: 24px;
  background: var(--border-color);
  flex-shrink: 0;
}

.tag-select {
  appearance: none;
  -webkit-appearance: none;
  background: var(--bg-card) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 12px center;
  border: none;
  border-radius: 8px;
  padding: 8px 34px 8px 12px;
  font-size: 14px;
  color: var(--text-primary);
  outline: none;
  cursor: pointer;
  min-width: 130px;
  transition: background-color 0.3s;
}

.tag-select:hover {
  background-color: var(--bg-secondary);
}

.tag-select option {
  background: var(--bg-card);
  color: var(--text-primary);
}

/* 文章区域 */
.article-sections {
  padding: 0 0 60px;
  position: relative;
  z-index: 1;
}

/* 侧边栏 + 主内容布局 */
.article-layout {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

/* 左侧缩略预览 */
.article-sidebar {
  flex: 0 0 220px;
  position: sticky;
  top: 100px;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
}

.sidebar-inner {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 20px;
}

.sidebar-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-tag-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.25s ease;
  border: 1px solid transparent;
}

.sidebar-tag-item:hover {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

.sidebar-tag-item.active {
  background: rgba(59, 130, 246, 0.08);
  border-color: var(--accent-primary);
}

.sidebar-tag-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.sidebar-tag-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.sidebar-tag-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-tag-count {
  font-size: 11px;
  color: var(--text-secondary);
}

/* 右侧主内容 */
.article-main {
  flex: 1;
  min-width: 0;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: var(--text-secondary);
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(59, 130, 246, 0.1);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: var(--text-secondary);
  gap: 16px;
}

.empty-state svg {
  opacity: 0.5;
}

/* 文章分组 */
.article-groups {
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px 24px;
}

.article-group {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  position: relative;
}

/* 移除 ::after */

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--border-color);
  position: relative;
}

.group-header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 48px;
  height: 2px;
  background: var(--accent-primary);
  border-radius: 1px;
}

.group-title-wrapper {
  display: flex;
  align-items: center;
}

.group-tag-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.group-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}



/* 列表式文章列表 */
.group-articles {
  display: flex;
  flex-direction: column;
}

/* 文章条目：列表式 */
.article-list-item {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0 -8px;
  padding: 14px 12px;
  border-bottom: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.article-list-item:last-child {
  border-bottom: none;
}

.article-list-item:hover {
  background: var(--bg-secondary);
  transform: translateX(4px);
}

/* 内容主体 */
.article-list-main {
  flex: 1;
  min-width: 0;
}

/* 元信息行：标签 + 日期 + 阅读时间 */
.article-list-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.article-list-date {
  white-space: nowrap;
}

.article-list-read {
  white-space: nowrap;
}

.article-list-title {
  font-size: 16px;
  font-weight: 400;
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s;
}

.article-list-item:hover .article-list-title {
  color: var(--accent-primary);
}

/* 右侧箭头 */
.article-list-arrow {
  flex-shrink: 0;
  font-size: 22px;
  line-height: 1;
  color: var(--text-secondary);
  opacity: 0;
  transform: translateX(-6px);
  transition: all 0.3s ease;
}

.article-list-item:hover .article-list-arrow {
  opacity: 1;
  color: var(--accent-primary);
  transform: translateX(0);
}

/* 页脚 */
.footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: 40px 0;
  position: relative;
  z-index: 1;
  transition: background 0.3s ease, border-color 0.3s ease;
}

.footer-content {
  text-align: center;
  margin-bottom: 16px;
}

.footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.footer-desc {
  font-size: 14px;
  color: var(--text-secondary);
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.footer-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: var(--accent-primary);
}

.footer-divider {
  color: var(--text-secondary);
}

.footer-copyright {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}

/* 响应式 */
@media (max-width: 992px) {
  .article-layout {
    flex-direction: column;
  }

  .article-sidebar {
    flex: none;
    position: static;
    max-height: none;
    width: 100%;
  }

  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 6px;
  }

  .sidebar-tag-item {
    padding: 6px 12px;
  }

  .sidebar-tag-count {
    display: none;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 80px 0 20px;
  }

  .page-title {
    font-size: 24px;
  }

  .filter-bar {
    padding: 6px 8px;
  }

  .search-box {
    padding: 8px 10px;
  }

  .article-list-item {
    margin: 0 -6px;
    padding: 12px 10px;
  }

  .article-list-title {
    font-size: 14px;
  }

  .article-list-arrow {
    display: none;
  }
}

@media (max-width: 480px) {
  .article-sidebar {
    display: none;
  }

  .article-main {
    width: 100%;
  }

  .container {
    padding: 0 16px;
  }

  .article-groups {
    padding: 14px 16px;
  }

  .filter-bar {
    flex-wrap: wrap;
    gap: 6px;
  }

  .search-box {
    flex: 1 1 100%;
  }

  .filter-divider {
    display: none;
  }

  .tag-select {
    flex: 1;
    min-width: 0;
  }

  .article-list-item {
    margin: 0 -4px;
    padding: 10px 8px;
  }

  .article-list-meta {
    gap: 8px;
    font-size: 11px;
  }

  .article-list-title {
    font-size: 13px;
    margin-bottom: 2px;
  }

  .article-list-desc {
    display: none;
  }
}
</style>
