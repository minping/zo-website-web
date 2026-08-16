<template>
  <div class="note-reader">
    <!-- 背景效果 -->
    <div class="bg-grid"></div>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>

    <!-- 主体 -->
    <main class="reader-main">
      <div class="container">
        <!-- 加载中 -->
        <div v-if="loading" class="reader-state">
          <div class="loading-spinner"></div>
          <span>笔记加载中…</span>
        </div>

        <!-- 加载失败 -->
        <div v-else-if="loadError" class="reader-state">
          <p>{{ loadError }}</p>
          <button class="retry-btn" @click="loadAll">重新加载</button>
        </div>

        <!-- 内容：左侧目录 + 右侧正文（只读预览） -->
        <div v-else class="reader-panel">
          <!-- 左侧目录 -->
          <aside class="reader-toc">
            <div class="toc-title">章节目录</div>
            <ul class="toc-list">
              <li
                class="toc-item"
                :class="{ active: currentIndex === -1 }"
                @click="selectChapter(-1)"
                title="序言"
              >
                <span class="toc-index">00</span>
                <span class="toc-name">序言</span>
              </li>
              <li
                v-for="(chapter, index) in chapters"
                :key="chapter.id"
                class="toc-item"
                :class="{ active: currentIndex === index }"
                @click="selectChapter(index)"
                :title="chapter.title"
              >
                <span class="toc-index">{{ String(index + 1).padStart(2, '0') }}</span>
                <span class="toc-name">{{ chapter.title }}</span>
              </li>
            </ul>
            <p v-if="!chapters.length" class="toc-empty">暂无章节</p>
          </aside>

          <!-- 右侧正文 -->
          <section class="reader-content">
            <!-- 序言 -->
            <div v-if="currentIndex === -1" class="page-body">
              <div class="page-header">
                <span class="page-label">序言</span>
                <h2 class="page-title">{{ noteName || '未命名笔记' }}</h2>
              </div>
              <div class="md-body" v-html="renderedPreface"></div>
              <p v-if="!notePreface" class="md-empty">暂无序言内容</p>
            </div>

            <!-- 章节 -->
            <div v-else class="page-body">
              <div class="page-header">
                <span class="page-label">第 {{ currentIndex + 1 }} 章</span>
                <h2 class="page-title">{{ currentChapter.title }}</h2>
              </div>
              <div class="md-body" v-html="renderedContent"></div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import hljs from 'highlight.js'
import api from '../api/article.js'
import { useTheme } from '../composables/useTheme.js'

// 接入网站主题体系（服务端主题 + 全局切换），与其他页面保持一致
useTheme()

const route = useRoute()

// 支持 /notes/:id 或 /notes?id=xxx 两种进入方式
const noteId = route.params.id || route.query.id || ''

// 自定义 marked 渲染器：标题生成锚点 id + 代码块高亮
const renderer = new marked.Renderer()

renderer.heading = function ({ text, depth }) {
  const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-')
  return `<h${depth} id="${id}">${text}</h${depth}>`
}

