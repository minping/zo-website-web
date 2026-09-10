<template>
  <div class="note-reader" @click="handleImageClick">
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

        <!-- 加载成功 -->
        <template v-else>
          <!-- 内容：左侧目录 + 右侧正文（只读预览） -->
          <div class="reader-panel">
            <!-- 左侧目录 -->
            <aside class="reader-toc">
              <!-- 笔记名称 -->
              <div class="toc-note-title">
                <h1 class="toc-note-name">{{ noteName || '未命名笔记' }}</h1>
              </div>
              <div class="toc-title">章节目录</div>
              <ul class="toc-list">
                <li
                  class="toc-item"
                  :class="{ active: currentIndex === -1 }"
                  @click="selectChapter(-1)"
                  title="序言"
                >
                  <span class="toc-name">序言</span>
                </li>
                <li
                  v-for="chapter in visibleChapters"
                  :key="chapter.id"
                  class="toc-item"
                  :class="[
                    'toc-level-' + chapter.level,
                    { active: currentIndex === chapter.rawIndex, expanded: expandedIds.has(chapter.id) }
                  ]"
                  @click="onTocClick(chapter)"
                  :title="chapter.title"
                >
                  <span class="toc-index">{{ chapter.label }}</span>
                  <span class="toc-name">{{ chapter.title }}</span>
                  <span
                    v-if="chapter.level === 0 && chapter.children && chapter.children.length"
                    class="toc-toggle-icon"
                  >▸</span>
                </li>
              </ul>
              <p v-if="!chapters.length" class="toc-empty">暂无章节</p>
            </aside>

            <!-- 右侧内容列：正文与打卡学习各自独立卡片 -->
            <div class="reader-main-col">
              <!-- 正文卡片 -->
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
                    <span class="page-label">{{ currentChapter.label }}</span>
                    <h2 class="page-title">{{ currentChapter.title }}</h2>
                  </div>
                  <div class="md-body" v-html="renderedContent"></div>
                </div>
              </section>

              <!-- 打卡学习（独立卡片，仅二级小节展示） -->
              <section v-if="showCheckin" class="checkin-wrap">
                <div class="checkin-head">
                  <div class="checkin-title">打卡学习</div>
                  <span class="checkin-sub">{{ studyStats.totalStatus ? '该小节今日已打卡' : '今日还未打卡' }}</span>
                </div>

                <div class="checkin-panel">
                  <button
                    ref="checkinBtnEl"
                    class="checkin-btn"
                    :class="{ 'checkin-done': studyStats.totalStatus }"
                    :disabled="checkinLock || studyStats.totalStatus"
                    @click="handleCheckin"
                  >
                    <template v-if="!studyStats.totalStatus">
                      <span class="checkin-btn-label">本次学习时长</span>
                      <span class="checkin-btn-time">{{ sessionClock }}</span>
                      <span class="checkin-btn-tip">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        点击打卡
                      </span>
                    </template>
                    <template v-else>
                      <svg class="checkin-done-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      <span class="checkin-btn-done-text">今日已打卡</span>
                    </template>
                  </button>
                </div>

                <div class="checkin-stats">
                  <div class="checkin-stat">
                    <span class="checkin-stat-num">{{ studyStats.totalCount }}</span>
                    <span class="checkin-stat-label">累计打卡</span>
                  </div>
                  <div class="checkin-stat">
                    <span class="checkin-stat-time">{{ studyStats.totalTiming }}</span>
                    <span class="checkin-stat-label">累计学习时长</span>
                  </div>
                  <div class="checkin-stat">
                    <span class="checkin-stat-num">{{ studyStats.todayCount }}</span>
                    <span class="checkin-stat-label">今日打卡</span>
                  </div>
                </div>

                <div class="checkin-history">
                  <div class="checkin-history-head">
                    <span class="checkin-history-title">历史学习记录</span>
                    <span v-if="studyRecords.length" class="checkin-history-count">共 {{ studyRecords.length }} 条</span>
                  </div>
                  <p v-if="studyRecordsLoading" class="checkin-empty">历史记录加载中…</p>
                  <div v-else-if="studyRecords.length" class="checkin-list">
                    <div v-for="r in studyRecords" :key="r.id" class="checkin-item">
                      <div class="checkin-item-main">
                        <span class="checkin-item-date">{{ r.date }}</span>
                      </div>
                      <span class="checkin-item-duration">{{ formatDuration(r.sec) }}</span>
                    </div>
                  </div>
                  <p v-else class="checkin-empty">还没有打卡记录，读完内容后点一下「打卡」吧～</p>
                </div>

                <!-- 打卡成功礼花（fixed 层，定位到按钮中心） -->
                <div ref="burstRoot" class="confetti-burst"></div>
              </section>
            </div>
          </div>
        </template>
      </div>
    </main>

    <!-- 回到顶部 -->
    <transition name="fade">
      <button
        v-show="showBackTop"
        class="back-to-top"
        title="回到顶部"
        @click="scrollToTop"
      >
        <span class="back-to-top-icon">↑</span>
      </button>
    </transition>

    <!-- 打卡成功提示 -->
    <transition name="toast-pop">
      <div v-if="checkinToast" class="checkin-toast">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        {{ checkinToast }}
      </div>
    </transition>

    <!-- 图片查看器（点击正文图片预览） -->
    <Teleport to="body">
      <transition name="fade">
        <div
          v-if="showImageViewer"
          class="image-viewer-overlay"
          @click.self="closeImageViewer"
        >
          <button class="image-viewer-close" title="关闭" @click="closeImageViewer">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6L6 18"/>
              <path d="M6 6l12 12"/>
            </svg>
          </button>
          <div
            class="image-viewer-container"
            :style="{ transform: `scale(${imageScale})` }"
            @wheel.prevent="handleImageWheel"
          >
            <img
              :src="currentImageSrc"
              :alt="currentImageAlt"
              class="image-viewer-img"
              draggable="false"
            />
          </div>
          <div class="image-viewer-toolbar">
            <button class="image-viewer-btn" title="缩小" @click="zoomOut">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/>
              </svg>
            </button>
            <button class="image-viewer-btn" title="原始大小" @click="resetZoom">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              </svg>
            </button>
            <button class="image-viewer-btn" title="放大" @click="zoomIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14"/>
                <path d="M5 12h14"/>
              </svg>
            </button>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

