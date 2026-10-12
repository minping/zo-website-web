<template>
  <div class="random-study-page" @click="handleImageClick">
    <!-- 背景效果 -->
    <div class="bg-grid"></div>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>
    <!-- 主题背景装饰 -->
    <BgScenery />

    <!-- 导航栏 -->
    <Navbar activeMenu="摇一摇" @navigate="handleNavigate" />

    <!-- 页面主体 -->
    <main class="page-main">
      <div class="container">
        <header class="page-header">
          <h1 class="page-title">摇一摇</h1>
          <p class="page-desc"> 看一看, 走过路过不要错过</p>
        </header>

        <!-- 摇一摇主区 -->
        <section class="shake-zone">
          <!-- 学习范围：选择某一篇笔记后，只在该笔记范围内随机抽取 -->
          <div class="scope-bar">
            <span class="scope-label">学习范围</span>
            <div class="scope-select-wrap">
              <select
                v-model="selectedNoteId"
                class="scope-select"
                :disabled="notesLoading || rolling"
                :title="selectedNoteName ? `当前范围：${selectedNoteName}` : '当前范围：全部笔记'"
              >
                <option value="">{{ notesLoading ? '笔记加载中…' : '全部笔记（全库随机）' }}</option>
                <option v-for="n in noteOptions" :key="n.id" :value="n.id">{{ n.name }}</option>
              </select>
              <svg class="scope-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
            <button
              v-if="selectedNoteId"
              class="scope-clear"
              type="button"
              title="清除选择，恢复全库随机"
              @click="clearNoteScope"
            >
              清除
            </button>
          </div>

          <!-- 圆形摇一摇按钮：柔和光晕呼吸 + 图标摇摆 -->
          <button
            ref="shakeBtnEl"
            class="shake-btn"
            :class="{ 'shake-rolling': rolling }"
            :disabled="rolling"
            :title="rolling ? '正在随机挑选中…' : '点我随机抽取一篇学习小节'"
            @click="handleShake"
          >
            <span class="shake-aura" aria-hidden="true"></span>
            <span class="shake-btn-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="5"/>
                <circle cx="8" cy="8" r="1.6" fill="currentColor" stroke="none"/>
                <circle cx="16" cy="8" r="1.6" fill="currentColor" stroke="none"/>
                <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/>
                <circle cx="8" cy="16" r="1.6" fill="currentColor" stroke="none"/>
                <circle cx="16" cy="16" r="1.6" fill="currentColor" stroke="none"/>
              </svg>
            </span>
            <span class="shake-btn-main">{{ rolling ? '挑选中…' : '摇一摇' }}</span>
            <span class="shake-btn-sub">{{ rolling ? '正在为你随机挑一篇' : '随机学习一个知识点' }}</span>
          </button>

          <p class="shake-tip">{{ shakeTip }}</p>

          <!-- 抽取失败提示 -->
          <transition name="shake-fade">
            <p v-if="errorText" class="shake-error">{{ errorText }}</p>
          </transition>

          <!-- 随机结果卡片（样式对齐笔记阅读器正文，无左侧目录） -->
          <transition name="shake-fade">
            <div v-if="result" ref="resultEl" class="result-card">
              <div class="result-meta">
                <span class="result-note">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  <span class="result-note-name">{{ result.name }}</span>
                </span>
              </div>

              <div class="page-header">
                <span class="page-label">本节内容</span>
                <h2 class="page-title">{{ result.title }}</h2>
              </div>

              <!-- 小节正文：斩杀时刀光扫过 + 内容碎裂淡出 -->
              <div class="md-body-wrap" :class="{ 'ban-slash': banAnimating }">
                <div v-if="!banned" class="md-body" v-html="renderedContent"></div>
                <span v-if="banAnimating" class="ban-mark" aria-hidden="true">斩</span>
              </div>

              <!-- 斩杀完成占位 -->
              <div v-if="banned" class="ban-done">
                <svg class="ban-done-icon" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.5 17.5 3 6V3h3l11.5 11.5"/>
                  <path d="M13 19l6-6"/>
                  <path d="M16 16l4 4"/>
                  <path d="M19 21l2-2"/>
                </svg>
                <p class="ban-done-title">本节知识点已被斩杀</p>
                <p class="ban-done-desc">再摇一次，换个知识点继续吧</p>
              </div>

              <!-- 斩杀知识（点击后小节内容与打卡学习区一同隐藏） -->
              <div v-if="result && result.id" class="ban-bar">
                <button
                  class="ban-btn"
                  :class="{ 'ban-btn-done': banned }"
                  :disabled="banLock || banAnimating || banned"
                  :title="banned ? '本节知识点已斩杀' : '斩掉这个知识点'"
                  @click="handleBanKnowledge"
                >
                  <svg class="ban-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M14.5 17.5 3 6V3h3l11.5 11.5"/>
                    <path d="M13 19l6-6"/>
                    <path d="M16 16l4 4"/>
                    <path d="M19 21l2-2"/>
                  </svg>
                  <span class="ban-btn-text">{{ banned ? '已斩杀' : (banLock ? '斩杀中…' : '斩杀知识') }}</span>
                </button>
                <p class="ban-tip">{{ banned ? '这个知识点已被你斩于马下' : '已经掌握了？一键斩掉它' }}</p>
              </div>

              <!-- 学习打卡（从笔记阅读器迁移，针对当前小节，无目录）；斩杀后一并隐藏 -->
              <section v-if="result && result.id && !banned" class="result-checkin">
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
          </transition>
        </section>
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

    <!-- 轻提示 -->
    <transition name="toast-pop">
      <div v-if="toast" class="random-toast">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        {{ toast }}
      </div>
    </transition>

    <!-- 图片查看器（点击正文图片放大预览，与笔记阅读器一致） -->
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
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import Navbar from './Navbar.vue'
import BgScenery from './BgScenery.vue'
import api from '../api/article.js'
import { useTheme } from '../composables/useTheme.js'

