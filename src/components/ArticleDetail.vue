<template>
  <div class="article-detail">
    <!-- 背景效果 -->
    <div class="bg-grid"></div>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>

    <!-- 导航栏 -->
    <Navbar activeMenu="文章" @navigate="handleNavigate" />

    <!-- 文章内容 -->
    <main class="article-main">
      <div class="container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <span>加载文章中...</span>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{{ error }}</p>
          <button class="back-btn" @click="goHome">返回首页</button>
        </div>

        <article v-else class="article-container">
          <!-- 返回按钮 -->
          <button class="back-btn" @click="goHome">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            返回首页
          </button>

          <!-- 文章头部 -->
          <header class="article-header">
            <h1 class="article-title">{{ article.title }}</h1>
            <div class="article-tag" :style="{ background: article.tagColor }">
              {{ article.tag }}
            </div>
            <div class="article-meta">
              <div class="article-author">
                <div class="author-avatar">{{ article.author ? article.author[0] : '' }}</div>
                <span class="author-name">{{ article.author }}</span>
              </div>
              <span class="meta-divider">|</span>
              <span class="article-date">{{ article.date }}</span>
              <span class="meta-divider">|</span>
              <span class="article-read">{{ article.readTime }} 分钟阅读</span>
            </div>
          </header>

          <!-- 文章封面 -->
          <div class="article-cover" :style="{ background: article.gradient }">
            <div class="cover-pattern"></div>
          </div>

          <!-- 文章正文 -->
          <div class="article-body">
            <!-- 文章推荐侧边栏 -->
            <aside class="article-sidebar">
              <div class="sidebar-section">
                <div class="sidebar-header">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>  
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  <span>相关推荐</span>
                </div>
                <div v-if="relatedArticles.length > 0" class="related-list">
                  <div 
                    v-for="item in relatedArticles" 
                    :key="item.id"
                    class="related-item"
                    @click="goToArticle(item)"
                  >
                    <div class="related-item-image" :style="{ background: item.gradient }">
                      <span class="related-item-tag">{{ item.tag }}</span>
                    </div>
                    <div class="related-item-content">
                      <h4 class="related-item-title">{{ item.title }}</h4>
                      <div class="related-item-meta">
                        <span>{{ item.date }}</span>
                        <span class="related-views"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> {{ item.views || 0 }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="related-empty">
                  <span>暂无相关推荐</span>
                </div>
              </div>
            </aside>

            <div class="article-content">
              <p class="lead">{{ article.desc }}</p>
              <div v-html="articleContent"></div>
            </div>
            
            <!-- 目录侧边栏 -->
            <aside v-if="toc.length > 0" class="article-toc">
              <div class="toc-container">
                <div class="toc-header">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                  <span>目录</span>
                </div>
                <nav class="toc-nav">
                  <a 
                    v-for="item in toc" 
                    :key="item.id"
                    :href="'#' + item.id"
                    class="toc-link"
                    :class="{ 
                      active: activeHeading === item.id,
                      'toc-h2': item.level === 2,
                      'toc-h3': item.level === 3,
                      'toc-h4': item.level === 4,
                      'toc-h5': item.level === 5,
                      'toc-h6': item.level === 6
                    }"
                    @click.prevent="scrollToHeading(item.id)"
                  >
                    {{ item.text }}
                  </a>
                </nav>
              </div>
            </aside>
          </div>

          <!-- 文章标签 -->
          <div class="article-tags">
            <span class="tags-label">标签：</span>
            <a href="#" class="tag-item" :style="{ '--tag-color': article.tagColor || '#3b82f6' }">{{ article.tag }}</a>
          </div>

          <!-- 点赞分享 -->
          <div class="article-actions">
            <button class="action-btn like-btn" :class="{ active: isLiked }" @click="toggleLike">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>{{ likeCount }}</span>
            </button>
            <div class="share-wrapper">
              <button class="action-btn share-btn" @click="toggleShare">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                <span>分享</span>
              </button>
              <div v-if="showShare" class="share-popup">
                <div class="share-popup-arrow"></div>
                <div class="share-popup-header">分享文章</div>
                <div class="share-popup-body">
                  <input class="share-link-input" :value="shareUrl" readonly @focus="$event.target.select()" />
                  <button class="share-copy-btn" :class="{ copied: copySuccess }" @click="copyShareLink">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    <span>{{ copySuccess ? '已复制' : '复制链接' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>

    <!-- 回到顶部按钮 -->
    <button 
      class="back-to-top" 
      :class="{ visible: showBackTop }" 
      @click="scrollToTop"
      title="回到顶部"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="19" x2="12" y2="5"/>
        <polyline points="5 12 12 5 19 12"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '../api/article'
import { marked } from 'marked'
import hljs from 'highlight.js'
import Navbar from './Navbar.vue'
import { useTheme } from '../composables/useTheme'

// 配置 marked 自定义渲染器
const renderer = new marked.Renderer()

// 给标题添加 ID 用于目录定位
renderer.heading = function({ text, depth }) {
  const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-')
  return `<h${depth} id="${id}">${text}</h${depth}>`
}

renderer.code = function({ text, lang }) {
  const language = lang || 'text'
  const langLabel = language === 'text' ? '代码' : language.toUpperCase()
  // 使用 highlight.js 高亮代码
  let highlightedCode
  try {
    if (language && language !== 'text' && hljs.getLanguage(language)) {
      highlightedCode = hljs.highlight(text, { language }).value
    } else {
      highlightedCode = hljs.highlightAuto(text).value
    }
  } catch (e) {
    highlightedCode = text
  }
  return `
    <div class="code-block">
      <div class="code-header">
        <span class="code-lang">${langLabel}</span>
        <button class="copy-btn" onclick="copyCode(this)" data-code="${encodeURIComponent(text)}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          <span>复制</span>
        </button>
      </div>
      <pre><code class="language-${language} hljs">${highlightedCode}</code></pre>
    </div>
  `
}
marked.use({ renderer })

const router = useRouter()
const route = useRoute()
const { theme, toggleTheme } = useTheme()

const isLiked = ref(false)
const likeCount = ref(0)
const loading = ref(true)
const error = ref(null)
const activeHeading = ref('')
const relatedArticles = ref([])
const showBackTop = ref(false)
const showShare = ref(false)
const copySuccess = ref(false)

const article = ref({})

// 提取目录结构（支持所有级别标题 # 到 ######，忽略代码块内的标题）
const toc = computed(() => {
  if (!article.value.content) return []
  const headings = []
  const lines = article.value.content.split('\n')
  let inCodeBlock = false
  
  for (const line of lines) {
    // 跳过代码块内的内容
    if (line.trim().startsWith('```') || line.trim().startsWith('~~~')) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock) continue
    
    const match = line.match(/^(#{1,6})\s+(.+)/)
    
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      headings.push({
        level,
        text,
        id: text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      })
    }
  }
  return headings
})

// 滚动到指定标题
const scrollToHeading = (id) => {
  const element = document.getElementById(id)
  if (element) {
    const offset = 90 // 导航栏偏移量
    const top = element.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

// 监听滚动更新当前目录项
const updateActiveHeading = () => {
  const headings = document.querySelectorAll('.article-content h1, .article-content h2, .article-content h3, .article-content h4, .article-content h5, .article-content h6')
  const scrollY = window.scrollY + 100
  
  for (let i = headings.length - 1; i >= 0; i--) {
    const heading = headings[i]
    if (heading.offsetTop <= scrollY) {
      activeHeading.value = heading.id
      return
    }
  }
  activeHeading.value = ''
}

// 获取文章内容（Markdown 渲染）
const articleContent = computed(() => {
  if (!article.value.content) return ''
  // 使用 marked 直接渲染 Markdown 内容
  return marked(article.value.content)
})

// 获取文章详情
const fetchArticle = async (id) => {
  try {
    loading.value = true
    error.value = null
    const res = await api.getArticleById(id)
    if (res.success) {
      article.value = res.data
      likeCount.value = res.data.likes || 0
      // 调用浏览接口
      api.viewArticle(id)
      // 获取相关文章
      fetchRelatedArticles(res.data.tag, id)
    } else {
      error.value = res.message || '文章不存在'
    }
  } catch (err) {
    error.value = '加载文章失败'
    console.error('获取文章详情失败:', err)
  } finally {
    loading.value = false
  }
}

// 获取推荐文章
const fetchRelatedArticles = async (tag, excludeId) => {
  try {
    const res = await api.getRecommendArticles(excludeId)
    if (res.success) {
      relatedArticles.value = res.data || []
    }
  } catch (err) {
    console.error('获取相关文章失败:', err)
  }
}

// 跳转到文章详情
const goToArticle = (item) => {
  router.push(`/article/${item.id}`)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const toggleLike = async () => {
  if (isLiked.value) return
  isLiked.value = true
  likeCount.value += 1
  await api.likeArticle(article.value.id)
}

// 分享相关
const shareUrl = computed(() => window.location.href)

const toggleShare = () => {
  showShare.value = !showShare.value
  copySuccess.value = false
}

const copyShareLink = () => {
  navigator.clipboard.writeText(shareUrl.value).then(() => {
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  })
}

// 点击外部关闭分享弹窗
const closeSharePopup = (e) => {
  if (showShare.value) {
    showShare.value = false
  }
}

// 复制代码（全局函数供 onclick 调用）
window.copyCode = (btn) => {
  const encodedCode = btn.getAttribute('data-code')
  const code = decodeURIComponent(encodedCode)
  navigator.clipboard.writeText(code).then(() => {
    const span = btn.querySelector('span')
    const originalText = span.textContent
    span.textContent = '已复制!'
    btn.classList.add('copied')
    setTimeout(() => {
      span.textContent = originalText
      btn.classList.remove('copied')
    }, 2000)
  })
}

const goHome = () => {
  router.push('/')
}

// 处理导航
const handleNavigate = (path) => {
  router.push(path)
}

// 滚动处理
const handleScroll = () => {
  updateActiveHeading()
  showBackTop.value = window.scrollY > 400
}

// 点击页面其他地方关闭分享弹窗
const handleDocumentClick = (e) => {
  if (showShare.value && !e.target.closest('.share-wrapper')) {
    showShare.value = false
  }
}

// 回到顶部
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 根据路由参数加载文章
onMounted(() => {
  const articleId = route.params.id
  if (articleId) {
    fetchArticle(articleId)
  }
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', handleDocumentClick)
})

// 监听路由参数变化，点击推荐文章时重新加载
watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchArticle(newId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<style scoped>
.article-detail {
  position: relative;
  min-height: 100vh;
  padding-bottom: 80px;
}

/* 背景效果（复用首页样式） */
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

/* 加载和错误状态 */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 120px 0;
  color: var(--text-muted);
  min-height: 60vh;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state svg {
  color: #ef4444;
  opacity: 0.8;
}

.error-state p {
  font-size: 1.125rem;
}

/* 文章主体 */
.article-main {
  position: relative;
  padding-top: 100px;
  z-index: 1;
}

.article-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 40px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 32px;
}

.back-btn:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  background: var(--accent-glow);
}

/* 文章头部 */
.article-header {
  margin-bottom: 32px;
}

.article-tag {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  margin-bottom: 20px;
}

.article-title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 24px;
  letter-spacing: -0.02em;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.article-author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.meta-divider {
  color: var(--border-color);
}

/* 文章封面 */
.article-cover {
  height: 400px;
  border-radius: 16px;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
}

.cover-pattern {
  position: absolute;
  inset: 0;
  background: 
    linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.1) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.1) 75%);
  background-size: 40px 40px;
  background-position: 0 0, 0 20px, 20px -20px, -20px 0px;
}

/* 文章内容 */
.article-body {
  display: grid;
  grid-template-columns: 240px 1fr 200px;
  gap: 32px;
  margin-bottom: 48px;
}

/* 文章推荐侧边栏 */
.article-sidebar {
  position: sticky;
  top: 100px;
  height: fit-content;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.sidebar-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-header svg {
  color: var(--accent-primary);
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.related-item {
  display: flex;
  gap: 10px;
  cursor: pointer;
  padding: 8px;
  margin: -8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.related-item:hover {
  background: var(--accent-glow);
}

.related-item-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  flex-shrink: 0;
  position: relative;
}

.related-item-tag {
  position: absolute;
  top: 4px;
  left: 4px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.65rem;
}

.related-item-content {
  flex: 1;
  min-width: 0;
}

.related-item-title {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 4px;
}

.related-item-meta {
  display: flex;
  gap: 8px;
  font-size: 0.7rem;
  color: var(--text-muted);
}

.related-views {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.article-content {
  max-width: 740px;
  width: 100%;
}

.article-content h2 {
  font-size: 1.5rem;
  margin: 40px 0 20px;
  color: var(--text-primary);
}

.article-content p {
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 20px;
}

.article-content .lead {
  font-size: 1.125rem;
  color: var(--text-primary);
  padding: 24px;
  background: var(--bg-card);
  border-radius: 12px;
  border-left: 4px solid var(--accent-primary);
  margin-bottom: 32px;
}

.article-content ul {
  padding-left: 24px;
  color: var(--text-secondary);
}

.article-content li {
  margin-bottom: 12px;
  line-height: 1.8;
}

/* Markdown 正文样式 (需要 :deep() 穿透 v-html) */
.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4) {
  color: var(--text-primary);
  font-weight: 700;
  line-height: 1.4;
  margin-top: 40px;
  margin-bottom: 16px;
}

.article-content :deep(h1) {
  font-size: 2rem;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border-color);
}

.article-content :deep(h2) {
  font-size: 1.5rem;
  position: relative;
  padding-left: 16px;
}

.article-content :deep(h2)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 4px;
  background: linear-gradient(180deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 2px;
}

.article-content :deep(h3) {
  font-size: 1.25rem;
}

.article-content :deep(h4) {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.article-content :deep(p) {
  color: var(--text-secondary);
  line-height: 1.9;
  margin-bottom: 20px;
  font-size: 1.05rem;
}

.article-content :deep(.lead) {
  font-size: 1.15rem;
  color: var(--text-primary);
  padding: 24px;
  background: var(--bg-card);
  border-radius: 12px;
  border-left: 4px solid var(--accent-primary);
  margin-bottom: 32px;
  line-height: 1.8;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  padding-left: 24px;
  margin-bottom: 20px;
  color: var(--text-secondary);
}

.article-content :deep(li) {
  margin-bottom: 10px;
  line-height: 1.8;
  position: relative;
}

.article-content :deep(ul li)::marker {
  color: var(--accent-primary);
}

.article-content :deep(ol li)::marker {
  color: var(--accent-primary);
  font-weight: 600;
}

.article-content :deep(blockquote) {
  padding: 20px 24px;
  margin: 28px 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.08));
  border-left: 4px solid var(--accent-primary);
  border-radius: 0 12px 12px 0;
  color: var(--text-secondary);
  font-style: italic;
}

.article-content :deep(blockquote p) {
  margin-bottom: 0;
}

.article-content :deep(code) {
  padding: 3px 8px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.88em;
  color: #f472b6;
}

.article-content :deep(a) {
  color: var(--accent-primary);
  text-decoration: none;
  border-bottom: 1px dashed var(--accent-primary);
  transition: all 0.2s ease;
}

.article-content :deep(a:hover) {
  border-bottom-style: solid;
  opacity: 0.8;
}

.article-content :deep(img) {
  max-width: 100%;
  border-radius: 12px;
  margin: 28px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.article-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 28px 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.article-content :deep(th),
.article-content :deep(td) {
  padding: 14px 18px;
  border: 1px solid var(--border-color);
  text-align: left;
}

.article-content :deep(th) {
  background: var(--bg-card);
  font-weight: 600;
  color: var(--text-primary);
}

.article-content :deep(tr:hover td) {
  background: rgba(59, 130, 246, 0.05);
}

.article-content :deep(hr) {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-color), transparent);
  margin: 40px 0;
}

