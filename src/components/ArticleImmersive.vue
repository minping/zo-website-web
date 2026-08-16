<template>
  <div class="immersive-page">
    <div class="immersive-header">
      <button class="immersive-exit-btn" @click="exitImmersive" title="退出沉浸式阅读">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        <span>退出沉浸式</span>
      </button>
    </div>

    <div class="immersive-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="immersive-loading">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- 文章内容 -->
      <template v-else-if="article.content">
        <!-- 文章标题 -->
        <h1 class="immersive-title">{{ article.title }}</h1>

        <!-- 文章元信息 -->
        <div class="immersive-meta">
          <span class="immersive-meta-item">{{ article.createTime }}</span>
          <span class="immersive-meta-separator">·</span>
          <span class="immersive-meta-item">{{ article.author || 'Zo' }}</span>
          <span class="immersive-meta-separator">·</span>
          <span class="immersive-meta-item">{{ article.views || 0 }} 阅读</span>
        </div>

        <!-- 文章描述 -->
        <p v-if="article.desc" class="immersive-desc">{{ article.desc }}</p>

        <div class="immersive-divider"></div>

        <!-- 文章内容 -->
        <div class="immersive-content" v-html="articleContent"></div>
      </template>

      <!-- 空状态 -->
      <div v-else class="immersive-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <p>文章不存在或已被删除</p>
      </div>
    </div>

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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api/article'
import { marked } from 'marked'
import hljs from 'highlight.js'

// 配置 marked 自定义渲染器（与 ArticleDetail 保持一致）
const renderer = new marked.Renderer()

renderer.heading = function({ text, depth }) {
  const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-')
  return `<h${depth} id="${id}">${text}</h${depth}>`
}

renderer.code = function({ text, lang }) {
  const language = lang || 'text'
  const langLabel = language === 'text' ? '代码' : language.toUpperCase()
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
        <span>${langLabel}</span>
        <button class="copy-btn" onclick="navigator.clipboard.writeText(this.dataset.code)" data-code="${text.replace(/"/g, '&quot;')}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
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

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const article = ref({})
const showBackTop = ref(false)

// 获取文章内容（Markdown 渲染）
const articleContent = computed(() => {
  if (!article.value.content) return ''
  return marked(article.value.content)
})

// 图片查看器状态
const showImageViewer = ref(false)
const currentImageSrc = ref('')
const currentImageAlt = ref('')
const imageScale = ref(1)

const exitImmersive = () => {
  const id = route.params.id
  router.push(`/article/${id}`)
}

const fetchArticle = async (articleId) => {
  loading.value = true
  try {
    const res = await api.getArticleById(articleId)
    if (res.success && res.data) {
      article.value = res.data
    }
  } catch (error) {
    console.error('获取文章详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 滚动监听
const handleScroll = () => {
  showBackTop.value = window.scrollY > 400
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
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

const handleKeyDown = (e) => {
  if (e.key === 'Escape' && showImageViewer.value) {
    closeImageViewer()
  }
}

onMounted(() => {
  const articleId = route.params.id
  if (articleId) {
    fetchArticle(articleId)
  }

  window.addEventListener('scroll', handleScroll)
  document.addEventListener('keydown', handleKeyDown)

  // 图片点击放大 - 延迟绑定等待文章内容渲染
  setTimeout(() => {
    const content = document.querySelector('.immersive-content')
    if (content) {
      content.addEventListener('click', handleImageClick)
    }
  }, 1000)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('keydown', handleKeyDown)

  const content = document.querySelector('.immersive-content')
  if (content) {
    content.removeEventListener('click', handleImageClick)
  }
})
</script>

<style scoped>
/* ========== 沉浸式阅读页面 ========== */
.immersive-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fef9ef 0%, #f7efe0 30%, #f5e6d3 60%, #fdf6ec 100%);
  background-attachment: fixed;
  padding: 0 0 80px 0;
  position: relative;
}

/* 顶部导航条 */
.immersive-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  background: rgba(254, 249, 239, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(139, 115, 85, 0.1);
  transition: background 0.3s;
}

.immersive-exit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border: 1.5px solid #8b7355;
  background: transparent;
  color: #6b5544;
  font-size: 0.9rem;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.25s;
  font-family: inherit;
}

.immersive-exit-btn:hover {
  background: #8b7355;
  color: #fff;
}

/* 容器 */
.immersive-container {
  max-width: 800px;
  margin: 80px auto 0;
  padding: 60px 56px;
  background: rgba(255, 252, 245, 0.9);
  border-radius: 6px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04);
  position: relative;
}

/* 背景纹理 */
.immersive-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139, 115, 85, 0.01) 2px, rgba(139, 115, 85, 0.01) 4px);
  pointer-events: none;
  border-radius: 6px;
}