// 接入网站主题体系（服务端主题 + 全局切换），与其他页面保持一致
useTheme()

// ========== Markdown 渲染（与笔记阅读器 NoteReader 一致） ==========
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

// ==内容== 高亮语法（Obsidian 风格）：非标准 Markdown，注册行内扩展转成 mark 标签
const highlightMark = {
  name: 'highlightMark',
  level: 'inline',
  start(src) { return src.indexOf('==') },
  tokenizer(src) {
    const match = /^==(?=\S)([\s\S]*?\S)==/.exec(src)
    if (match) {
      return {
        type: 'highlightMark',
        raw: match[0],
        tokens: this.lexer.inlineTokens(match[1])
      }
    }
  },
  renderer(token) {
    return `<mark class="hl-mark">${this.parser.parseInline(token.tokens)}</mark>`
  }
}
marked.use({ extensions: [highlightMark] })

const renderMarkdown = (text) => (text ? marked.parse(text, { renderer }) : '')

const handleNavigate = () => {
  // 预留：后续接入锚点跳转等交互
}

// ========== 摇一摇状态 ==========
const rolling = ref(false)
const errorText = ref('')
const result = ref(null)
const resultEl = ref(null)
const toast = ref('')
let toastTimer = null

// ========== 学习范围（笔记下拉框） ==========
// 选项来自 queryNoteListPublished，显示 name，值为 id；选中后 getRandomContent 传 noteId
const noteOptions = ref([])
const notesLoading = ref(false)
const selectedNoteId = ref('')

const selectedNoteName = computed(() => {
  const hit = noteOptions.value.find((n) => n.id === selectedNoteId.value)
  return hit ? hit.name : ''
})

const shakeTip = computed(() => {
  if (rolling.value) return '已抓住命运的节拍…'
  if (selectedNoteName.value) return `只从《${selectedNoteName.value}》中随机抽取一个小节`
  return '点击按钮，随机抽取笔记中的一个小节'
})

// 加载已发布笔记，作为下拉选项
const loadNoteOptions = async () => {
  notesLoading.value = true
  try {
    const res = await api.getPublishedNotes()
    const ok = !!(res && (res.success === true || res.code === 200 || res.code === 0))
    const list = ok && Array.isArray(res.data) ? res.data : []
    noteOptions.value = list
      .map((n) => ({ id: String(n.id ?? ''), name: n.name || '未命名笔记' }))
      .filter((n) => n.id)
    // 之前选中的笔记若已不存在（被下架），自动回到全库随机
    if (selectedNoteId.value && !noteOptions.value.some((n) => n.id === selectedNoteId.value)) {
      selectedNoteId.value = ''
    }
  } catch (e) {
    console.error('加载笔记列表失败', e)
    noteOptions.value = []
  } finally {
    notesLoading.value = false
  }
}