// 将树形章节拍平为目录列表（支持二级：一级「第 X 章」，二级「X.Y」）
const flatChapters = computed(() => {
  const result = []
  const walk = (items, level, parentNum) => {
    items.forEach((item, i) => {
      const num = i + 1
      const label = level === 0 ? `第 ${num} 章` : `${parentNum}.${num}`
      result.push({ ...item, level, label })
      if (Array.isArray(item.children) && item.children.length) {
        walk(item.children, level + 1, level === 0 ? num : parentNum)
      }
    })
  }
  walk(chapters.value, 0, 0)
  return result
})

// 已展开小节的一级章节 id 集合（默认全部折叠，不显示小节）
const expandedIds = ref(new Set())

// 目录可见项：一级全部显示；二级仅当父级展开时显示（rawIndex 为 flatChapters 真实索引）
const visibleChapters = computed(() => {
  const result = []
  flatChapters.value.forEach((item, rawIndex) => {
    if (item.level === 0 || (item.level === 1 && expandedIds.value.has(item.pid))) {
      result.push({ ...item, rawIndex })
    }
  })
  return result
})

const toggleExpand = (id) => {
  const next = new Set(expandedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedIds.value = next
}

// 点击目录项：一级切换内容并展开/收起小节；二级仅切换内容
const onTocClick = (chapter) => {
  if (chapter.level === 0) {
    const willCollapse = expandedIds.value.has(chapter.id)
    toggleExpand(chapter.id)
    if (willCollapse) {
      // 收起时若当前内容是该章下的小节，则回到该章
      const cur = flatChapters.value[currentIndex.value]
      if (cur && cur.level >= 1 && cur.pid === chapter.id) {
        selectChapter(chapter.rawIndex)
        return
      }
    }
  }
  selectChapter(chapter.rawIndex)
}

const currentChapter = computed(() => flatChapters.value[currentIndex.value] || {})
const renderedPreface = computed(() => renderMarkdown(notePreface.value))
const renderedContent = computed(() => renderMarkdown(currentChapter.value.content))

// 切换章节（只读，无保存逻辑）
// 打卡针对二级小节统计：每次切换到二级小节都重置本次学习计时
const selectChapter = (index) => {
  if (index === currentIndex.value) return
  currentIndex.value = index
  const target = flatChapters.value[index]
  if (target && target.level === 1) {
    sessionStartAt.value = Date.now()
    elapsedSec.value = 0
    // 切换到二级小节：重置计时并加载该小节的历史打卡记录
    loadStudyRecords(String(target.id ?? ''))
  }
}

// ========== 回到顶部 ==========
const showBackTop = ref(false)

const onScroll = () => {
  // 页面滚动超过 300px 时显示按钮（兼容 window 与滚动容器）
  const scroller = document.scrollingElement || document.documentElement
  showBackTop.value = scroller.scrollTop > 300
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ========== 图片查看器 ==========
const showImageViewer = ref(false)
const currentImageSrc = ref('')
const currentImageAlt = ref('')
const imageScale = ref(1)

const ZOOM_STEP = 0.25
const MAX_SCALE = 4
const MIN_SCALE = 0.5

const handleImageClick = (e) => {
  // 仅响应正文（.md-body）内的图片点击
  const img = e.target.closest('img')
  if (!img || !e.target.closest('.md-body')) return
  currentImageSrc.value = img.currentSrc || img.src
  currentImageAlt.value = img.alt || ''
  imageScale.value = 1
  showImageViewer.value = true
}

const closeImageViewer = () => {
  showImageViewer.value = false
  imageScale.value = 1
}

const zoomIn = () => {
  imageScale.value = Math.min(MAX_SCALE, imageScale.value + ZOOM_STEP)
}

const zoomOut = () => {
  imageScale.value = Math.max(MIN_SCALE, imageScale.value - ZOOM_STEP)
}

const resetZoom = () => {
  imageScale.value = 1
}

const handleImageWheel = (e) => {
  const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP
  imageScale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, imageScale.value + delta))
}