/* 加载状态 */
.immersive-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 0;
  color: #8b7355;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(139, 115, 85, 0.2);
  border-top-color: #8b7355;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 文章标题 */
.immersive-title {
  font-family: 'Noto Serif SC', 'STSong', 'SimSun', 'Songti SC', serif;
  font-size: 2rem;
  font-weight: 700;
  color: #2c1f14;
  text-align: center;
  line-height: 1.5;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

/* 文章描述 */
.immersive-desc {
  font-family: 'Noto Serif SC', 'STSong', 'SimSun', 'Songti SC', serif;
  font-size: 1rem;
  color: #8b7355;
  text-align: center;
  line-height: 1.8;
  margin: 0 0 32px 0;
  font-style: italic;
}

/* 分隔线 */
.immersive-divider {
  width: 60px;
  height: 2px;
  background: linear-gradient(to right, transparent, #c9a96e, transparent);
  margin: 0 auto 40px;
}

/* 文章元信息 */
.immersive-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 0.88rem;
  color: #a09888;
  z-index: 1;
  position: relative;
}

.immersive-meta-separator {
  color: #c9b99a;
}

/* 文章内容 */
.immersive-content {
  font-family: 'Noto Serif SC', 'STSong', 'SimSun', 'Songti SC', serif;
  font-size: 1.1rem;
  line-height: 2;
  color: #3d2e1e;
  position: relative;
  z-index: 1;
  overflow-wrap: break-word;
  word-break: break-word;
}

/* 内容标记样式 */
.immersive-content :deep(h1),
.immersive-content :deep(h2),
.immersive-content :deep(h3),
.immersive-content :deep(h4),
.immersive-content :deep(h5),
.immersive-content :deep(h6) {
  font-family: 'Noto Serif SC', 'STSong', 'SimSun', 'Songti SC', serif;
  color: #2c1f14;
  margin: 36px 0 18px;
  line-height: 1.4;
}

.immersive-content :deep(h1) { font-size: 1.75rem; }
.immersive-content :deep(h2) { font-size: 1.5rem; }
.immersive-content :deep(h3) { font-size: 1.3rem; }

.immersive-content :deep(p) {
  margin: 0 0 20px;
  text-indent: 2em;
  overflow-wrap: break-word;
  word-break: break-word;
}

.immersive-content :deep(a) {
  color: #8b5a2b;
  text-decoration: none;
  border-bottom: 1px dotted #c9a96e;
  word-break: break-all;
}

.immersive-content :deep(a:hover) {
  color: #5a3a1b;
  border-bottom-color: #8b5a2b;
}

.immersive-content :deep(blockquote) {
  border-left: 3px solid #c9a96e;
  margin: 24px 0;
  padding: 16px 24px;
  background: rgba(201, 169, 110, 0.06);
  border-radius: 0 6px 6px 0;
  color: #6b5544;
}

.immersive-content :deep(blockquote p) {
  margin: 0;
  text-indent: 0;
}

.immersive-content :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  border-radius: 6px;
  margin: 28px auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  cursor: zoom-in;
  transition: opacity 0.2s;
}

.immersive-content :deep(img:hover) {
  opacity: 0.92;
}

.immersive-content :deep(ul),
.immersive-content :deep(ol) {
  margin: 16px 0;
  padding-left: 2em;
}

.immersive-content :deep(li) {
  margin: 8px 0;
  text-indent: 0;
}

.immersive-content :deep(code) {
  background: rgba(139, 115, 85, 0.08);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.9em;
  color: #6b4c2a;
}

/* 代码块保持深色主题 */
.immersive-content :deep(.code-block) {
  margin: 24px 0;
  border-radius: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  background: #1e1e1e;
}

.immersive-content :deep(.code-header) {
  background: #2d2d2d;
  padding: 10px 16px;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #ccc;
}

.immersive-content :deep(.code-header .copy-btn) {
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #aaa;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.immersive-content :deep(.code-header .copy-btn:hover) {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.immersive-content :deep(.code-body) {
  padding: 0;
}

.immersive-content :deep(.code-body code) {
  background: transparent;
  color: #d4d4d4;
  padding: 16px 20px;
  display: block;
  font-size: 0.9rem;
  line-height: 1.6;
  border-radius: 0;
}

.immersive-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 24px 0;
}

.immersive-content :deep(th),
.immersive-content :deep(td) {
  border: 1px solid #d4c5a0;
  padding: 10px 14px;
  text-align: left;
}

.immersive-content :deep(th) {
  background: rgba(201, 169, 110, 0.15);
  font-weight: 600;
}

.immersive-content :deep(hr) {
  border: none;
  border-top: 1px solid #d4c5a0;
  margin: 36px 0;
}

/* highlight.js 代码高亮样式 */
.immersive-content :deep(.hljs) {
  background: transparent !important;
}