const clearNoteScope = () => {
  selectedNoteId.value = ''
}

// 斩杀知识：banned 内容已移除、banAnimating 动画播放中、banLock 请求中
const banned = ref(false)
const banAnimating = ref(false)
const banLock = ref(false)
let banTimer = null

const renderedContent = computed(() => renderMarkdown((result.value && result.value.content) || ''))

const showToast = (msg) => {
  clearTimeout(toastTimer)
  toast.value = msg
  toastTimer = setTimeout(() => {
    toast.value = ''
  }, 2600)
}

// 最短摇动时长，保证"摇晃中"动画有足够存在感
const MIN_ROLL_TIME = 900

const handleShake = async () => {
  if (rolling.value) return
  rolling.value = true
  errorText.value = ''
  const startedAt = Date.now()
  try {
    // 指定了学习范围则只在对应笔记内随机（noteId 为空 = 全库随机）
    const res = await api.getRandomNoteContent(selectedNoteId.value)
    const ok = !!(res && (res.success === true || res.code === 200 || res.code === 0))
    if (!ok) throw new Error(res.message || res.msg || '抽取失败，请稍后重试')
    const data = res.data && typeof res.data === 'object' ? res.data : {}
    if (!data.content) {
      throw new Error(selectedNoteName.value
        ? `《${selectedNoteName.value}》暂时没有可学习的小节，换一篇试试吧`
        : '这次抽到的是空内容，再摇一次试试吧')
    }
    result.value = {
      id: data.id ?? '',
      name: data.name || '未命名笔记',
      title: data.title || '未命名小节',
      content: data.content
    }
    // 抽到新小节：重置本次学习计时并加载该小节的打卡统计
    clearTimeout(banTimer)
    banned.value = false
    banAnimating.value = false
    banLock.value = false
    sessionStartAt.value = Date.now()
    elapsedSec.value = 0
    checkinLock.value = false
    studyRecords.value = []
    studyRecordsLoading.value = true
    studyStats.value = { todayCount: 0, totalCount: 0, totalTiming: '00:00:00', totalStatus: false }
    loadStudyRecords(String(data.id ?? ''))
  } catch (err) {
    console.error('随机抽取失败', err)
    errorText.value = (err && err.message) || '网络开小差了，稍后再试'
    showToast(errorText.value)
  } finally {
    const rest = Math.max(0, MIN_ROLL_TIME - (Date.now() - startedAt))
    await new Promise((resolve) => setTimeout(resolve, rest))
    rolling.value = false
    if (result.value) {
      nextTick(() => {
        if (resultEl.value) resultEl.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }
}

// ========== 图片查看器（点击正文图片放大预览，与笔记阅读器 NoteReader 一致） ==========
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

// ========== 学习打卡（从笔记阅读器 NoteReader 迁移） ==========
// 打卡针对随机抽到的二级小节，relationId 为小节 id（后端 getRandomContent 返回的 id）
const studyRecords = ref([])
const studyRecordsLoading = ref(false)
// 后端字段：todayCount 今日打卡数、totalCount 累计打卡、totalTiming 累计学习时长(HH:mm:ss)、
// totalStatus 该小节今日是否已打卡（true 后不可再打卡）
const studyStats = ref({ todayCount: 0, totalCount: 0, totalTiming: '00:00:00', totalStatus: false })
const sessionStartAt = ref(Date.now())
const elapsedSec = ref(0)
const checkinLock = ref(false)
// 圆形打卡按钮与礼花覆盖层（fixed 定位到按钮中心）
const checkinBtnEl = ref(null)
const burstRoot = ref(null)
const CONFETTI_COLORS = ['#f43f5e', '#f97316', '#facc15', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899', '#fb7185']
let checkinRequestSeq = 0
let checkinTimer = null

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
    if (seq !== checkinRequestSeq) return // 忽略摇到新小节后迟到的旧响应
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
  const relationId = result.value && result.value.id ? String(result.value.id) : ''
  if (!relationId || checkinLock.value || studyStats.value.totalStatus) return
  checkinLock.value = true
  const now = Date.now()
  const sec = Math.max(1, Math.round((now - sessionStartAt.value) / 1000))

  // 1. 学习记录通过后端接口持久化
  let ok = false
  try {
    const res = await api.saveStudyRecord({
      relationId,
      timing: String(sec),
      relationTypeText: '笔记',
      relationTypeValue: '2'
    })
    ok = !!(res && (res.success === true || res.code === 200 || res.code === 0))
  } catch (e) {
    console.error('保存打卡记录失败', e)
  }

  if (!ok) {
    showToast('保存失败，请稍后重试')
    setTimeout(() => {
      checkinLock.value = false
    }, 1000)
    return
  }

  // 2. 打卡成功：重新拉取历史记录，并开启新一轮计时
  sessionStartAt.value = now
  elapsedSec.value = 0
  showToast(`打卡成功，本次学习 ${formatDuration(sec)}`)
  triggerConfetti()
  loadStudyRecords(relationId)
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

// ========== 斩杀知识 ==========
// 点击后调用接口记录斩杀，成功则播放斩杀动画并移除本节内容（打卡学习区保留）
const BAN_ANIM_MS = 900

const handleBanKnowledge = async () => {
  const relationId = result.value && result.value.id ? String(result.value.id) : ''
  if (!relationId || banLock.value || banAnimating.value || banned.value) return

  banLock.value = true
  let ok = false
  try {
    const res = await api.saveStudyBan({
      relationId,
      relationTypeText: '笔记',
      relationTypeValue: '2'
    })
    ok = !!(res && (res.success === true || res.code === 200 || res.code === 0))
  } catch (e) {
    console.error('斩杀知识点失败', e)
  }
  banLock.value = false

  if (!ok) {
    showToast('斩杀失败，请稍后重试')
    return
  }

  // 动画：刀光扫过 + "斩"字闪现 + 内容碎裂淡出，结束后移除内容
  banAnimating.value = true
  clearTimeout(banTimer)
  banTimer = setTimeout(() => {
    banAnimating.value = false
    banned.value = true
    showToast('已斩杀本节知识点')
  }, BAN_ANIM_MS)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  startCheckinTimer()
  window.addEventListener('keydown', handleKeyDown)
  // 拉取已发布笔记，填充“学习范围”下拉框
  loadNoteOptions()
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', handleKeyDown)
  clearTimeout(toastTimer)
  clearTimeout(banTimer)
  clearInterval(checkinTimer)
})
</script>

<style scoped>
.random-study-page {
  position: relative;
  min-height: 100vh;
}

/* ========== 背景效果（与全站一致） ========== */
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

/* ========== 页面主体 ========== */
.page-main {
  position: relative;
  z-index: 1;
  padding: 60px 0 100px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 40px 0 12px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  flex-shrink: 0;
}

.page-desc {
  font-size: 15px;
  color: var(--text-muted);
  margin: 0;
}

/* ========== 摇一摇按钮区 ========== */
.shake-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 34px;
}

/* ========== 学习范围选择（笔记下拉框） ========== */
.scope-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 420px;
  margin: 0 auto 30px;
  padding: 7px 10px 7px 16px;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--bg-card);
  box-shadow: 0 2px 12px -6px rgba(0, 0, 0, 0.25);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.scope-bar:hover {
  border-color: var(--accent-glow);
}

.scope-label {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--text-muted);
}