/* 任务列表样式 */
.article-content :deep(input[type="checkbox"]) {
  margin-right: 8px;
  accent-color: var(--accent-primary);
}

/* 代码块 - 简洁现代风格 (使用 :deep() 穿透 v-html) */
.article-content :deep(.code-block) {
  position: relative;
  background: #fafbfc;
  border-radius: 10px;
  overflow: hidden;
  margin: 28px 0;
  border: 1px solid #e5e7eb;
}

/* 顶部条 - 简洁无按钮 */
.article-content :deep(.code-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%);
  border-bottom: 1px solid #e5e7eb;
}

.article-content :deep(.code-lang) {
  font-size: 0.8rem;
  color: #6b7280;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.article-content :deep(.copy-btn) {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.article-content :deep(.copy-btn:hover) {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #374151;
}

.article-content :deep(.copy-btn.copied) {
  background: #ecfdf5;
  border-color: #10b981;
  color: #059669;
}

.article-content :deep(.code-block pre) {
  margin: 0;
  padding: 0;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #fafbfc;
}

.article-content :deep(.code-block pre::-webkit-scrollbar) {
  height: 6px;
}

.article-content :deep(.code-block pre::-webkit-scrollbar-track) {
  background: #fafbfc;
}

.article-content :deep(.code-block pre::-webkit-scrollbar-thumb) {
  background: #d1d5db;
  border-radius: 3px;
}

