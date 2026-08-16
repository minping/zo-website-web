<template>
  <div class="article-detail">
    <!-- 背景效果 -->
    <div class="bg-grid"></div>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>

    <!-- 导航栏 -->
    <Navbar activeMenu="文章" @navigate="handleNavigate" />

    <!-- 沉浸式阅读切换按钮 -->
    <button class="immersive-toggle" @click="goImmersive" title="沉浸式阅读">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
      <span class="immersive-label">沉浸阅读</span>
    </button>

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
          <button class="back-btn" @click="goBack">返回</button>
        </div>

        <article v-else class="article-container">
          <!-- 返回按钮 -->
          <button class="back-btn" @click="goBack">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            返回
          </button>

          <!-- 文章头部 -->
          <header class="article-header">
            <h1 class="article-title">{{ article.title }}</h1>
            <p class="article-desc">{{ article.desc }}</p>
            <div class="article-info-row">
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
            </div>
          </header>

          <!-- 文章封面 -->
          <!-- <div v-if="!isImmersiveMode" class="article-cover" :style="{ background: article.gradient }">
            <div class="cover-pattern"></div>
          </div> -->

          <!-- 文章正文 -->
          <div class="article-body" :class="{ 'no-toc': toc.length === 0 }">
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

            <div class="article-content">
              <div v-html="articleContent"></div>
            </div>
            
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
          </div>

          <!-- 文章标签 -->
          <div v-if="attachments.length > 0" class="article-attachments">
            <div class="attachments-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
              <span>附件下载 ({{ attachments.length }})</span>
            </div>
            <div class="attachments-list">
              <a
                v-for="(file, index) in attachments"
                :key="file.id || index"
                :href="getDownloadUrl(file)"
                class="attachment-item"
                target="_blank"
                :title="'下载 ' + file.name"
              >
                <div class="attachment-item-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                    <polyline points="13 2 13 9 20 9"/>
                  </svg>
                </div>
                <div class="attachment-item-info">
                  <span class="attachment-item-name">{{ file.name }}</span>
                  <span class="attachment-item-size">{{ formatFileSize(file.size) }}</span>
                </div>
                <div class="attachment-item-download">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </div>
              </a>
            </div>
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

    <!-- 图片查看器 -->
    <Teleport to="body">
      <div 
        v-if="showImageViewer" 
        class="image-viewer-overlay" 
        @click="closeImageViewer"
        @wheel.prevent="handleImageWheel"
      >
        <button class="image-viewer-close" @click="closeImageViewer">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div class="image-viewer-toolbar">
          <button class="image-viewer-btn" @click.stop="zoomIn" title="放大">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          <button class="image-viewer-btn" @click.stop="zoomOut" title="缩小">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          <button class="image-viewer-btn" @click.stop="resetZoom" title="原始大小">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
            </svg>
          </button>
        </div>
        <div 
          class="image-viewer-container"
          :style="{
            transform: `scale(${imageScale})`,
            cursor: imageScale > 1 ? 'grab' : 'default'
          }"
        >
          <img :src="currentImageSrc" :alt="currentImageAlt" class="image-viewer-img" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '../api/article'