.scope-select-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.scope-select {
  width: 100%;
  padding: 8px 30px 8px 12px;
  border: none;
  border-radius: 999px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  text-overflow: ellipsis;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.scope-select:hover:not(:disabled) {
  background: var(--accent-glow);
}

.scope-select:focus-visible {
  box-shadow: 0 0 0 2px var(--accent-primary);
}

.scope-select:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* 原生下拉选项：跟随主题配色（暗色下避免白底白字） */
.scope-select option {
  background: var(--bg-card);
  color: var(--text-primary);
}

.scope-caret {
  position: absolute;
  right: 10px;
  width: 14px;
  height: 14px;
  color: var(--text-muted);
  pointer-events: none;
}

.scope-select:focus-visible + .scope-caret {
  color: var(--accent-primary);
}

/* 清除选择：回到全库随机 */
.scope-clear {
  flex-shrink: 0;
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.scope-clear:hover {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  background: var(--accent-glow);
}

.shake-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 176px;
  height: 176px;
  padding: 0;
  border: none;
  border-radius: 50%;
  color: #fff;
  background:
    radial-gradient(circle at 32% 26%, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0) 55%),
    linear-gradient(145deg, var(--accent-primary), var(--accent-secondary));
  cursor: pointer;
  overflow: visible;
  animation: btnPulse 2.4s ease-in-out infinite;
  transition: transform 0.25s ease;
}

