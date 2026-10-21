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
                  :class="{ active: currentIndex === -1 && !showLifeline }"
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
                    { active: currentIndex === chapter.rawIndex && !showLifeline, expanded: expandedIds.has(chapter.id) }
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

              <!-- 生命线：固定在目录最下方，如同序言一样只读查看（无任何编辑入口） -->
              <div
                class="toc-item toc-lifeline"
                :class="{ active: showLifeline }"
                @click="selectLifeline"
                title="生命线"
              >
                <span class="toc-index lifeline-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 12h4l3-8 4 16 3-8h4"/>
                  </svg>
                </span>
                <span class="toc-name">生命线</span>
              </div>
            </aside>

            <!-- 右侧内容列：正文与打卡学习各自独立卡片 -->
            <div class="reader-main-col">
              <!-- 生命线模块：独立卡片，查看学习轨迹时隐藏正文与打卡 -->
              <section v-if="showLifeline" class="lifeline-wrap">
                <div class="page-header">
                  <span class="page-label">生命线</span>
                  <h2 class="page-title">{{ noteName || '未命名笔记' }}</h2>
                </div>

                <p v-if="lifelineLoading" class="lifeline-empty">生命线加载中…</p>
                <template v-else>
                  <!-- 时间线：按天分组，一天可含多个小节 -->
                  <div v-if="lifelineDays.length" class="lifeline-timeline">
                    <!-- 起始节点：主轴起点，指向创建时间 -->
                    <div class="lifeline-start">
                      <span class="lifeline-month"></span>
                      <div class="lifeline-day-marker">
                        <span class="lifeline-start-dot"></span>
                      </div>
                      <div class="lifeline-start-body">
                        <span class="lifeline-start-text">
                          创建于 <span class="lifeline-start-date">{{ lifelineStart || '—' }}</span>
                        </span>
                      </div>
                    </div>
                    <div v-for="(day, dayIndex) in lifelineDays" :key="day.date" class="lifeline-day">
                      <!-- 月份归属：换月时在时间线左侧展示一次 -->
                      <span class="lifeline-month" :title="monthLabel(day.date)">
                        {{ isMonthStart(dayIndex) ? monthLabel(day.date) : '' }}
                      </span>
                      <div class="lifeline-day-marker">
                        <span class="lifeline-day-dot"></span>
                        <span class="lifeline-day-line"></span>
                      </div>
                      <div class="lifeline-day-body">
                        <div class="lifeline-day-date">{{ formatDay(day.date) }}</div>
                        <div
                          v-for="(ch, idx) in day.chapters"
                          :key="ch.id"
                          class="lifeline-chapter"
                          :class="[Number(ch.complete) === 1 ? 'is-done' : 'is-studying', idx === 0 ? 'is-first' : '']"
                        >
                          <span class="lifeline-chapter-label">{{ ch.label }}</span>
                          <span class="lifeline-chapter-title">{{ ch.title }}</span>
                          <span class="lifeline-chapter-status">{{ Number(ch.complete) === 1 ? '已完成' : '学习中' }}</span>
                        </div>
                      </div>
                    </div>
                    <!-- 结束节点：主轴收尾，指向完结时间 -->
                    <div class="lifeline-end">
                      <span class="lifeline-month"></span>
                      <div class="lifeline-day-marker">
                        <span class="lifeline-end-dot"></span>
                      </div>
                      <div class="lifeline-end-body">
                        <span v-if="lifelineEndTime" class="lifeline-end-text">
                          完结于 <span class="lifeline-end-date">{{ lifelineEndTime }}</span>
                        </span>
                        <span v-else class="lifeline-end-text">待续...</span>
                      </div>
                    </div>
                  </div>
                  <p v-else class="lifeline-empty">还没有学习记录，读完小节并打卡后，这里会生成你的生命线～</p>
                </template>
              </section>

              <!-- 正文卡片 -->
              <section v-else class="reader-content">
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

                  <!-- 正文来自 queryChapter?id=：加载中 / 失败 / 渲染三态 -->
                  <p v-if="contentLoading" class="md-empty">章节内容加载中…</p>
                  <p v-else-if="contentError" class="md-empty">
                    {{ contentError }}
                    <button class="md-retry" type="button" @click="retryChapterContent">重新加载</button>
                  </p>
                  <template v-else>
                    <div class="md-body" v-html="renderedContent"></div>
                    <p v-if="!currentContent" class="md-empty">本节暂无内容</p>
                  </template>

                  <!-- 上一节 / 下一节：按目录顺序跨章节连续跳转，到尽头时给出提示 -->
                  <nav class="chapter-nav">
                    <button
                      type="button"
                      class="chapter-nav-btn prev"
                      :class="{ 'is-end': !prevChapter }"
                      :aria-disabled="!prevChapter"
                      :title="prevChapter ? `上一节：${prevChapter.title}` : '已经是第一节了'"
                      @click="goSiblingChapter(-1)"
                    >
                      <svg class="chapter-nav-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M15 18l-6-6 6-6"/>
                      </svg>
                      <span class="chapter-nav-text">
                        <span class="chapter-nav-label">上一节</span>
                        <span class="chapter-nav-title">{{ prevChapter ? prevChapter.title : '已经是第一节了' }}</span>
                      </span>
                    </button>

                    <button
                      type="button"
                      class="chapter-nav-btn next"
                      :class="{ 'is-end': !nextChapter }"
                      :aria-disabled="!nextChapter"
                      :title="nextChapter ? `下一节：${nextChapter.title}` : '已经是最后一节了'"
                      @click="goSiblingChapter(1)"
                    >
                      <span class="chapter-nav-text">
                        <span class="chapter-nav-label">下一节</span>
                        <span class="chapter-nav-title">{{ nextChapter ? nextChapter.title : '已经是最后一节了' }}</span>
                      </span>
                      <svg class="chapter-nav-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </button>
                  </nav>
                </div>
              </section>

              <!-- 打卡学习（独立卡片，仅二级小节展示；生命线视图下隐藏） -->
              <section v-if="showCheckin && !showLifeline" class="checkin-wrap">
                <div class="checkin-head">
                  <div class="checkin-title">打卡学习</div>
                </div>

                <!-- 本次学习时长：移出按钮，独立展示在打卡按钮上方 -->
                <div class="checkin-clock">
                  <span class="checkin-clock-label">本次学习时长</span>
                  <span class="checkin-clock-time">{{ sessionClock }}</span>
                </div>

                <div class="checkin-panel">
                  <!-- 四档评分：点任意一个即完成打卡（1/2/3/4 → Again/Hard/Good/Easy） -->
                  <button
                    v-for="opt in ratingOptions"
                    :key="opt.value"
                    type="button"
                    class="rating-btn"
                    :class="'rating-' + opt.key"
                    :disabled="checkinLock"
                    :title="`打卡并标记为 ${opt.text}`"
                    @click="handleCheckin(opt, $event)"
                  >
                    <span class="rating-btn-text">{{ opt.text }}</span>
                    <span class="rating-btn-sub">{{ opt.sub }}</span>
                  </button>
                </div>

                <div class="checkin-stats">
                  <div class="checkin-stat">
                    <span class="checkin-stat-num">{{ studyStats.totalCount }}</span>
                    <span class="checkin-stat-label">累计学习次数</span>
                  </div>
                  <div class="checkin-stat">
                    <span class="checkin-stat-time">{{ studyStats.totalTiming }}</span>
                    <span class="checkin-stat-label">累计学习时长</span>
                  </div>
                  <div class="checkin-stat checkin-stat-next">
                    <span class="checkin-stat-time">{{ nextReviewText }}</span>
                    <span class="checkin-stat-label">推荐下次复习时间</span>
                  </div>
                </div>

                <!-- 基于 FSRS 算法的记忆留存率曲线 -->
                <div class="retention-wrap">
                  <div class="retention-head">
                    <span class="retention-title">基于FSRS算法的记忆留存率曲线</span>
                    <span v-if="retentionChart" class="retention-sub">未来 {{ retentionChart.days }} 天</span>
                  </div>
                  <p v-if="studyRecordsLoading" class="checkin-empty">曲线加载中…</p>
                  <template v-else-if="retentionChart">
                    <svg
                      class="retention-chart"
                      viewBox="0 0 560 220"
                      preserveAspectRatio="xMidYMid meet"
                      role="img"
                      aria-label="记忆留存率曲线"
                    >
                      <!-- 横向网格 -->
                      <g class="retention-grid">
                        <line
                          v-for="t in retentionChart.yTicks"
                          :key="'g' + t.v"
                          :x1="retentionChart.pad.l"
                          :x2="retentionChart.w - retentionChart.pad.r"
                          :y1="t.y"
                          :y2="t.y"
                        />
                      </g>
                      <!-- 坐标轴刻度文字 -->
                      <g class="retention-axis-text">
                        <text
                          v-for="t in retentionChart.yTicks"
                          :key="'y' + t.v"
                          :x="retentionChart.pad.l - 6"
                          :y="t.y + 4"
                          text-anchor="end"
                        >{{ t.label }}</text>
                        <text
                          v-for="t in retentionChart.xTicks"
                          :key="'x' + t.v"
                          :x="t.x"
                          :y="retentionChart.h - 8"
                          text-anchor="middle"
                        >{{ t.label }}</text>
                      </g>
                      <!-- 无复习（自然遗忘） -->
                      <polyline class="retention-line line-no" :points="retentionChart.noPoints" />
                      <!-- 按计划复习（FSRS）：面积 + 实线 -->
                      <path v-if="retentionChart.withArea" class="retention-area" :d="retentionChart.withArea" />
                      <polyline class="retention-line line-with" :points="retentionChart.withPoints" />
                    </svg>
                    <div class="retention-legend">
                      <span class="legend-item"><i class="legend-swatch legend-no"></i>无复习（自然遗忘）</span>
                      <span class="legend-item"><i class="legend-swatch legend-with"></i>按计划复习（FSRS）</span>
                    </div>
                  </template>
                  <p v-else class="checkin-empty">还没有学习记录，打卡后即可看到记忆留存率曲线～</p>
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

    <!-- 打卡成功 / 通用提示 -->
    <transition name="toast-pop">
      <div v-if="checkinToast" class="checkin-toast">
        <svg v-if="toastKind === 'success'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 8h.01"/>
          <path d="M11 12h1v4h1"/>
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
import { Marked } from 'marked'
import hljs from 'highlight.js'
import api from '../api/article.js'
import { useTheme } from '../composables/useTheme.js'