const handleKeyDown = (e) => {
  if (e.key === 'Escape') {
    closeImageViewer()
  }
}

// ========== 打卡学习 ==========
// 打卡功能仅在阅读二级小节时展示（currentChapter.level === 1）
const showCheckin = computed(() => currentChapter.value.level === 1)
// 当前小节的打卡历史（来自后端 queryStudyRecord.history，按学习时间倒序）
const studyRecords = ref([])
const studyRecordsLoading = ref(false)
// 后端字段：todayCount 今日打卡数、totalCount 累计打卡、totalTiming 累计学习时长(HH:mm:ss)、
// totalStatus 该小节今日是否已打卡（true 后不可再打卡）
const studyStats = ref({ todayCount: 0, totalCount: 0, totalTiming: '00:00:00', totalStatus: false })
const sessionStartAt = ref(Date.now())
const elapsedSec = ref(0)
const checkinLock = ref(false)
const checkinToast = ref('')
let checkinRequestSeq = 0
let checkinTimer = null
let checkinToastTimer = null
// 圆形打卡按钮与礼花覆盖层（fixed 定位到按钮中心）
const checkinBtnEl = ref(null)
const burstRoot = ref(null)
const CONFETTI_COLORS = ['#f43f5e', '#f97316', '#facc15', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899', '#fb7185']

const pad2 = (n) => String(n).padStart(2, '0')

// 历史记录时长展示（如：45秒 / 12分 / 1小时20分）
const formatDuration = (sec) => {
  const s = Math.max(1, Math.floor(Number(sec) || 0))
  if (s < 60) return `${s}秒`
  const m = Math.floor(s / 60)
  const rest = s % 60
  if (m < 60) return rest ? `${m}分${rest}秒` : `${m}分钟`
  const h = Math.floor(m / 60)
  const mm = m % 60
  return mm ? `${h}小时${mm}分` : `${h}小时`
}

// 本次学习实时计时（HH:MM:SS）
const sessionClock = computed(() => {
  const s = elapsedSec.value
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${pad2(h)}:${pad2(m)}:${pad2(sec)}`
})

// 加载当前小节历史记录与后端统计字段
const loadStudyRecords = async (relationId) => {
  if (!relationId) {
    studyRecords.value = []
    studyRecordsLoading.value = false
    return
  }
  const seq = ++checkinRequestSeq
  studyRecordsLoading.value = true
  try {
    const res = await api.queryStudyRecord(relationId)
    if (seq !== checkinRequestSeq) return // 忽略切换小节后迟到的旧响应
    const ok = !!(res && (res.success === true || res.code === 200 || res.code === 0))
    const data = ok && res.data && typeof res.data === 'object' ? res.data : {}
    const list = Array.isArray(data.history) ? data.history : []
    studyRecords.value = list
      .filter((item) => item.study_time)
      .map((item, i) => ({
        id: `${relationId}-${item.study_time}-${i}`,
        date: item.study_time,
        sec: Number(item.timing) || 0
      }))
    studyStats.value = {
      todayCount: Number(data.todayCount) || 0,
      totalCount: Number(data.totalCount) || 0,
      totalTiming: typeof data.totalTiming === 'string' && data.totalTiming ? data.totalTiming : '00:00:00',
      totalStatus: data.totalStatus === true
    }
  } catch (e) {
    console.error('查询打卡历史失败', e)
    if (seq === checkinRequestSeq) studyRecords.value = []
  } finally {
    if (seq === checkinRequestSeq) studyRecordsLoading.value = false
  }
}

const showCheckinToast = (msg) => {
  checkinToast.value = msg
  clearTimeout(checkinToastTimer)
  checkinToastTimer = setTimeout(() => {
    checkinToast.value = ''
  }, 3000)
}

// 打卡成功彩带礼花：在按钮圆心一次性绽放粒子
const triggerConfetti = () => {
  const btn = checkinBtnEl.value
  const root = burstRoot.value
  if (!btn || !root) return
  const rect = btn.getBoundingClientRect()
  root.style.left = `${rect.left + rect.width / 2}px`
  root.style.top = `${rect.top + rect.height / 2}px`
  root.innerHTML = ''
  const fragment = document.createDocumentFragment()
  for (let i = 0; i < 90; i++) {
    const piece = document.createElement('span')
    piece.className = 'confetti-piece'
    const angle = Math.random() * Math.PI * 2
    const dist = 70 + Math.random() * 170
    piece.style.setProperty('--dx', `${Math.cos(angle) * dist}px`)
    piece.style.setProperty('--dy', `${Math.sin(angle) * dist - 35}px`)
    piece.style.setProperty('--rot', `${Math.round(Math.random() * 720 - 360)}deg`)
    piece.style.setProperty('--d', `${0.5 + Math.random() * 0.5}s`)
    piece.style.width = `${6 + Math.random() * 6}px`
    piece.style.height = `${5 + Math.random() * 7}px`
    piece.style.borderRadius = Math.random() > 0.55 ? '50%' : '2px'
    piece.style.background = CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0]
    fragment.appendChild(piece)
  }
  root.appendChild(fragment)
  setTimeout(() => {
    if (burstRoot.value) burstRoot.value.innerHTML = ''
  }, 1800)
}

const handleCheckin = async () => {
  if (checkinLock.value || studyStats.value.totalStatus) return
  checkinLock.value = true
  const now = Date.now()
  const sec = Math.max(1, Math.round((now - sessionStartAt.value) / 1000))
  // 当前所在二级小节的 id，作为关联对象
  const relationId = currentChapter.value.id

  // 1. 学习记录通过后端接口持久化
  let ok = false
  try {
    const res = await api.saveStudyRecord({
      relationId: String(relationId ?? ''),
      timing: String(sec),
      relationTypeText: '笔记',
      relationTypeValue: '2'
    })
    ok = !!(res && (res.success === true || res.code === 200 || res.code === 0))
  } catch (e) {
    console.error('保存打卡记录失败', e)
  }

  if (!ok) {
    showCheckinToast('保存失败，请稍后重试')
    setTimeout(() => {
      checkinLock.value = false
    }, 1000)
    return
  }

  // 2. 打卡成功：重新拉取历史记录，并开启新一轮计时
  sessionStartAt.value = now
  elapsedSec.value = 0
  showCheckinToast(`打卡成功，本次学习 ${formatDuration(sec)}`)
  triggerConfetti()
  loadStudyRecords(String(relationId ?? ''))
  setTimeout(() => {
    checkinLock.value = false
  }, 1000)
}

const startCheckinTimer = () => {
  if (checkinTimer) clearInterval(checkinTimer)
  checkinTimer = setInterval(() => {
    elapsedSec.value = Math.max(0, Math.round((Date.now() - sessionStartAt.value) / 1000))
  }, 1000)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', handleKeyDown)
  onScroll()
  startCheckinTimer()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', handleKeyDown)
  clearInterval(checkinTimer)
  clearTimeout(checkinToastTimer)
})

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

/* 右侧内容列：正文卡片与打卡卡片上下独立排布 */
.reader-main-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
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

/* 目录顶部：笔记名称 */
.toc-note-title {
  padding: 0 10px 16px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 12px;
}

.toc-note-name {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--text-primary);
  letter-spacing: 1px;
}

.toc-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--text-muted);
  padding: 0 10px 14px;
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

/* 展开箭头（仅一级且有子级时显示） */
.toc-toggle-icon {
  margin-left: auto;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  font-size: 10px;
  line-height: 1;
  color: var(--text-muted);
  transition: transform 0.2s ease;
}

.toc-item.expanded > .toc-toggle-icon {
  transform: rotate(90deg);
}

/* 二级目录缩进 */
.toc-item.toc-level-1 {
  padding-left: 26px;
}

.toc-item.toc-level-1 .toc-name {
  font-size: 13px;
}

.toc-item.toc-level-1 .toc-index {
  font-size: 11px;
  opacity: 0.7;
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
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 26px;
}

.page-label {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--accent-primary);
  text-transform: uppercase;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--text-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  line-height: 1.7;
  color: var(--text-primary);
  font-family: 'KaiTi', '楷体', 'STKaiti', '华文楷体', serif;
  word-break: break-word;
}

/* 所有标题（不管几级）统一样式：仅比正文稍大 */
.md-body :deep(h1),
.md-body :deep(h2),
.md-body :deep(h3),
.md-body :deep(h4),
.md-body :deep(h5),
.md-body :deep(h6) {
  margin: 1.4em 0 0.7em;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--text-primary);
  scroll-margin-top: 90px;
}

.md-body :deep(p) {
  margin: 0.7em 0;
  text-indent: 2em;
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

/* 图片一律独占一行：即使图片再小，前后也不与文字同行 */
.md-body :deep(img) {
  display: block;
  max-width: 100%;
  margin: 0.7em auto;
  border-radius: 10px;
  cursor: zoom-in;
  transition: box-shadow 0.2s ease;
}

.md-body :deep(img):hover {
  box-shadow: 0 4px 20px -6px rgba(0, 0, 0, 0.25);
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
    border: none;
    box-shadow: none;
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
    border: none;
    border-radius: 8px;
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
    font-size: 18px;
  }

  .md-body {
    font-size: 14px;
    line-height: 1.65;
  }

  .md-body :deep(h1),
  .md-body :deep(h2),
  .md-body :deep(h3),
  .md-body :deep(h4),
  .md-body :deep(h5),
  .md-body :deep(h6) {
    font-size: 16px;
  }

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

/* ========== 回到顶部按钮 ========== */
.back-to-top {
  position: fixed;
  right: 24px;
  bottom: 32px;
  z-index: 100;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.25s ease;
}

.back-to-top:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.24);
}

.back-to-top:active {
  transform: translateY(0);
}

.back-to-top-icon {
  font-size: 20px;
  line-height: 1;
}

/* 淡入淡出过渡 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .back-to-top {
    right: 16px;
    bottom: 24px;
    width: 38px;
    height: 38px;
  }

  .back-to-top-icon {
    font-size: 18px;
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

/* ========== 打卡学习（独立卡片，与正文卡片分离） ========== */
.checkin-wrap {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 28px 32px;
}

.checkin-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.checkin-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
}

.checkin-title::before {
  content: '';
  width: 5px;
  height: 16px;
  border-radius: 3px;
  background: linear-gradient(180deg, var(--accent-primary), var(--accent-secondary));
}

.checkin-sub {
  font-size: 12px;
  color: var(--text-muted);
}

.checkin-panel {
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 26px 24px;
}

/* 圆形打卡按钮：内部集成本次学习主计时器 */
.checkin-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 148px;
  height: 148px;
  padding: 0;
  border: none;
  border-radius: 50%;
  color: #fff;
  background:
    radial-gradient(circle at 32% 26%, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0) 55%),
    linear-gradient(150deg, var(--accent-primary), var(--accent-secondary));
  box-shadow: 0 10px 24px -8px var(--accent-glow);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.checkin-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 13px 30px -8px var(--accent-glow);
}

.checkin-btn:active:not(:disabled) {
  transform: scale(0.97);
}

.checkin-btn:disabled {
  cursor: not-allowed;
}

.checkin-btn-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.78);
}

.checkin-btn-time {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 27px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 1.5px;
  color: #fff;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
}

.checkin-btn-tip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.92);
}

.checkin-done-icon {
  width: 32px;
  height: 32px;
  color: #fff;
}

.checkin-btn-done-text {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

/* 今日已打卡：置灰呈现不可再次打卡 */
.checkin-btn.checkin-done {
  background:
    radial-gradient(circle at 32% 26%, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0) 55%),
    linear-gradient(150deg, #b7c0ca, #8d98a5);
  box-shadow: 0 10px 24px -8px rgba(0, 0, 0, 0.25);
  cursor: not-allowed;
  transform: none;
}

/* 打卡礼花层（fixed 覆盖，由 JS 定位到按钮中心） */
.confetti-burst {
  position: fixed;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  z-index: 1200;
  pointer-events: none;
}

.confetti-burst :deep(.confetti-piece) {
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  animation: confetti-fly var(--d, 0.8s) ease-out forwards;
}

@keyframes confetti-fly {
  0% {
    opacity: 1;
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(var(--dx, 80px), var(--dy, -120px)) rotate(var(--rot, 360deg)) scale(0.7);
  }
}

.checkin-stats {
  margin-top: 14px;
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  overflow: hidden;
  background: var(--bg-secondary);
}

.checkin-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 16px 0;
  border-right: 1px solid var(--border-color);
}

.checkin-stat:last-child {
  border-right: none;
}

.checkin-stat-num,
.checkin-stat-time {
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  color: var(--accent-primary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.checkin-stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

.checkin-history {
  margin-top: 24px;
}

.checkin-history-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.checkin-history-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.checkin-history-count {
  font-size: 12px;
  color: var(--text-muted);
}

.checkin-list {
  display: flex;
  flex-direction: column;
  max-height: 320px;
  overflow-y: auto;
}

.checkin-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 11px 12px;
  border-radius: 10px;
  transition: background 0.2s ease;
}

.checkin-item:hover {
  background: var(--accent-glow);
}

.checkin-item-main {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.checkin-item-date {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.checkin-item-chapter {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}

.checkin-item-duration {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-primary);
  font-variant-numeric: tabular-nums;
}

.checkin-empty {
  margin: 0;
  padding: 16px 0;
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
}

/* 打卡成功提示气泡 */
.checkin-toast {
  position: fixed;
  left: 50%;
  bottom: 84px;
  transform: translateX(-50%);
  z-index: 200;
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: calc(100vw - 40px);
  padding: 11px 22px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.28);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toast-pop-enter-active,
.toast-pop-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-pop-enter-from,
.toast-pop-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

@media (max-width: 600px) {
  .checkin-wrap {
    padding: 22px 18px;
  }

  .checkin-panel {
    padding: 22px 16px;
  }

  .checkin-btn {
    width: 128px;
    height: 128px;
  }

  .checkin-btn-time {
    font-size: 23px;
  }

  .checkin-stat-num,
  .checkin-stat-time {
    font-size: 18px;
  }
}
</style>