.shake-btn:hover:not(:disabled) {
  transform: scale(1.06);
  animation-play-state: paused;
  box-shadow:
    0 0 0 10px var(--accent-glow),
    0 18px 44px -10px var(--accent-glow);
}

.shake-btn:active:not(:disabled) {
  transform: scale(0.96);
}

.shake-btn:disabled {
  cursor: wait;
}

/* 滚动中的整体摇晃 */
.shake-btn.shake-rolling {
  animation: btnShake 0.55s ease-in-out infinite;
}

/* 呼吸光晕（轮廓光圈 + 底部投影） */
@keyframes btnPulse {
  0%, 100% {
    box-shadow:
      0 0 0 4px var(--accent-glow),
      0 14px 30px -10px var(--accent-glow);
  }
  50% {
    box-shadow:
      0 0 0 14px var(--accent-glow),
      0 20px 46px -10px var(--accent-glow);
  }
}

@keyframes btnShake {
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(-7deg) scale(1.03); }
  40% { transform: rotate(6deg) scale(1.05); }
  60% { transform: rotate(-5deg) scale(1.03); }
  80% { transform: rotate(4deg); }
}

/* 柔和径向光晕（向外扩散呼吸放大） */
.shake-aura {
  position: absolute;
  inset: -30px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--accent-glow) 0%, transparent 66%);
  opacity: 0.6;
  pointer-events: none;
  animation: auraPulse 2.4s ease-in-out infinite;
}

/* 摇动中光晕快速呼吸，替代原旋转光环的反馈 */
.shake-rolling .shake-aura {
  animation-duration: 0.9s;
  opacity: 0.85;
}

@keyframes auraPulse {
  0%, 100% { transform: scale(0.92); opacity: 0.5; }
  50% { transform: scale(1.08); opacity: 0.85; }
}

/* 骰子图标：空闲时偶尔小晃 */
.shake-btn-icon {
  display: inline-flex;
  width: 44px;
  height: 44px;
  pointer-events: none;
  animation: iconWobble 3.6s ease-in-out infinite;
}

.shake-btn-icon svg {
  width: 100%;
  height: 100%;
}

.shake-btn:hover:not(:disabled) .shake-btn-icon {
  animation-duration: 1.6s;
}

.shake-rolling .shake-btn-icon {
  animation: iconShake 0.45s ease-in-out infinite;
}

@keyframes iconWobble {
  0%, 78%, 100% { transform: rotate(0deg); }
  82% { transform: rotate(-9deg); }
  87% { transform: rotate(8deg); }
  92% { transform: rotate(-5deg); }
  97% { transform: rotate(3deg); }
}

@keyframes iconShake {
  0%, 100% { transform: rotate(-15deg) scale(1.06); }
  50% { transform: rotate(15deg) scale(1.1); }
}

.shake-btn-main {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 4px;
  color: #fff;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
  white-space: nowrap;
}

.shake-btn-sub {
  font-size: 11px;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.82);
  white-space: nowrap;
}

.shake-tip {
  margin: 26px 0 0;
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
}

.shake-error {
  margin: 16px 0 0;
  padding: 10px 18px;
  font-size: 13px;
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.35);
  border-radius: 10px;
  text-align: center;
}

/* ========== 随机结果卡片 ========== */
.result-card {
  width: 100%;
  max-width: 900px;
  margin: 44px auto 0;
  padding: 40px 52px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.result-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;
  text-align: center;
}