// 接入网站主题体系（服务端主题 + 全局切换），与其他页面保持一致
useTheme()

const route = useRoute()

// 支持 /notes/:id 或 /notes?id=xxx 两种进入方式
const noteId = route.params.id || route.query.id || ''

// 自定义 marked 渲染器：标题生成锚点 id + 代码块高亮
const renderer = {}

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

// 高亮语法扩展：==文本== → <mark class="md-highlight">
const highlightExtension = {
  name: 'highlight',
  level: 'inline',
  start(src) {
    return src.indexOf('==')
  },
  tokenizer(src) {
    const match = /^==([^=\n]+)==/.exec(src)
    if (match) {
      const token = {
        type: 'highlight',
        raw: match[0],
        text: match[1],
        tokens: []
      }
      // 内部文本继续按行内语法解析（支持加粗、链接等嵌套）
      const childTokens = this.lexer.inlineTokens(token.text, token.tokens)
      if (childTokens) token.tokens = childTokens
      return token
    }
  },
  renderer(token) {
    return `<mark class="md-highlight">${this.parser.parseInline(token.tokens)}</mark>`
  }
}

// 页面独立 marked 实例：仅本页注册高亮扩展，避免影响其他页面共用的全局配置
const md = new Marked()
md.use({ renderer })
md.use({ extensions: [highlightExtension] })