.article-content :deep(.code-block pre::-webkit-scrollbar-thumb:hover) {
  background: #9ca3af;
}

.article-content :deep(.code-block code) {
  display: block;
  padding: 18px 20px;
  background: transparent !important;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.875rem;
  color: #c9d1d9;
  line-height: 1.7;
  tab-size: 2;
}

/* highlight.js 语法高亮主题 */
.article-content :deep(.hljs) {
  background: transparent !important;
}

.article-content :deep(.hljs-keyword),
.article-content :deep(.hljs-selector-tag),
.article-content :deep(.hljs-title),
.article-content :deep(.hljs-section),
.article-content :deep(.hljs-doctag),
.article-content :deep(.hljs-name),
.article-content :deep(.hljs-strong) {
  color: #ff7b72;
  font-weight: bold;
}

.article-content :deep(.hljs-string),
.article-content :deep(.hljs-title.class_),
.article-content :deep(.hljs-title.class_.inherited__),
.article-content :deep(.hljs-title.function_),
.article-content :deep(.hljs-attr),
.article-content :deep(.hljs-symbol),
.article-content :deep(.hljs-bullet),
.article-content :deep(.hljs-addition),
.article-content :deep(.hljs-template-tag),
.article-content :deep(.hljs-template-variable) {
  color: #a5d6ff;
}