renderer.code = function ({ text, lang }) {
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
        <span class="code-lang">${langLabel}</span>
      </div>
      <div class="code-body">
        <pre><code class="language-${language} hljs">${highlightedCode}</code></pre>
      </div>
    </div>
  `
}

const renderMarkdown = (text) => (text ? marked.parse(text, { renderer }) : '')

const loading = ref(false)
const loadError = ref('')
const noteName = ref('')
const noteAuthor = ref('')
const notePreface = ref('')
const chapters = ref([])
// -1 表示序言（默认）
const currentIndex = ref(-1)

const currentChapter = computed(() => chapters.value[currentIndex.value] || {})
const renderedPreface = computed(() => renderMarkdown(notePreface.value))
const renderedContent = computed(() => renderMarkdown(currentChapter.value.content))

// 切换章节（只读，无保存逻辑）
const selectChapter = (index) => {
  if (index === currentIndex.value) return
  currentIndex.value = index
}

// 并行加载笔记详情 + 章节列表
const loadAll = async () => {
  if (!noteId) {
    loadError.value = '缺少笔记参数'
    return
  }
  loading.value = true
  loadError.value = ''
  try {
    const [detailRes, chapterRes] = await Promise.all([
      api.getPublicNoteDetail(noteId),
      api.getPublicChapterList(noteId)
    ])
    const detailData = detailRes.data
    if (detailData) {
      noteName.value = detailData.name || ''
      noteAuthor.value = detailData.author || ''
      notePreface.value = detailData.preface || ''
    }
    chapters.value = chapterRes.data || []
  } catch (e) {
    console.error('加载笔记失败', e)
    loadError.value = '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)
</script>

<style scoped>
.note-reader {
  min-height: 100vh;
  position: relative;
  overflow-x: clip;
}

/* ========== 背景效果 ========== */
.bg-grid {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(var(--border-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-color) 1px, transparent 1px);
  background-size: 60px 60px;
  opacity: 0.25;
  pointer-events: none;
  z-index: 0;
}

.bg-glow {
  position: fixed;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.15;
  pointer-events: none;
  z-index: 0;
}

.bg-glow-1 {
  width: 500px;
  height: 500px;
  background: var(--accent-primary);
  top: -100px;
  right: -100px;
}

.bg-glow-2 {
  width: 400px;
  height: 400px;
  background: var(--accent-secondary);
  bottom: -80px;
  left: -80px;
}

.reader-main {
  position: relative;
  z-index: 1;
  padding: 56px 0 80px;
}

/* ========== 加载 / 错误状态 ========== */
.reader-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 100px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  color: var(--text-muted);
}

.reader-state p {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  padding: 8px 22px;
  border: 1px solid var(--accent-primary);
  border-radius: 8px;
  background: transparent;
  color: var(--accent-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.25s;
}

.retry-btn:hover {
  background: var(--accent-glow);
}

/* ========== 阅读面板 ========== */
.reader-panel {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* ---------- 左侧目录 ---------- */
.reader-toc {
  flex-shrink: 0;
  width: 240px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 24px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
}

.toc-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--text-muted);
  padding: 0 10px 14px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 10px;
}

.toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.toc-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.toc-item:hover {
  background: var(--accent-glow);
  color: var(--text-primary);
}

.toc-item.active {
  background: var(--accent-glow);
  color: var(--accent-primary);
  font-weight: 600;
}

.toc-index {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
  font-family: 'Consolas', 'Courier New', monospace;
  color: var(--accent-primary);
  opacity: 0.85;
}

.toc-name {
  min-width: 0;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toc-empty {
  margin: 14px 10px 0;
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
}

/* ---------- 右侧正文 ---------- */
.reader-content {
  flex: 1;
  min-width: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 44px 56px;
  overflow: hidden;
}

.page-header {
  padding-bottom: 18px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 26px;
}

.page-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--accent-primary);
  text-transform: uppercase;
}

.page-title {
  margin: 8px 0 0;
  font-size: 26px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--text-primary);
}

.md-empty {
  margin: 0;
  padding: 30px 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}

/* ========== Markdown 正文样式 ========== */
.md-body {
  font-size: 15px;
  line-height: 1.85;
  color: var(--text-primary);
  word-break: break-word;
}

.md-body :deep(h1),
.md-body :deep(h2),
.md-body :deep(h3),
.md-body :deep(h4) {
  margin: 1.4em 0 0.7em;
  line-height: 1.4;
  color: var(--text-primary);
  scroll-margin-top: 90px;
}

.md-body :deep(h1) { font-size: 24px; }
.md-body :deep(h2) { font-size: 20px; }
.md-body :deep(h3) { font-size: 17px; }
.md-body :deep(h4) { font-size: 15px; }

.md-body :deep(p) {
  margin: 0.9em 0;
}

.md-body :deep(ul),
.md-body :deep(ol) {
  margin: 0.9em 0;
  padding-left: 1.7em;
}

.md-body :deep(li) {
  margin: 0.35em 0;
}

.md-body :deep(a) {
  color: var(--accent-primary);
  text-decoration: none;
  border-bottom: 1px solid var(--accent-glow);
}

.md-body :deep(a):hover {
  text-decoration: underline;
}

.md-body :deep(blockquote) {
  margin: 1em 0;
  padding: 8px 18px;
  border-left: 3px solid var(--accent-primary);
  background: var(--accent-glow);
  color: var(--text-secondary);
  border-radius: 0 10px 10px 0;
}

.md-body :deep(img) {
  max-width: 100%;
  border-radius: 10px;
}

.md-body :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 1.8em 0;
}

.md-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  font-size: 14px;
}

.md-body :deep(th),
.md-body :deep(td) {
  padding: 9px 14px;
  border: 1px solid var(--border-color);
  text-align: left;
}

.md-body :deep(th) {
  background: var(--bg-secondary);
  font-weight: 600;
}

/* 行内代码 */
.md-body :deep(code:not(.hljs)) {
  padding: 2px 6px;
  border-radius: 5px;
  background: var(--bg-secondary);
  color: var(--accent-primary);
  font-size: 13px;
  font-family: 'Consolas', 'Courier New', monospace;
}

/* 代码块 */
.md-body :deep(.code-block) {
  margin: 1.2em 0;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
  background: var(--bg-secondary);
}

.md-body :deep(.code-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.md-body :deep(.code-lang) {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--text-muted);
}

.md-body :deep(.code-body) {
  overflow-x: auto;
}

.md-body :deep(.code-body pre) {
  margin: 0;
  padding: 14px 16px;
  background: transparent;
}

.md-body :deep(.code-body code) {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.7;
}

/* highlight.js 代码高亮（兼容暗色/亮色主题） */
.md-body :deep(.hljs) {
  background: transparent !important;
  color: var(--text-primary);
}

.md-body :deep(.hljs-keyword),
.md-body :deep(.hljs-selector-tag),
.md-body :deep(.hljs-literal) {
  color: var(--accent-primary);
  font-weight: bold;
}

.md-body :deep(.hljs-string),
.md-body :deep(.hljs-regexp),
.md-body :deep(.hljs-addition) {
  color: var(--accent-secondary);
}

.md-body :deep(.hljs-comment),
.md-body :deep(.hljs-quote) {
  color: var(--text-muted);
  font-style: italic;
}

.md-body :deep(.hljs-number),
.md-body :deep(.hljs-link),
.md-body :deep(.hljs-symbol) {
  color: var(--accent-primary);
}

.md-body :deep(.hljs-title),
.md-body :deep(.hljs-title.function_),
.md-body :deep(.hljs-section) {
  color: var(--accent-secondary);
  font-weight: 600;
}

.md-body :deep(.hljs-type),
.md-body :deep(.hljs-name),
.md-body :deep(.hljs-attr) {
  color: var(--text-primary);
}

/* ========== 响应式 ========== */
@media (max-width: 900px) {
  .reader-panel {
    flex-direction: column;
    align-items: stretch;
  }

  .reader-toc {
    width: 100%;
    position: static;
    max-height: none;
    padding: 16px 12px;
  }

  .reader-content {
    width: 100%;
  }

  .toc-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .toc-item {
    width: 100%;
    border: 1px solid var(--border-color);
    border-radius: 999px;
  }

  /* 允许章节标题换行显示完整内容 */
  .toc-name {
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
  }

  .reader-content {
    padding: 32px 24px;
  }

  /* 表格在移动端横向滚动 */
  .md-body :deep(table) {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}

/* ========== 小屏（手机） ========== */
@media (max-width: 600px) {
  .reader-main {
    padding: 32px 0 56px;
  }

  .reader-toc {
    padding: 14px 10px;
  }

  .toc-title {
    padding: 0 8px 10px;
    margin-bottom: 8px;
  }

  .toc-item {
    padding: 7px 10px;
    font-size: 13px;
  }

  .reader-content {
    padding: 24px 16px;
  }

  .page-title {
    font-size: 22px;
  }

  .md-body {
    font-size: 14px;
    line-height: 1.8;
  }

  .md-body :deep(h1) { font-size: 21px; }
  .md-body :deep(h2) { font-size: 18px; }
  .md-body :deep(h3) { font-size: 16px; }

  .md-body :deep(.code-block) {
    margin: 1em -8px;
    border-radius: 8px;
  }

  .md-body :deep(.code-body code) {
    font-size: 12px;
  }

  .md-body :deep(blockquote) {
    padding: 6px 14px;
  }
}
</style>