const renderMarkdown = (text) => (text ? md.parse(text) : '')

const loading = ref(false)
const loadError = ref('')
const noteName = ref('')
const noteAuthor = ref('')
const notePreface = ref('')
const chapters = ref([])
// -1 表示序言（默认）
const currentIndex = ref(-1)
// 是否展示「生命线」固定模块（仅查看，无任何编辑入口）
const showLifeline = ref(false)

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

// ========== 章节正文（列表接口不返回 content，正文单独走 queryChapter?id= 拉取） ==========
// 缓存：章节 id -> markdown 原文（已缓存则直接复用，不重复请求）
const chapterContent = ref({})
const contentLoadingId = ref('')
const contentError = ref('')
let contentRequestSeq = 0

const currentChapterId = computed(() => (currentChapter.value.id ? String(currentChapter.value.id) : ''))

// 当前展示的正文：序言不取章节正文；章节取缓存（未加载时为空串，由加载态占位）
const currentContent = computed(() => {
  if (currentIndex.value === -1) return ''
  const id = currentChapterId.value
  return id ? chapterContent.value[id] ?? '' : ''
})

const contentLoading = computed(() => !!currentChapterId.value && contentLoadingId.value === currentChapterId.value)
const renderedContent = computed(() => renderMarkdown(currentContent.value))

// 按需加载章节正文（带缓存；失败不写缓存，便于重试）
const loadChapterContent = async (id) => {
  const key = String(id ?? '')
  if (!key) return
  if (chapterContent.value[key] !== undefined) return // 已缓存
  const seq = ++contentRequestSeq
  contentLoadingId.value = key
  contentError.value = ''
  try {
    const res = await api.getPublicChapterDetail(key)
    const ok = !!(res && (res.success === true || res.code === 200 || res.code === 0))
    if (!ok) throw new Error((res && (res.message || res.msg)) || '章节内容加载失败')
    const content = (res.data && res.data.content) || ''
    // 空内容也写入缓存，避免每次切换都重新请求
    chapterContent.value = { ...chapterContent.value, [key]: content }
  } catch (e) {
    console.error('加载章节内容失败', e)
    if (seq === contentRequestSeq) contentError.value = '章节内容加载失败，请稍后重试'
  } finally {
    if (seq === contentRequestSeq) contentLoadingId.value = ''
  }
}

// 重试按钮：清掉错误态后重新拉取当前章节
const retryChapterContent = () => {
  contentError.value = ''
  const id = currentChapterId.value
  if (id) loadChapterContent(id)
}

// 切换章节（只读，无保存逻辑）
// 打卡针对二级小节统计：每次切换到二级小节都重置本次学习计时
const selectChapter = (index) => {
  // 点击序言/章节时退出生命线视图（即使回到同一章节也要退出）
  showLifeline.value = false
  const changed = index !== currentIndex.value
  currentIndex.value = index
  const target = flatChapters.value[index]
  if (!target) return
  if (changed && target.level === 1) {
    sessionStartAt.value = Date.now()
    elapsedSec.value = 0
    // 切换到二级小节：重置计时并加载该小节的历史打卡记录
    loadStudyRecords(String(target.id ?? ''))
  }
  // 章节正文按需拉取（命中缓存则不发请求；重新点击可在失败后重试）
  loadChapterContent(target.id)
}