.article-content :deep(.hljs-comment),
.article-content :deep(.hljs-quote),
.article-content :deep(.hljs-deletion),
.article-content :deep(.hljs-meta) {
  color: #8b949e;
}

.article-content :deep(.hljs-number),
.article-content :deep(.hljs-literal),
.article-content :deep(.hljs-type),
.article-content :deep(.hljs-params),
.article-content :deep(.hljs-link) {
  color: #79c0ff;
}

.article-content :deep(.hljs-attribute),
.article-content :deep(.hljs-variable),
.article-content :deep(.hljs-built_in),
.article-content :deep(.hljs-params) {
  color: #ffa657;
}

.article-content :deep(.hljs-property) {
  color: #79c0ff;
}

.article-content :deep(.hljs-regexp) {
  color: #a5d6ff;
}

.article-content :deep(.hljs-selector-class),
.article-content :deep(.hljs-selector-id),
.article-content :deep(.hljs-selector-pseudo) {
  color: #7ee787;
}

.article-content :deep(.hljs-tag) {
  color: #7ee787;
}

.article-content :deep(.hljs-emphasis) {
  font-style: italic;
}

/* 文章目录 */
.article-toc {
  position: sticky;
  top: 100px;
  height: fit-content;
}

.toc-container {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
}

.toc-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.toc-header svg {
  color: var(--accent-primary);
}