import { API_BASE_URL } from '../config'
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
        <div class="code-header-left">
          <span class="file-icon"></span>
          <span class="code-lang">${langLabel}</span>
        </div>
        <button class="copy-btn" onclick="copyCode(this)" data-code="${encodeURIComponent(text)}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          <span>复制</span>
        </button>
      </div>
      <div class="code-body">
        <pre><code class="language-${language} hljs">${highlightedCode}</code></pre>
      </div>
    </div>
  `
}
marked.use({ renderer })

const router = useRouter()
const route = useRoute()
useTheme()

const isLiked = ref(false)
const likeCount = ref(0)
const loading = ref(true)
const error = ref(null)
const activeHeading = ref('')
const relatedArticles = ref([])
const showBackTop = ref(false)
const showShare = ref(false)
const copySuccess = ref(false)

// 图片查看器状态
const showImageViewer = ref(false)
const currentImageSrc = ref('')
const currentImageAlt = ref('')
const imageScale = ref(1)

const article = ref({})

// 附件列表
const attachments = ref([])

// 文件大小格式化
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '未知大小'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// 获取附件下载地址
const getDownloadUrl = (file) => {
  if (!file.id) return '#'
  return `${API_BASE_URL}/file/download/${file.id}`
}

// 解析附件JSON
const parseAttachments = (filesData) => {
  if (!filesData) return []
  try {
    const parsed = typeof filesData === 'string' ? JSON.parse(filesData) : filesData
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.warn('附件数据解析失败:', e)
    return []
  }
}

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
      attachments.value = parseAttachments(res.data.files)
      // 调用浏览接口
      api.viewArticle(id)
      // 获取相关文章
      fetchRelatedArticles(id)
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
const fetchRelatedArticles = async (excludeId) => {
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

const goImmersive = () => {
  const id = route.params.id
  router.push(`/article/${id}/immersive`)
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

// 图片查看器方法
const handleImageClick = (e) => {
  if (e.target.tagName === 'IMG') {
    currentImageSrc.value = e.target.src
    currentImageAlt.value = e.target.alt || ''
    imageScale.value = 1
    showImageViewer.value = true
  }
}

const closeImageViewer = () => {
  showImageViewer.value = false
  imageScale.value = 1
}

const zoomIn = () => {
  imageScale.value = Math.min(imageScale.value + 0.25, 5)
}

const zoomOut = () => {
  imageScale.value = Math.max(imageScale.value - 0.25, 0.25)
}

const resetZoom = () => {
  imageScale.value = 1
}

const handleImageWheel = (e) => {
  if (e.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

// ESC 键关闭图片查看器
const handleKeyDown = (e) => {
  if (e.key === 'Escape' && showImageViewer.value) {
    closeImageViewer()
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

// 返回上一次访问的页面
const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
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
  document.addEventListener('keydown', handleKeyDown)

  // 图片点击放大 - 延迟绑定等待文章内容渲染
  setTimeout(() => {
    const content = document.querySelector('.article-content')
    if (content) {
      content.addEventListener('click', handleImageClick)
    }
  }, 800)
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
  document.removeEventListener('keydown', handleKeyDown)

  const content = document.querySelector('.article-content')
  if (content) {
    content.removeEventListener('click', handleImageClick)
  }
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

/* 覆盖全局 .container 的宽度限制，让文章内容区更宽 */
.article-main .container {
  max-width: 1600px;
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
}

.article-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 0;
}

.article-title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.article-desc {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 24px;
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
  grid-template-columns: 200px 1fr 240px;
  gap: 32px;
  justify-content: center;
  margin-bottom: 48px;
  min-height: 60vh;
}

/* 无目录时去除左侧 200px 列 */
.article-body.no-toc {
  grid-template-columns: 1fr 240px;
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
  line-clamp: 2;
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
  max-width: 100%;
  width: 100%;
  min-width: 0;
  overflow-wrap: break-word;
  word-break: break-word;
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
  word-break: break-all;
  overflow-wrap: anywhere;
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
  width: 100%;
  display: block;
  border-radius: 12px;
  margin: 28px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  cursor: zoom-in;
  transition: opacity 0.2s;
}

.article-content :deep(img:hover) {
  opacity: 0.9;
}

.article-content :deep(table) {
  width: 100%;
  table-layout: fixed;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 0;
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
  background: #2b2b2b;
  border-radius: 8px;
  overflow: hidden;
  margin: 28px 0;
  border: 1px solid #323232;
}

/* IDEA 风格头部 - 类似编辑器标签栏 */
.article-content :deep(.code-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: #3c3f41;
  border-bottom: 1px solid #323232;
}

.article-content :deep(.code-header-left) {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* IDEA 文件图标 */
.article-content :deep(.file-icon) {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #6a9955;
  flex-shrink: 0;
}

.article-content :deep(.code-lang) {
  font-size: 0.75rem;
  color: #bbbbbb;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.article-content :deep(.copy-btn) {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: transparent;
  border: 1px solid #555;
  border-radius: 4px;
  color: #bbbbbb;
  font-size: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.article-content :deep(.copy-btn:hover) {
  background: #4a4d4f;
  border-color: #888;
  color: #e0e0e0;
}

.article-content :deep(.copy-btn.copied) {
  background: #2a3b2e;
  border-color: #4a8;
  color: #6a9955;
}

/* 代码体 */
.article-content :deep(.code-body) {
  overflow-x: auto;
}

.article-content :deep(.code-body pre) {
  margin: 0;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #4a4a4a #2b2b2b;
}

.article-content :deep(.code-body pre::-webkit-scrollbar) {
  height: 6px;
}
.article-content :deep(.code-body pre::-webkit-scrollbar-track) {
  background: #2b2b2b;
}
.article-content :deep(.code-body pre::-webkit-scrollbar-thumb) {
  background: #4a4a4a;
  border-radius: 3px;
}
.article-content :deep(.code-body pre::-webkit-scrollbar-thumb:hover) {
  background: #555;
}

.article-content :deep(.code-body code) {
  display: block;
  padding: 18px 20px;
  background: #2b2b2b !important;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.875rem;
  color: #a9b7c6;
  line-height: 1.7;
  tab-size: 4;
}

/* highlight.js - IDEA Darcula 主题 */
.article-content :deep(.hljs) {
  background: transparent !important;
}

/* 关键字 */
.article-content :deep(.hljs-keyword),
.article-content :deep(.hljs-selector-tag),
.article-content :deep(.hljs-deletion),
.article-content :deep(.hljs-literal) {
  color: #CC7832;
  font-weight: bold;
}

/* 字符串 */
.article-content :deep(.hljs-string),
.article-content :deep(.hljs-regexp),
.article-content :deep(.hljs-addition),
.article-content :deep(.hljs-template-tag),
.article-content :deep(.hljs-template-variable) {
  color: #6A8759;
}

/* 注释 */
.article-content :deep(.hljs-comment),
.article-content :deep(.hljs-quote) {
  color: #808080;
  font-style: italic;
}

/* 数字、布尔 */
.article-content :deep(.hljs-number),
.article-content :deep(.hljs-link),
.article-content :deep(.hljs-symbol),
.article-content :deep(.hljs-bullet) {
  color: #6897BB;
}

/* 方法/函数名 */
.article-content :deep(.hljs-title.function_),
.article-content :deep(.hljs-title) {
  color: #FFC66D;
}

/* 注解/元 */
.article-content :deep(.hljs-meta),
.article-content :deep(.hljs-doctag) {
  color: #BBB529;
}

/* 类名/类型 */
.article-content :deep(.hljs-title.class_),
.article-content :deep(.hljs-title.class_.inherited__),
.article-content :deep(.hljs-type),
.article-content :deep(.hljs-section),
.article-content :deep(.hljs-name),
.article-content :deep(.hljs-selector-class) {
  color: #A9B7C6;
}

/* 属性 */
.article-content :deep(.hljs-attr),
.article-content :deep(.hljs-attribute),
.article-content :deep(.hljs-property) {
  color: #9876AA;
}

/* 变量/参数 */
.article-content :deep(.hljs-variable),
.article-content :deep(.hljs-params),
.article-content :deep(.hljs-built_in) {
  color: #A9B7C6;
}

/* 标签 */
.article-content :deep(.hljs-tag) {
  color: #E8BF6A;
}

/* 选择器 */
.article-content :deep(.hljs-selector-id) {
  color: #FFC66D;
}

.article-content :deep(.hljs-selector-pseudo) {
  color: #CC7832;
}

/* 强调 */
.article-content :deep(.hljs-strong) {
  font-weight: bold;
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
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
  padding-right: 4px;
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

.toc-nav::-webkit-scrollbar {
  width: 4px;
}

.toc-nav::-webkit-scrollbar-track {
  background: transparent;
}

.toc-nav::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.toc-nav::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

/* 文章标签 */
.article-attachments {
  grid-column: 1 / -1;
  padding: 24px 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 24px;
}

.attachments-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1rem;
}

.attachments-header svg {
  color: var(--accent-primary);
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.attachment-item:hover {
  border-color: var(--accent-primary);
  background: var(--accent-glow);
}

.attachment-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.1);
  color: var(--accent-primary);
  flex-shrink: 0;
}

.attachment-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.attachment-item-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.attachment-item-size {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.attachment-item-download {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: var(--text-muted);
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.attachment-item:hover .attachment-item-download {
  color: var(--accent-primary);
  background: rgba(59, 130, 246, 0.1);
}

/* 文章标签 */
.article-tags {
  grid-column: 1 / -1;
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
  grid-column: 1 / -1;
  display: flex;
  gap: 16px;
  margin-bottom: 80px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 140px;
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
  bottom: calc(100% + 16px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 20px;
  width: 340px;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.04),
    0 12px 40px rgba(0, 0, 0, 0.18);
  z-index: 50;
  animation: shareFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes shareFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(8px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

.share-popup-arrow {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: var(--bg-card);
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  rotate: 45deg;
}

.share-popup-header {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.share-popup-header::before {
  content: '';
  width: 18px;
  height: 18px;
  background: currentColor;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='18' cy='5' r='3'/%3E%3Ccircle cx='6' cy='12' r='3'/%3E%3Ccircle cx='18' cy='19' r='3'/%3E%3Cline x1='8.59' y1='13.51' x2='15.42' y2='17.49'/%3E%3Cline x1='15.41' y1='6.51' x2='8.59' y2='10.49'/%3E%3C/svg%3E") center / contain no-repeat;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='18' cy='5' r='3'/%3E%3Ccircle cx='6' cy='12' r='3'/%3E%3Ccircle cx='18' cy='19' r='3'/%3E%3Cline x1='8.59' y1='13.51' x2='15.42' y2='17.49'/%3E%3Cline x1='15.41' y1='6.51' x2='8.59' y2='10.49'/%3E%3C/svg%3E") center / contain no-repeat;
  opacity: 0.6;
}

.share-popup-body {
  display: flex;
  gap: 8px;
}

.share-link-input {
  flex: 1;
  padding: 9px 14px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-page);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  outline: none;
  transition: all 0.2s ease;
}

.share-link-input:focus {
  border-color: var(--accent-primary);
  color: var(--text-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.share-copy-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 9px 16px;
  background: var(--accent-primary);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.share-copy-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.share-copy-btn:active {
  transform: translateY(0);
}

.share-copy-btn.copied {
  background: #10b981;
}

.share-copy-btn.copied:hover {
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
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

/* ========== 响应式 1100px ========== */
/* 平板竖屏 / 小屏笔记本：隐藏右侧推荐栏，TOC 保留 */
@media (max-width: 1100px) {
  .article-body {
    grid-template-columns: 200px 1fr;
    justify-content: center;
    gap: 24px;
  }

  .article-body.no-toc {
    grid-template-columns: 1fr;
  }
  
  .article-sidebar {
    display: none;
  }

  .article-container {
    padding: 0 24px;
  }
}

/* ========== 响应式 900px ========== */
/* 平板横屏 / 大屏手机：隐藏 TOC，内容区居中 */
@media (max-width: 900px) {
  .article-body {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .article-toc {
    display: none;
  }

  .article-container {
    padding: 0 20px;
  }

  .article-title {
    font-size: 1.75rem;
  }

  .article-desc {
    font-size: 0.92rem;
  }
}

/* ========== 沉浸式阅读按钮 ========== */
.immersive-toggle {
  position: fixed;
  top: 80px;
  right: 24px;
  z-index: 100;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.immersive-toggle:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  background: var(--accent-glow);
  transform: translateY(-1px);
}

/* ========== 移动端适配 768px ========== */
@media (max-width: 768px) {
  .article-main .container {
    max-width: 100%;
    padding: 0;
  }

  .article-main {
    padding-top: 64px;
  }

  .article-container {
    max-width: 100%;
    padding: 0 16px;
  }

  /* === 头部 === */
  .article-header {
    margin-bottom: 24px;
  }

  .article-title {
    font-size: 1.4rem;
    line-height: 1.45;
  }

  .article-desc {
    font-size: 0.9rem;
    line-height: 1.6;
    margin-top: 10px;
  }

  .article-info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    margin-top: 14px;
  }

  .article-meta {
    flex-wrap: wrap;
    gap: 10px;
    font-size: 0.82rem;
  }

  .article-meta span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  /* === 封面 === */
  .article-cover {
    height: 180px;
    margin-bottom: 20px;
    border-radius: 10px;
  }

  /* === 正文排版 === */
  .article-body {
    gap: 0;
  }

  .article-content {
    max-width: 100%;
  }

  .article-content :deep(h1) {
    font-size: 1.35rem;
    margin: 24px 0 12px;
  }

  .article-content :deep(h2) {
    font-size: 1.15rem;
    margin: 22px 0 10px;
  }

  .article-content :deep(h3) {
    font-size: 1.05rem;
    margin: 18px 0 8px;
  }

  .article-content :deep(p) {
    font-size: 0.93rem;
    line-height: 1.85;
    margin: 12px 0;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  .article-content :deep(li) {
    font-size: 0.93rem;
    line-height: 1.8;
    margin: 6px 0;
  }

  .article-content :deep(a) {
    word-break: break-all;
  }

  /* === 引用块 === */
  .article-content :deep(blockquote) {
    padding: 14px 16px;
    margin: 18px 0;
    font-size: 0.9rem;
    border-left-width: 3px;
  }

  /* === 代码块 === */
  .article-content :deep(.code-block) {
    border-radius: 8px;
    margin: 18px 0;
    overflow-x: auto;
    background: #1e1e1e;
    touch-action: pan-x;
  }

  .article-content :deep(.code-header) {
    padding: 8px 14px;
    font-size: 0.72rem;
  }

  .article-content :deep(.code-header .copy-btn) {
    padding: 3px 8px;
    font-size: 0.7rem;
  }

  .article-content :deep(.code-body code) {
    font-size: 0.78rem;
    padding: 12px 14px;
    line-height: 1.65;
  }

  /* === 表格 === */
  .article-content :deep(table) {
    display: block;
    overflow-x: auto;
    touch-action: pan-x;
    border-radius: 6px;
    font-size: 0.82rem;
  }

  .article-content :deep(th),
  .article-content :deep(td) {
    padding: 8px 12px;
    white-space: nowrap;
  }

  /* === 图片 === */
  .article-content :deep(img) {
    border-radius: 8px;
    margin: 18px 0;
  }

  /* === 文章标签 === */
  .article-tags {
    flex-wrap: wrap;
    gap: 6px;
    padding: 16px 0;
  }

  .article-tag {
    font-size: 0.8rem;
    padding: 5px 12px;
    border-radius: 14px;
  }

  /* === 附件 === */
  .article-attachments {
    padding: 16px 0;
  }

  .attachment-item {
    padding: 12px 14px;
    border-radius: 8px;
  }

  .attachment-item-name {
    font-size: 0.82rem;
  }

  /* === 操作按钮 === */
  .article-actions {
    gap: 10px;
    margin-bottom: 32px;
  }

  .action-btn {
    min-width: 0;
    flex: 1;
    min-height: 44px;
    padding: 10px 14px;
    font-size: 0.85rem;
    border-radius: 10px;
    justify-content: center;
  }

  /* === 分享弹窗 === */
  .share-popup {
    left: 50%;
    transform: translateX(-50%);
    width: calc(100vw - 32px);
    max-width: 340px;
    padding: 16px;
    border-radius: 12px;
  }

  .share-popup-arrow {
    left: 50%;
    transform: translateX(-50%);
  }

  .share-link-row {
    gap: 8px;
  }

  .share-link-input {
    font-size: 0.78rem;
    padding: 10px 12px;
    border-radius: 8px;
  }

  .share-copy-btn {
    padding: 10px 14px;
    font-size: 0.78rem;
    border-radius: 8px;
    white-space: nowrap;
  }

  @keyframes shareFadeIn {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(8px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0) scale(1);
    }
  }

  /* === 推荐文章 === */
  .related-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  /* === 回到顶部 === */
  .back-to-top {
    bottom: 20px;
    right: 16px;
    width: 40px;
    height: 40px;
  }

  /* === 返回按钮 === */
  .back-btn {
    margin-bottom: 16px;
    padding: 8px 12px;
    font-size: 0.85rem;
    border-radius: 8px;
  }

  /* === 沉浸式按钮 === */
  .immersive-toggle {
    top: 72px;
    right: 12px;
    padding: 8px 14px;
    font-size: 13px;
    border-radius: 20px;
  }

  .immersive-toggle .immersive-label {
    display: none;
  }

  .immersive-toggle svg {
    width: 18px;
    height: 18px;
  }
}

/* ========== 移动端适配 480px ========== */
@media (max-width: 480px) {
  .article-main .container {
    max-width: 100%;
    padding: 0;
  }

  .article-main {
    padding-top: 56px;
  }

  .article-container {
    padding: 0 12px;
  }

  /* === 头部 === */
  .article-header {
    margin-bottom: 20px;
  }

  .article-title {
    font-size: 1.25rem;
    line-height: 1.45;
  }

  .article-desc {
    font-size: 0.85rem;
    line-height: 1.6;
    margin-top: 8px;
  }

  .article-info-row {
    gap: 8px;
    margin-top: 12px;
  }

  .article-meta {
    gap: 8px;
    font-size: 0.78rem;
  }

  /* === 封面 === */
  .article-cover {
    height: 160px;
    margin-bottom: 16px;
    border-radius: 8px;
  }

  /* === 正文排版 === */
  .article-content :deep(h1) {
    font-size: 1.2rem;
    margin: 20px 0 10px;
  }

  .article-content :deep(h2) {
    font-size: 1.05rem;
    margin: 18px 0 8px;
  }

  .article-content :deep(h3) {
    font-size: 0.98rem;
    margin: 16px 0 6px;
  }

  .article-content :deep(p) {
    font-size: 0.9rem;
    line-height: 1.8;
    margin: 10px 0;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  .article-content :deep(li) {
    font-size: 0.9rem;
    line-height: 1.75;
  }

  /* === 引用块 === */
  .article-content :deep(blockquote) {
    padding: 12px 14px;
    margin: 16px 0;
    font-size: 0.85rem;
    border-left-width: 3px;
  }

  /* === 代码块 === */
  .article-content :deep(.code-block) {
    border-radius: 6px;
    margin: 16px 0;
    overflow-x: auto;
    touch-action: pan-x;
  }

  .article-content :deep(.code-header) {
    padding: 6px 12px;
    font-size: 0.68rem;
  }

  .article-content :deep(.code-body code) {
    font-size: 0.72rem;
    padding: 10px 12px;
    line-height: 1.6;
  }

  /* === 表格 === */
  .article-content :deep(table) {
    display: block;
    overflow-x: auto;
    touch-action: pan-x;
    font-size: 0.78rem;
    border-radius: 6px;
  }

  .article-content :deep(th),
  .article-content :deep(td) {
    padding: 6px 10px;
  }

  /* === 图片 === */
  .article-content :deep(img) {
    border-radius: 6px;
    margin: 14px 0;
  }

  /* === 文章标签 === */
  .article-tags {
    gap: 6px;
    padding: 12px 0;
  }

  .article-tag {
    font-size: 0.75rem;
    padding: 4px 10px;
    border-radius: 12px;
  }

  /* === 附件 === */
  .article-attachments {
    padding: 12px 0;
  }

  .attachment-item {
    padding: 10px 12px;
  }

  .attachment-item-name {
    font-size: 0.78rem;
  }

  /* === 操作按钮 === */
  .article-actions {
    gap: 8px;
    margin-bottom: 24px;
  }

  .action-btn {
    flex: 1;
    min-width: 0;
    min-height: 42px;
    padding: 10px 12px;
    font-size: 0.8rem;
    border-radius: 8px;
  }

  /* === 分享弹窗 === */
  .share-popup {
    width: calc(100vw - 24px);
    max-width: 320px;
    padding: 14px;
  }

  .share-link-input {
    font-size: 0.7rem;
    padding: 8px 10px;
  }

  .share-copy-btn {
    padding: 8px 12px;
    font-size: 0.7rem;
  }

  /* === 推荐文章 === */
  .related-grid {
    gap: 10px;
  }

  /* === 回到顶部 === */
  .back-to-top {
    bottom: 16px;
    right: 12px;
    width: 36px;
    height: 36px;
  }

  /* === 返回按钮 === */
  .back-btn {
    margin-bottom: 14px;
    padding: 7px 10px;
    font-size: 0.8rem;
  }

  /* === 沉浸式按钮 === */
  .immersive-toggle {
    top: 68px;
    right: 8px;
    padding: 7px 10px;
    font-size: 12px;
    border-radius: 18px;
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



/* ========== 图片查看器 ========== */
.image-viewer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

.image-viewer-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  z-index: 10;
}

.image-viewer-close:hover {
  background: rgba(255, 255, 255, 0.25);
}

.image-viewer-toolbar {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 8px 16px;
  z-index: 10;
  backdrop-filter: blur(10px);
}

.image-viewer-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.image-viewer-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.image-viewer-container {
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.image-viewer-img {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 4px;
  user-select: none;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ========== 图片查看器移动端 ========== */
@media (max-width: 768px) {
  .image-viewer-overlay {
    padding: 0;
  }

  .image-viewer-close {
    top: 12px;
    right: 12px;
    width: 40px;
    height: 40px;
    background: rgba(0, 0, 0, 0.45);
  }

  .image-viewer-toolbar {
    bottom: 24px;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 24px;
  }

  .image-viewer-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  .image-viewer-container {
    max-width: 96vw;
    max-height: 80vh;
  }

  .image-viewer-img {
    max-width: 96vw;
    max-height: 80vh;
    border-radius: 8px;
  }
}

@media (max-width: 480px) {
  .image-viewer-close {
    top: 10px;
    right: 10px;
    width: 36px;
    height: 36px;
  }

  .image-viewer-close svg {
    width: 18px;
    height: 18px;
  }

  .image-viewer-toolbar {
    bottom: 20px;
    padding: 6px 12px;
    border-radius: 22px;
  }

  .image-viewer-btn {
    width: 36px;
    height: 36px;
  }

  .image-viewer-btn svg {
    width: 16px;
    height: 16px;
  }

  .image-viewer-container {
    max-width: 98vw;
    max-height: 75vh;
  }

  .image-viewer-img {
    max-width: 98vw;
    max-height: 75vh;
    border-radius: 6px;
  }
}
</style>