// ========== 上一节 / 下一节 ==========
// 相邻项取 flatChapters 的前后一项（拍平后的目录顺序），因此可以自然跨章节连续跳转
const prevChapter = computed(() => (currentIndex.value > 0 ? flatChapters.value[currentIndex.value - 1] : null))
const nextChapter = computed(() => {
  const i = currentIndex.value
  if (i < 0 || i >= flatChapters.value.length - 1) return null
  return flatChapters.value[i + 1]
})

// step = -1 上一节，1 下一节
const goSiblingChapter = (step) => {
  const target = step < 0 ? prevChapter.value : nextChapter.value
  if (!target) {
    showCheckinToast(step < 0 ? '已经是第一节了，没有上一节' : '已经是最后一节了，没有下一节', 'info')
    return
  }
  const index = flatChapters.value.indexOf(target)
  if (index < 0) return
  // 目标若为二级小节，自动展开其所属章节，保证左侧目录能定位到高亮项
  if (target.level === 1 && target.pid && !expandedIds.value.has(target.pid)) {
    const next = new Set(expandedIds.value)
    next.add(target.pid)
    expandedIds.value = next
  }
  selectChapter(index)
  // 跳到新内容时回到顶部，避免停留在上一节的底部
  scrollToTop()
}

// ========== 生命线（固定只读模块） ==========
// 数据源 = 后端聚合接口 getNoteLine?noteId=（按天分组返回学习记录）
const lifelineLoading = ref(false)
const lifelineDays = ref([])