.toc-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toc-link {
  display: block;
  padding: 8px 10px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 6px;
  border-left: 2px solid transparent;
  transition: all 0.2s ease;
  line-height: 1.4;
}

.toc-link:hover {
  color: var(--accent-primary);
  background: var(--accent-glow);
}

.toc-link.active {
  color: var(--accent-primary);
  background: var(--accent-glow);
  border-left-color: var(--accent-primary);
  font-weight: 500;
}

.toc-link.toc-h2 {
  font-weight: 600;
}

.toc-link.toc-h3 {
  padding-left: 12px;
  font-size: 0.82rem;
}

.toc-link.toc-h4,
.toc-link.toc-h5,
.toc-link.toc-h6 {
  padding-left: 24px;
  font-size: 0.78rem;
}

/* 文章标签 */
.article-tags {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 24px;
}

.tags-label {
  color: var(--text-muted);
  font-size: 0.95rem;
}

.tag-item {
  padding: 6px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 100px;
  font-size: 0.875rem;
  color: var(--tag-color);
  transition: all 0.3s ease;
}

.tag-item:hover {
  border-color: var(--tag-color);
  background: rgba(255, 255, 255, 0.05);
}

/* 点赞分享 */
.article-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 80px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  background: var(--accent-glow);
}

.like-btn.active {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

/* 分享弹窗 */
.share-wrapper {
  position: relative;
}

.share-popup {
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  min-width: 300px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 50;
  animation: shareFadeIn 0.2s ease;
}

@keyframes shareFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.share-popup-arrow {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: var(--bg-card);
  border-left: 1px solid var(--border-color);
  border-top: 1px solid var(--border-color);
  rotate: 45deg;
}

.share-popup-header {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.share-popup-body {
  display: flex;
  gap: 8px;
}

.share-link-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-page);
  color: var(--text-primary);
  font-size: 0.8rem;
  outline: none;
  transition: border-color 0.2s;
}