.result-note {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 19px;
  font-weight: 600;
  color: var(--text-primary);
  max-width: 100%;
}

.result-note svg {
  width: 15px;
  height: 15px;
  color: var(--accent-primary);
  flex-shrink: 0;
}

.result-note-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 内容头部（对齐 NoteReader） */
.result-card .page-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 0 0 18px;
  margin: 0 0 26px;
  border-bottom: 1px solid var(--border-color);
}

.result-card .page-label {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--accent-primary);
  text-transform: uppercase;
}

.result-card .page-title {
  flex: 1;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-primary);
  min-width: 0;
  overflow-wrap: anywhere;
  text-align: right;
}

/* ========== Markdown 正文样式（对齐 NoteReader） ========== */
/* ========== 斩杀动画 ========== */
.md-body-wrap {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
}

/* 刀光：斩杀时斜向扫过 */
.md-body-wrap::after {
  content: '';
  position: absolute;
  top: -20%;
  left: -60%;
  width: 45%;
  height: 140%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.95), transparent);
  transform: skewX(-18deg);
  opacity: 0;
  pointer-events: none;
  z-index: 2;
}

.ban-slash::after {
  animation: banSweep 0.55s ease-out forwards;
}

/* 「斩」字闪现 */
.ban-mark {
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 92px;
  font-weight: 900;
  line-height: 1;
  color: #fff;
  text-shadow:
    0 0 24px rgba(244, 63, 94, 0.9),
    0 0 60px rgba(249, 115, 22, 0.7);
  transform: translate(-50%, -50%) scale(0.5) rotate(-10deg);
  opacity: 0;
  pointer-events: none;
  user-select: none;
  z-index: 3;
}

.ban-slash .ban-mark {
  animation: banMark 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

/* 内容被斩：震动后碎裂淡出 */
.ban-slash .md-body {
  animation: banOut 0.9s ease-in forwards;
}

@keyframes banOut {
  0% { opacity: 1; transform: none; filter: none; }
  18% { transform: translateX(-6px) rotate(-0.8deg); }
  36% { transform: translateX(6px) rotate(0.8deg); }
  60% { opacity: 0.85; }
  100% { opacity: 0; transform: scale(0.96) translateY(10px); filter: blur(6px); }
}

@keyframes banSweep {
  0% { left: -60%; opacity: 0; }
  20% { opacity: 1; }
  100% { left: 120%; opacity: 0; }
}

@keyframes banMark {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.4) rotate(-16deg); }
  28% { opacity: 1; transform: translate(-50%, -50%) scale(1.12) rotate(-6deg); }
  62% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(-6deg); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.4) rotate(-6deg); }
}

/* 斩杀完成占位 */
.ban-done {
  margin-top: 8px;
  padding: 34px 20px;
  text-align: center;
  border: 1px dashed var(--border-color);
  border-radius: 12px;
  background: var(--bg-secondary);
  animation: banDoneIn 0.45s ease both;
}

.ban-done-icon {
  color: var(--accent-primary);
  opacity: 0.75;
}

.ban-done-title {
  margin: 12px 0 6px;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.ban-done-desc {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
}

@keyframes banDoneIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}

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

/* 图片独占一行 */
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

.md-body :deep(code:not(.hljs)) {
  padding: 2px 6px;
  border-radius: 5px;
  background: var(--bg-secondary);
  color: var(--accent-primary);
  font-size: 13px;
  font-family: 'Consolas', 'Courier New', monospace;
}

/* ==高亮==：荧光笔效果 */
.md-body :deep(mark.hl-mark) {
  padding: 1px 3px;
  border-radius: 4px;
  background: rgba(250, 204, 21, 0.38);
  color: inherit;
  font-weight: 600;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
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

/* ========== 过渡与轻提示 ========== */
.shake-fade-enter-active,
.shake-fade-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.shake-fade-enter-from,
.shake-fade-leave-to {
  opacity: 0;
  transform: translateY(14px);
}

.toast-pop-enter-active,
.toast-pop-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-pop-enter-from,
.toast-pop-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}