// 2026-09-18 → 2026年9月18日
const formatDay = (date) => {
  if (!date) return ''
  const d = new Date(`${date}T00:00:00`)
  if (Number.isNaN(d.getTime())) return date
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

// 该时间点是否为新月份的首个时间点（换月时左侧才展示月份，其余留空保持对齐）
const isMonthStart = (i) => {
  if (i <= 0) return true
  const prev = lifelineDays.value[i - 1].date
  const cur = lifelineDays.value[i].date
  return prev.slice(0, 7) !== cur.slice(0, 7)
}

// 月份标签：与首条同年只显示「X月」，跨年显示「YYYY年X月」
const monthLabel = (date) => {
  const y = Number(date.slice(0, 4))
  const m = Number(date.slice(5, 7))
  const firstYear = Number((lifelineDays.value[0]?.date || date).slice(0, 4))
  return y === firstYear ? `${m}月` : `${y}年${m}月`
}

// 起始/完结时间：直接取接口返回的 startTime / endTime
// endTime 为空代表该笔记未完结，显示「待续...」
const lifelineMeta = ref({ startTime: '', endTime: '' })
const lifelineStart = computed(() => lifelineMeta.value.startTime)
const lifelineEndTime = computed(() => lifelineMeta.value.endTime)

// 点击目录「生命线」：隐藏右侧正文/打卡，展示时间线模块
const selectLifeline = () => {
  showLifeline.value = true
  loadLifeline()
}

const loadLifeline = async () => {
  if (!noteId) {
    lifelineDays.value = []
    return
  }
  if (lifelineLoading.value) return
  lifelineLoading.value = true
  try {
    const res = await api.getNoteLine(noteId)
    const ok = !!(res && (res.success === true || res.state === 20000 || res.code === 200 || res.code === 0))
    const raw = ok ? res.data : null
    // 真实结构：data: { name, startTime, endTime, lineList: [{ lineTime, lineMonth, contentList: [...] }] }
    const list = Array.isArray(raw) ? raw : Array.isArray(raw?.lineList) ? raw.lineList : []

    // 起始/完结时间取接口返回值（endTime 为空 = 未完结）
    lifelineMeta.value = {
      startTime: String(raw?.startTime ?? '').trim(),
      endTime: String(raw?.endTime ?? '').trim()
    }

    // 日期归一化：后端返回中文日期 "2026年09月15日" → "2026-09-15"（兼容 YYYY-MM-DD / YYYY/MM/DD）
    const normalizeDate = (value) => {
      const s = String(value ?? '').trim()
      const cn = s.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日/)
      if (cn) return `${cn[1]}-${String(cn[2]).padStart(2, '0')}-${String(cn[3]).padStart(2, '0')}`
      return s.slice(0, 10).replace(/\//g, '-')
    }

    // 小节映射：title 自带序号（如 "3.1 数字"），拆成 label（序号）+ title（正文）
    const mapChapter = (ch) => {
      const fullTitle = String(ch.title ?? ch.name ?? '').trim()
      const m = fullTitle.match(/^(\d+(?:\.\d+)*)\s+(.+)$/)
      return {
        id: ch.id ?? ch.chapterId ?? ch.relationId ?? '',
        label: m ? m[1] : '',
        title: m ? m[2] : fullTitle,
        complete: Number(ch.complete ?? ch.isComplete ?? 0)
      }
    }

    const dayMap = new Map()
    list.forEach((item) => {
      const date = normalizeDate(item.lineTime ?? item.date ?? item.day ?? item.study_time)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return
      if (!dayMap.has(date)) dayMap.set(date, [])
      const bucket = dayMap.get(date)
      const records = Array.isArray(item.contentList)
        ? item.contentList
        : Array.isArray(item.chapters)
          ? item.chapters
          : [item]
      records
        .map(mapChapter)
        .filter((ch) => ch.title)
        .forEach((ch) => {
          if (!bucket.some((c) => c.id && c.id === ch.id)) bucket.push(ch)
        })
    })

    lifelineDays.value = [...dayMap.entries()]
      .map(([date, chapters]) => ({ date, chapters }))
      .filter((day) => day.chapters.length)
      .sort((a, b) => a.date.localeCompare(b.date))
  } catch (e) {
    lifelineDays.value = []
  } finally {
    lifelineLoading.value = false
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
// 后端字段：totalCount 累计学习、totalTiming 累计学习时长(HH:mm:ss)、
// nextReviewTime 推荐下次复习时间(yyyy-MM-dd HH:mm)
const studyStats = ref({ totalCount: 0, totalTiming: '00:00:00', nextReviewTime: '' })
// 记忆留存率曲线：{ noReviewSeries: [{x,y}], withReviewSeries: [{x,y}] }（x=天数，y=留存率）
const retentionLine = ref({ noReviewSeries: [], withReviewSeries: [] })
const sessionStartAt = ref(Date.now())
const elapsedSec = ref(0)
const checkinLock = ref(false)
const checkinToast = ref('')
// toast 类型：success 打卡成功（对勾图标）/ info 普通提示（信息图标）
const toastKind = ref('success')
let checkinRequestSeq = 0
let checkinTimer = null
let checkinToastTimer = null
// 礼花覆盖层（fixed 定位到被点击按钮的中心）
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

// 推荐下次复习时间：后端返回 'yyyy-MM-dd HH:mm'，这里省略年份显示为 'MM-dd HH:mm'
const nextReviewText = computed(() => {
  const v = studyStats.value.nextReviewTime
  if (!v) return '暂无'
  return v.length >= 16 ? v.slice(5) : v
})

// ========== 记忆留存率曲线（手写 SVG，无额外依赖） ==========
const CHART_W = 560
const CHART_H = 220
const CHART_PAD = { l: 42, r: 14, t: 14, b: 30 }

const retentionChart = computed(() => {
  const norm = (arr) => (Array.isArray(arr) ? arr : [])
    .map((p) => ({ x: Number(p && p.x), y: Number(p && p.y) }))
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))
  const noPts = norm(retentionLine.value.noReviewSeries)
  const wiPts = norm(retentionLine.value.withReviewSeries)
  const all = [...noPts, ...wiPts]
  if (!all.length) return null

  const xMin = Math.min(...all.map((p) => p.x))
  const xMax = Math.max(...all.map((p) => p.x))
  // 后端 forgettingCurve 返回 0~1 的留存率；若已是百分比(>1.5)则按原样展示
  const rawMax = Math.max(...all.map((p) => p.y))
  const isPct = rawMax > 1.5
  const yMax = isPct ? Math.max(100, rawMax) : 1

  const plotW = CHART_W - CHART_PAD.l - CHART_PAD.r
  const plotH = CHART_H - CHART_PAD.t - CHART_PAD.b
  const sx = (x) => CHART_PAD.l + ((x - xMin) / (xMax - xMin || 1)) * plotW
  const sy = (y) => CHART_PAD.t + plotH - (Math.min(Math.max(y, 0), yMax) / yMax) * plotH
  const toPoints = (arr) => arr
    .map((p) => `${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`)
    .join(' ')

  // y 轴刻度：0% / 25% / 50% / 75% / 100%
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((r) => ({
    v: r,
    y: +sy(r * yMax).toFixed(1),
    label: `${Math.round(r * 100)}%`
  }))
  // x 轴刻度：起点 / 中点 / 终点
  const xTicks = [xMin, (xMin + xMax) / 2, xMax].map((v) => ({
    v,
    x: +sx(v).toFixed(1),
    label: `${Math.round(v)}天`
  }))

  // 带复习曲线下方的面积
  const baseY = CHART_PAD.t + plotH
  const withArea = wiPts.length > 1
    ? `M ${sx(wiPts[0].x).toFixed(1)},${baseY} L ${wiPts
      .map((p) => `${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`)
      .join(' L ')} L ${sx(wiPts[wiPts.length - 1].x).toFixed(1)},${baseY} Z`
    : ''

  return {
    w: CHART_W,
    h: CHART_H,
    pad: CHART_PAD,
    noPoints: toPoints(noPts),
    withPoints: toPoints(wiPts),
    withArea,
    yTicks,
    xTicks,
    days: Math.round(xMax - xMin)
  }
})

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
      totalCount: Number(data.totalCount) || 0,
      totalTiming: typeof data.totalTiming === 'string' && data.totalTiming ? data.totalTiming : '00:00:00',
      nextReviewTime: typeof data.nextReviewTime === 'string' ? data.nextReviewTime : ''
    }
    // 记忆留存率曲线：line.noReviewSeries 无复习、line.withReviewSeries 按计划复习
    const line = data.line && typeof data.line === 'object' ? data.line : {}
    retentionLine.value = {
      noReviewSeries: Array.isArray(line.noReviewSeries) ? line.noReviewSeries : [],
      withReviewSeries: Array.isArray(line.withReviewSeries) ? line.withReviewSeries : []
    }
  } catch (e) {
    console.error('查询打卡历史失败', e)
    if (seq === checkinRequestSeq) studyRecords.value = []
  } finally {
    if (seq === checkinRequestSeq) studyRecordsLoading.value = false
  }
}