.share-link-input:focus {
  border-color: var(--accent-primary);
}

.share-copy-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  background: var(--accent-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.share-copy-btn:hover {
  opacity: 0.9;
}

.share-copy-btn.copied {
  background: #10b981;
}

/* 相关推荐 */
.related-articles {
  padding-top: 48px;
  border-top: 1px solid var(--border-color);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 32px;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 80px;
}

.related-card {
  background: var(--bg-card);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.related-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.related-image {
  height: 120px;
}

.related-content {
  padding: 16px;
}

.related-tag {
  font-size: 0.75rem;
  color: var(--accent-primary);
  font-weight: 600;
}

.related-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 8px 0;
  line-height: 1.4;
}

.related-date {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* 响应式 */
@media (max-width: 1100px) {
  .article-body {
    grid-template-columns: 1fr 200px;
  }
  
  .article-sidebar {
    display: none;
  }
}

@media (max-width: 900px) {
  .article-body {
    grid-template-columns: 1fr;
  }
  
  .article-toc {
    display: none;
  }
}

@media (max-width: 768px) {
  .article-title {
    font-size: 1.75rem;
  }

  .article-cover {
    height: 240px;
  }

  .related-grid {
    grid-template-columns: 1fr;
  }
}

.back-to-top {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 44px;
  height: 44px;
  border: 1px solid var(--border-color);
  border-radius: 50%;
  background: var(--bg-card);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.3s ease;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-to-top:hover {
  color: var(--text-primary);
  border-color: var(--text-muted);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.back-to-top.visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

@media (max-width: 768px) {
  .back-to-top {
    bottom: 24px;
    right: 24px;
    width: 40px;
    height: 40px;
  }
}
</style>