.random-toast {
  position: fixed;
  left: 50%;
  bottom: 40px;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  /* 固定定位下 left: 50% 会把可用宽度压成半屏而触发换行；
     用 max-content 按内容撑开（单行），仅在超出屏宽时才收缩 */
  width: max-content;
  max-width: calc(100vw - 32px);
  padding: 10px 18px;
  font-size: 13px;
  color: #fff;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(8px);
  border-radius: 999px;
  box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.4);
  z-index: 100;
}

.random-toast svg {
  width: 15px;
  height: 15px;
  color: var(--accent-primary);
}

/* ========== 学习打卡（与笔记阅读器 NoteReader 一致，内嵌于结果卡片） ========== */
/* ========== 斩杀知识按钮 ========== */
.ban-bar {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  margin-top: 28px;
  text-align: right;
}

.ban-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 30px;
  border: none;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  /* 跟随主题配色（渐变与光晕均由主题变量驱动） */
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
  box-shadow: 0 10px 24px -12px var(--accent-primary), 0 0 0 1px var(--accent-glow);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.ban-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px -12px var(--accent-primary), 0 0 0 1px var(--accent-primary);
}

.ban-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.97);
}

.ban-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.ban-btn-icon {
  width: 18px;
  height: 18px;
}

/* 已斩杀（禁用态）同样跟随主题：弱化为卡片底色 + 主题描边 */
.ban-btn-done {
  color: var(--text-muted);
  background: var(--bg-card);
  box-shadow: inset 0 0 0 1px var(--border-color);
}

.ban-tip {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
}

.result-checkin {
  margin-top: 34px;
  padding-top: 26px;
  border-top: 1px solid var(--border-color);
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

/* ========== 图片查看器 ========== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .page-main {
    padding: 40px 0 70px;
  }

  .page-header {
    padding: 28px 0 8px;
  }

  .shake-zone {
    margin-top: 20px;
  }

  /* 学习范围：移动端收窄内边距，给下拉留足空间 */
  .scope-bar {
    gap: 8px;
    padding: 6px 8px 6px 12px;
    margin-bottom: 24px;
  }

  .scope-label {
    font-size: 11px;
    letter-spacing: 0;
  }

  .scope-select {
    padding: 8px 26px 8px 10px;
    font-size: 12px;
  }

  .scope-clear {
    padding: 5px 10px;
    font-size: 11px;
  }

  .shake-btn {
    width: 152px;
    height: 152px;
  }

  .shake-btn-icon {
    width: 38px;
    height: 38px;
  }

  .shake-btn-main {
    font-size: 20px;
  }

  /* 结果卡片占屏宽 98%：抵消 .container 左右内边距并保持居中，同时收窄内边距让正文更宽 */
  .result-card {
    width: 98vw;
    max-width: 98vw;
    margin-top: 30px;
    margin-left: calc((100% - 98vw) / 2);
    margin-right: calc((100% - 98vw) / 2);
    padding: 26px 14px;
  }

  .result-card .page-title {
    font-size: 15px;
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
    margin: 1em 0;
  }

  .md-body :deep(.code-body code) {
    font-size: 12px;
  }

  .md-body :deep(blockquote) {
    padding: 6px 14px;
  }

  /* 表格在移动端横向滚动 */
  .md-body :deep(table) {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  .result-checkin {
    margin-top: 26px;
    padding-top: 22px;
  }

  .checkin-panel {
    padding: 22px 8px;
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

  .checkin-stat {
    padding: 14px 0;
  }

  .checkin-history {
    margin-top: 20px;
  }

  /* 回到顶部按钮移动端适配 */
  .back-to-top {
    right: 16px;
    bottom: 24px;
    width: 38px;
    height: 38px;
  }

  .back-to-top-icon {
    font-size: 18px;
  }

  /* 斩杀知识移动端适配 */
  .ban-bar {
    margin-top: 22px;
  }

  .ban-btn {
    padding: 11px 24px;
    font-size: 14px;
  }

  .ban-btn-icon {
    width: 16px;
    height: 16px;
  }

  .ban-mark {
    font-size: 68px;
  }

  .ban-done {
    padding: 26px 16px;
  }

  /* 图片查看器移动端适配 */
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
  .ban-btn {
    padding: 12px 18px;
  }

  .ban-mark {
    font-size: 56px;
  }

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