const showCheckinToast = (msg, kind = 'success') => {
  checkinToast.value = msg
  toastKind.value = kind
  clearTimeout(checkinToastTimer)
  checkinToastTimer = setTimeout(() => {
    checkinToast.value = ''
  }, 3000)
}

// 打卡成功彩带礼花：在指定元素（被点击的评分按钮）圆心一次性绽放粒子
const triggerConfetti = (targetEl) => {
  const root = burstRoot.value
  if (!targetEl || !root) return
  const rect = targetEl.getBoundingClientRect()
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

// 四档评分：Again / Hard / Good / Easy，分别对应 1 / 2 / 3 / 4
const ratingOptions = [
  { key: 'again', text: 'Again', sub: '重来', value: 1 },
  { key: 'hard', text: 'Hard', sub: '困难', value: 2 },
  { key: 'good', text: 'Good', sub: '良好', value: 3 },
  { key: 'easy', text: 'Easy', sub: '简单', value: 4 }
]

const handleCheckin = async (option, event) => {
  if (checkinLock.value) return
  checkinLock.value = true
  const now = Date.now()
  const sec = Math.max(1, Math.round((now - sessionStartAt.value) / 1000))
  // 当前所在二级小节的 id，作为关联对象
  const relationId = currentChapter.value.id
  // 评分：ratingValue=1/2/3/4，ratingText=Again/Hard/Good/Easy
  const ratingValue = option ? option.value : 3
  const ratingText = option ? option.text : 'Good'
  // 是否首次打卡：依据已加载的历史打卡记录判断（历史列表为空即为首次）
  const isFirst = studyRecords.value.length === 0

  // 1. 学习记录通过后端接口持久化
  let ok = false
  try {
    const res = await api.saveStudyRecord({
      relationId: String(relationId ?? ''),
      timing: String(sec),
      relationTypeText: '笔记',
      relationTypeValue: '2',
      ratingValue,
      ratingText,
      isFirst
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
  showCheckinToast(`打卡成功（${ratingText}），本次学习 ${formatDuration(sec)}`)
  // 礼花从被点击的那个按钮中心绽放
  triggerConfetti(event && event.currentTarget)
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

/* 章节正文加载失败时的重试按钮 */
.md-retry {
  display: inline-block;
  margin-left: 10px;
  padding: 4px 14px;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--bg-secondary);
  color: var(--accent-primary);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.md-retry:hover {
  border-color: var(--accent-primary);
  background: var(--accent-glow);
}

/* ========== 上一节 / 下一节 ========== */
.chapter-nav {
  display: flex;
  align-items: stretch;
  gap: 12px;
  margin-top: 38px;
  padding-top: 22px;
  border-top: 1px dashed var(--border-color);
}

.chapter-nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1 1 0;
  min-width: 0;
  max-width: 50%;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.15s ease;
}

.chapter-nav-btn.next {
  margin-left: auto;
  text-align: right;
  justify-content: flex-end;
}

.chapter-nav-btn:hover:not(.is-end) {
  border-color: var(--accent-primary);
  background: var(--accent-glow);
  transform: translateY(-1px);
}

.chapter-nav-btn:active:not(.is-end) {
  transform: translateY(0);
}

/* 到尽头：置灰但仍可点击，点击后给出提示 */
.chapter-nav-btn.is-end {
  opacity: 0.55;
  cursor: not-allowed;
}

.chapter-nav-arrow {
  flex-shrink: 0;
  color: var(--accent-primary);
}

.chapter-nav-btn.is-end .chapter-nav-arrow {
  color: var(--text-muted);
}

.chapter-nav-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.chapter-nav-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--accent-primary);
}

.chapter-nav-btn.is-end .chapter-nav-label {
  color: var(--text-muted);
}

.chapter-nav-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chapter-nav-btn.is-end .chapter-nav-title {
  color: var(--text-muted);
  font-weight: 500;
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

/* ==高亮== 语法：显眼的高亮样式 */
.md-body :deep(mark.md-highlight) {
  background: linear-gradient(180deg, rgba(255, 214, 0, 0.35) 0%, #ffd600 100%);
  color: #5a3d00;
  font-weight: 600;
  padding: 1px 4px;
  border-radius: 3px;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
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

  /* 上一节 / 下一节：窄屏缩小内边距与字号 */
  .chapter-nav {
    gap: 8px;
    margin-top: 28px;
    padding-top: 18px;
  }

  .chapter-nav-btn {
    padding: 9px 10px;
    gap: 4px;
  }

  .chapter-nav-label {
    font-size: 10px;
    letter-spacing: 0;
  }

  .chapter-nav-title {
    font-size: 12px;
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

/* 本次学习时长：独立展示在打卡按钮上方 */
.checkin-clock {
  margin-top: 16px;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 10px;
}

.checkin-clock-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--text-muted);
}

.checkin-clock-time {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 1.5px;
  color: var(--accent-primary);
  font-variant-numeric: tabular-nums;
}

.checkin-panel {
  margin-top: 14px;
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* 四档评分按钮：Again / Hard / Good / Easy，点任意一个即打卡 */
.rating-btn {
  flex: 1 1 0;
  min-width: 84px;
  max-width: 132px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 12px 8px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-secondary);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, border-color 0.18s ease;
}

.rating-btn-text {
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.5px;
}

.rating-btn-sub {
  font-size: 11px;
  line-height: 1;
  opacity: 0.78;
}

/* 四档配色：红 / 橙 / 绿 / 蓝 */
.rating-again {
  color: #e11d48;
  border-color: rgba(225, 29, 72, 0.35);
  background: rgba(225, 29, 72, 0.08);
}

.rating-hard {
  color: #ea580c;
  border-color: rgba(234, 88, 12, 0.35);
  background: rgba(234, 88, 12, 0.08);
}

.rating-good {
  color: #16a34a;
  border-color: rgba(22, 163, 74, 0.35);
  background: rgba(22, 163, 74, 0.08);
}

.rating-easy {
  color: #0284c7;
  border-color: rgba(2, 132, 199, 0.35);
  background: rgba(2, 132, 199, 0.08);
}

.rating-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: currentColor;
  box-shadow: 0 8px 18px -8px currentColor;
}

.rating-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.97);
}

.rating-btn:disabled {
  cursor: not-allowed;
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

/* 推荐下次复习时间：文案与时间都较长，缩小一档避免溢出 */
.checkin-stat-next .checkin-stat-time {
  font-size: 17px;
}

.checkin-stat-next .checkin-stat-label {
  font-size: 11px;
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

/* ========== 基于 FSRS 的记忆留存率曲线 ========== */
.retention-wrap {
  margin-top: 24px;
}

.retention-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.retention-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.retention-sub {
  font-size: 12px;
  color: var(--text-muted);
}

.retention-chart {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

/* 横向网格线 */
.retention-grid line {
  stroke: var(--border-color);
  stroke-width: 1;
  stroke-dasharray: 3 5;
  opacity: 0.75;
}

/* 坐标轴刻度文字 */
.retention-axis-text text {
  fill: var(--text-muted);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.retention-line {
  fill: none;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* 无复习：灰色虚线（自然遗忘） */
.retention-line.line-no {
  stroke: #94a3b8;
  stroke-dasharray: 6 4;
}

/* 按计划复习：主题色实线 */
.retention-line.line-with {
  stroke: var(--accent-primary);
}

/* 复习曲线下方的填充面积 */
.retention-area {
  fill: var(--accent-primary);
  opacity: 0.12;
  stroke: none;
}

.retention-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 8px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

.legend-swatch {
  width: 18px;
  height: 0;
  border-top-width: 2.5px;
  border-top-style: solid;
}

.legend-swatch.legend-no {
  border-top-color: #94a3b8;
  border-top-style: dashed;
}

.legend-swatch.legend-with {
  border-top-color: var(--accent-primary);
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
    gap: 8px;
  }

  .rating-btn {
    min-width: 68px;
    padding: 10px 6px;
  }

  .checkin-clock-time {
    font-size: 20px;
  }

  .checkin-stat-num,
  .checkin-stat-time {
    font-size: 18px;
  }
}

/* ========== 生命线（固定只读模块） ========== */
/* 目录入口：固定在目录最底部 */
.toc-lifeline {
  margin-top: 8px;
  border-top: 1px dashed var(--border-color);
}

.lifeline-icon {
  display: flex;
  align-items: center;
}

/* 生命线独立卡片 */
.lifeline-wrap {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 44px 56px;
}

/* 创建 / 完结时间：已移到时间线首尾节点（见 .lifeline-start / .lifeline-end） */

/* 时间线（按天，竖向） */
.lifeline-timeline {
  display: flex;
  flex-direction: column;
}

.lifeline-day {
  display: flex;
  gap: 16px;
}

/* 月份归属（时间线左侧，换月展示一次） */
.lifeline-month {
  flex-shrink: 0;
  width: 52px;
  padding-top: 2px;
  text-align: right;
  font-size: 13px;
  font-weight: 700;
  color: var(--accent-primary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.lifeline-day-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 12px;
  flex-shrink: 0;
}

.lifeline-day-dot {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  box-shadow: 0 0 0 4px var(--accent-glow);
  margin-top: 4px;
}

.lifeline-day-line {
  flex: 1;
  width: 2px;
  min-height: 14px;
  margin-top: 6px;
  border-radius: 2px;
  background: var(--border-color);
}

/* 最后一天：保留底部留白，让主轴自然延伸到结束节点 */
.lifeline-day-body {
  flex: 1;
  min-width: 0;
  padding: 0 0 26px 2px;
}

.lifeline-day-date {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

/* 小节条目：线分支样式（从主轴横向引出，不用卡片） */
.lifeline-chapter {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0 6px 16px;
  margin-bottom: 2px;
}

/* 分支曲线：从主轴平滑弯出指向小节（1/4 椭圆弧，与主轴同宽同色）
 * 注意：描边用整数 2px（亚像素 1.5px + 大圆角在部分浏览器会被光栅化丢弃），
 * 圆角用显式 px（百分比在大圆角下有缩放兼容问题） */
.lifeline-chapter::before {
  content: '';
  position: absolute;
  left: -24px;
  bottom: 50%;
  width: 24px;
  height: 16px;
  border-left: 2px solid var(--border-color);
  border-bottom: 2px solid var(--border-color);
  border-bottom-left-radius: 24px 16px;
  box-sizing: content-box;
  pointer-events: none;
}

/* 当天第一条分支：从更高处大幅弯出（视觉上从节点出发） */
.lifeline-chapter.is-first::before {
  height: 30px;
  border-bottom-left-radius: 24px 30px;
}

/* 分支端点圆点 */
.lifeline-chapter::after {
  content: '';
  position: absolute;
  left: 1px;
  top: 50%;
  transform: translateY(-50%);
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--border-color);
}

/* 学习中：主题色端点 */
.lifeline-chapter.is-studying::after {
  background: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

/* 已完成：绿色端点 */
.lifeline-chapter.is-done::after {
  background: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
}

.lifeline-chapter-label {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.lifeline-chapter-title {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 状态：纯色文字，不做胶囊 */
.lifeline-chapter-status {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.lifeline-chapter.is-studying .lifeline-chapter-status {
  color: var(--accent-primary);
}

.lifeline-chapter.is-done .lifeline-chapter-status {
  color: #22c55e;
}

.lifeline-empty {
  margin: 0;
  padding: 36px 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}

/* ========== 起始节点：主轴起点，指向创建时间 ========== */
.lifeline-start {
  display: flex;
  gap: 16px;
  margin-bottom: 14px;
}

/* 起点圆环：主题色空心，与日期实心渐变点区分 */
.lifeline-start-dot {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 3px solid var(--accent-primary);
  background: var(--bg-card);
  box-sizing: border-box;
}

/* 起始节点文案：垂直居中对准起点圆心 */
.lifeline-start-body {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  height: 12px;
  padding-left: 2px;
}

.lifeline-start-text {
  font-size: 14px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lifeline-start-date {
  font-weight: 700;
  color: var(--accent-primary);
  font-variant-numeric: tabular-nums;
}

/* ========== 结束节点：主轴收尾，指向完结时间 ========== */
.lifeline-end {
  display: flex;
  gap: 16px;
}

/* 终点圆环：空心，与日期实心渐变点区分 */
.lifeline-end-dot {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 3px solid #22c55e;
  background: var(--bg-card);
  box-sizing: border-box;
}

/* 结束节点文案：垂直居中对准终点圆心 */
.lifeline-end-body {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  height: 12px;
  padding-left: 2px;
}

.lifeline-end-text {
  font-size: 14px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lifeline-end-date {
  font-weight: 700;
  color: #22c55e;
  font-variant-numeric: tabular-nums;
}

/* 生命线移动端适配 */
@media (max-width: 900px) {
  .lifeline-wrap {
    padding: 32px 24px;
  }
}

@media (max-width: 600px) {
  .lifeline-wrap {
    padding: 24px 16px;
  }

  .lifeline-day {
    gap: 12px;
  }

  .lifeline-month {
    width: 36px;
    font-size: 11px;
  }

  .lifeline-day-body {
    padding-left: 0;
  }

  /* 分支曲线随间距缩短，起点仍接在主轴上（content-box，外沿 = 宽 + 2px 描边） */
  .lifeline-chapter::before {
    left: -18px;
    width: 22px;
    border-bottom-left-radius: 22px 16px;
  }

  .lifeline-chapter.is-first::before {
    height: 24px;
    border-bottom-left-radius: 22px 24px;
  }
}
</style>