.immersive-content :deep(.hljs-keyword),
.immersive-content :deep(.hljs-selector-tag),
.immersive-content :deep(.hljs-deletion),
.immersive-content :deep(.hljs-literal) {
  color: #CC7832;
}

.immersive-content :deep(.hljs-string),
.immersive-content :deep(.hljs-regexp),
.immersive-content :deep(.hljs-addition),
.immersive-content :deep(.hljs-template-tag),
.immersive-content :deep(.hljs-template-variable) {
  color: #6A8759;
}

.immersive-content :deep(.hljs-comment),
.immersive-content :deep(.hljs-quote) {
  color: #808080;
  font-style: italic;
}

.immersive-content :deep(.hljs-number),
.immersive-content :deep(.hljs-link),
.immersive-content :deep(.hljs-symbol),
.immersive-content :deep(.hljs-bullet) {
  color: #6897BB;
}

.immersive-content :deep(.hljs-title.function_),
.immersive-content :deep(.hljs-title) {
  color: #FFC66D;
}

.immersive-content :deep(.hljs-meta),
.immersive-content :deep(.hljs-doctag) {
  color: #BBB529;
}

.immersive-content :deep(.hljs-title.class_),
.immersive-content :deep(.hljs-title.class_.inherited__),
.immersive-content :deep(.hljs-type),
.immersive-content :deep(.hljs-section),
.immersive-content :deep(.hljs-name),
.immersive-content :deep(.hljs-selector-class) {
  color: #A9B7C6;
}

.immersive-content :deep(.hljs-attr),
.immersive-content :deep(.hljs-attribute),
.immersive-content :deep(.hljs-property) {
  color: #9876AA;
}

.immersive-content :deep(.hljs-variable),
.immersive-content :deep(.hljs-params),
.immersive-content :deep(.hljs-built_in) {
  color: #A9B7C6;
}

.immersive-content :deep(.hljs-tag) {
  color: #E8BF6A;
}

.immersive-content :deep(.hljs-selector-id) {
  color: #FFC66D;
}

.immersive-content :deep(.hljs-selector-pseudo) {
  color: #CC7832;
}

.immersive-content :deep(.hljs-strong) {
  font-weight: bold;
}

.immersive-content :deep(.hljs-emphasis) {
  font-style: italic;
}

/* 空状态 */
.immersive-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 0;
  color: #8b7355;
}

.immersive-empty svg {
  margin-bottom: 16px;
  opacity: 0.5;
}

/* 回到顶部 */
.back-to-top {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1.5px solid #c9a96e;
  background: rgba(255, 252, 245, 0.9);
  color: #8b7355;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.3s ease;
  z-index: 50;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.back-to-top.visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.back-to-top:hover {
  background: #c9a96e;
  color: #fff;
  border-color: #c9a96e;
}

/* ========== 移动端适配 ========== */
@media (max-width: 768px) {
  .immersive-container {
    max-width: 100%;
    margin: 72px 12px 0;
    padding: 40px 24px;
    border-radius: 4px;
  }

  .immersive-title {
    font-size: 1.5rem;
  }

  .immersive-content {
    font-size: 1rem;
    line-height: 1.9;
  }

  .immersive-content :deep(h1) { font-size: 1.4rem; }
  .immersive-content :deep(h2) { font-size: 1.25rem; }
  .immersive-content :deep(h3) { font-size: 1.1rem; }

  .immersive-content :deep(p) {
    font-size: 0.95rem;
    text-indent: 1.5em;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  .immersive-content :deep(.code-body code) {
    font-size: 0.8rem;
    padding: 12px 14px;
  }

  .back-to-top {
    bottom: 20px;
    right: 16px;
    width: 38px;
    height: 38px;
  }
}

@media (max-width: 480px) {
  .immersive-container {
    margin: 64px 8px 0;
    padding: 32px 16px;
  }

  .immersive-title {
    font-size: 1.35rem;
  }

  .immersive-desc {
    font-size: 0.9rem;
  }

  .immersive-content {
    font-size: 0.95rem;
  }

  .immersive-content :deep(p) {
    font-size: 0.9rem;
    text-indent: 1.2em;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  .immersive-content :deep(.code-body code) {
    font-size: 0.75rem;
    padding: 10px 12px;
  }

  .immersive-content :deep(img) {
    border-radius: 4px;
    margin: 20px auto;
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
  -webkit-user-drag: none;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 768px) {
  .image-viewer-close {
    top: 12px;
    right: 12px;
    width: 38px;
    height: 38px;
  }

  .image-viewer-toolbar {
    bottom: 20px;
    gap: 8px;
    padding: 6px 12px;
  }

  .image-viewer-btn {
    width: 36px;
    height: 36px;
  }

  .image-viewer-container {
    max-width: 96vw;
    max-height: 80vh;
  }

  .image-viewer-img {
    max-width: 96vw;
    max-height: 80vh;
  }
}
</style>
