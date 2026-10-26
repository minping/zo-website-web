<template>
  <div>
    <!-- 小节内容卡片（样式与摇一摇页的结果卡片一致） -->
    <div class="result-card">
      <div class="result-meta">
        <span class="result-note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          <span class="result-note-name">{{ noteName || '未命名笔记' }}</span>
        </span>
      </div>

      <div class="page-header">
        <span class="page-label">本节内容</span>
        <h2 class="page-title">{{ chapterTitle || (detailLoading ? '加载中…' : '未命名') }}</h2>
      </div>

      <!-- 小节正文：取消关注也不隐藏，内容始终可见 -->
      <p v-if="detailLoading" class="card-tip">内容加载中…</p>
      <div v-else class="md-body-wrap" @click="handleImageClick">
        <div class="md-body" v-html="renderedContent"></div>
      </div>

      <!-- 关注操作：取消关注 / 重点关注 -->
      <div v-if="chapterId" class="follow-bar">
        <!-- 其中一个被点亮时隐藏另一个：只有两者都未点亮才同时显示 -->
        <button
          v-if="!focused"
          type="button"
          class="follow-btn follow-btn-cancel"
          :class="{ 'is-done': unfollowed }"
          :disabled="followLock || detailLoading"
          :title="unfollowed ? '恢复对本节知识的关注' : '不再关注本节知识'"
          @click="handleToggleFollow"
        >
          <!-- 取消关注态：图标为睁眼且文案为“恢复关注”；未取消时为闭眼 + “取消关注” -->
          <svg v-if="unfollowed" class="follow-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <svg v-else class="follow-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
            <path d="M1 1l22 22"/>
          </svg>
          <span class="follow-btn-text">{{ followLock ? '处理中…' : (unfollowed ? '恢复关注' : '取消关注') }}</span>
        </button>

        <button
          v-if="!unfollowed"
          type="button"
          class="follow-btn follow-btn-focus"
          :class="{ 'is-active': focused }"
          :disabled="focusLock || detailLoading"
          :title="focused ? '取消重点关注' : '标记为重点，优先安排复习'"
          @click="toggleFocus"
        >
          <svg
            class="follow-btn-icon"
            viewBox="0 0 24 24"
            :fill="focused ? 'currentColor' : 'none'"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span class="follow-btn-text">{{ focusLock ? '处理中…' : (focused ? '取消重点' : '重点关注') }}</span>
        </button>
      </div>

      <!-- 学习打卡：relationId 为小节 id -->
      <section v-if="chapterId && !detailLoading" class="result-checkin">
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
            :class="['rating-' + opt.key, { 'is-pressed': pressedRating === opt.value }]"
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

    <!-- 轻提示 -->
    <transition name="toast-pop">
      <div v-if="toast" class="random-toast">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        {{ toast }}
      </div>
    </transition>

    <!-- 图片查看器（点击正文图片放大预览） -->
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import api from '../api/article.js'
import { renderMarkdown } from '../utils/markdown.js'
import { burstConfetti } from '../utils/confetti.js'

// 通用小节卡片：调用方只需传小节 id，
// 组件内部按 id 自行加载详情（笔记名 / 标题 / 正文 / 关注状态）与打卡数据
const props = defineProps({
  // 小节 id，同时作为打卡的 relationId
  chapterId: { type: String, default: '' }
})

const emit = defineEmits(['checked', 'follow-change'])

// ========== 小节详情：按 chapterId 内部加载 ==========
const detailLoading = ref(false)
const noteName = ref('')
const chapterTitle = ref('')
const chapterContent = ref('')
// 切换小节时忽略迟到的旧响应
let detailRequestSeq = 0

const renderedContent = computed(() => renderMarkdown(chapterContent.value))

const resetChapter = () => {
  noteName.value = ''
  chapterTitle.value = ''
  chapterContent.value = ''
}

// ========== 关注操作：取消关注 / 重点关注 ==========
// followType 取值统一：1 点亮该状态，0 取消点亮
const FLAG_ON = 1
const FLAG_OFF = 0

// 0 否 / 1 是
const isYes = (v) => Number(v) === 1

// unfollowed 已取消关注（不再隐藏内容，仅作为按钮状态）、focused 已设为重点关注
// 由 loadChapter 按详情接口的 is_ban / is_like 填充
const unfollowed = ref(false)
const focused = ref(false)
const followLock = ref(false)
const focusLock = ref(false)

// 取消关注 / 恢复关注：POST /index/study/saveStudyBan
// 传参沿用该接口原有字段（relationId + 关联类型），
// followType：点亮取消关注传 1，取消点亮（恢复关注）传 0
const setFollow = async (isBan) => {
  const relationId = props.chapterId ? String(props.chapterId) : ''
  if (!relationId) return false
  try {
    const res = await api.saveStudyBan({
      relationId,
      relationTypeText: '笔记',
      relationTypeValue: '2',
      followType: isBan ? FLAG_ON : FLAG_OFF
    })
    return !!(res && (res.success === true || res.code === 200 || res.code === 0))
  } catch (e) {
    console.error('保存关注状态失败', e)
    return false
  }
}

// 重点关注：POST /index/study/saveStudyLike（传参与取消关注一致）
const saveLike = async (followType) => {
  const relationId = props.chapterId ? String(props.chapterId) : ''
  if (!relationId) return false
  try {
    const res = await api.saveStudyLike({ relationId, followType })
    return !!(res && (res.success === true || res.code === 200 || res.code === 0))
  } catch (e) {
    console.error('保存重点关注失败', e)
    return false
  }
}

// 取消关注 <-> 恢复关注：按当前状态取反（内容始终可见，只改关注状态）
const handleToggleFollow = async () => {
  if (followLock.value) return
  const next = !unfollowed.value
  followLock.value = true
  const ok = await setFollow(next)
  followLock.value = false
  if (!ok) {
    showToast('操作失败，请稍后重试')
    return
  }
  unfollowed.value = next
  if (next) focused.value = false
  showToast(next ? '已取消关注本节知识' : '已恢复关注本节知识')
  emit('follow-change', { relationId: props.chapterId, unfollowed: next, focused: next ? false : focused.value })
}

// 重点关注：点击切换，再点一次取消重点关注
const toggleFocus = async () => {
  if (focusLock.value || unfollowed.value) return
  focusLock.value = true
  const next = !focused.value
  const ok = await saveLike(next ? FLAG_ON : FLAG_OFF)
  focusLock.value = false
  if (!ok) {
    showToast('操作失败，请稍后重试')
    return
  }
  focused.value = next
  showToast(next ? '已设为重点关注' : '已取消重点关注')
  emit('follow-change', { relationId: props.chapterId, unfollowed: false, focused: next })
}

// ========== 学习打卡 ==========
const studyRecordsLoading = ref(false)
// 后端字段：totalCount 累计学习、totalTiming 累计学习时长(HH:mm:ss)、
// nextReviewTime 推荐下次复习时间(yyyy-MM-dd HH:mm)
const studyStats = ref({ totalCount: 0, totalTiming: '00:00:00', nextReviewTime: '' })
// 记忆留存率曲线：{ noReviewSeries: [{x,y}], withReviewSeries: [{x,y}] }（x=天数，y=留存率）
const retentionLine = ref({ noReviewSeries: [], withReviewSeries: [] })
// 当前小节是否首次学习：取 queryStudyRecord 接口返回的 isFirst
const studyIsFirst = ref(false)
const sessionStartAt = ref(Date.now())
const elapsedSec = ref(0)
const checkinLock = ref(false)
const pressedRating = ref(null)
const burstRoot = ref(null)
const toast = ref('')
let pressedTimer = null
let checkinTimer = null
let toastTimer = null
let checkinRequestSeq = 0

const pad2 = (n) => String(n).padStart(2, '0')

// 打卡时长展示（如：45秒 / 12分 / 1小时20分）
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

const showToast = (msg) => {
  toast.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2200)
}

// 本次学习实时计时（HH:MM:SS）
const sessionClock = computed(() => {
  const s = elapsedSec.value
  return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`
})

// 推荐下次复习时间：后端返回 'yyyy-MM-dd HH:mm'，省略年份显示为 'MM-dd HH:mm'
const nextReviewText = computed(() => {
  const v = studyStats.value.nextReviewTime
  if (!v) return '暂无'
  return v.length >= 16 ? v.slice(5) : v
})

const ratingOptions = [
  { key: 'again', text: 'Again', sub: '重来', value: 1 },
  { key: 'hard', text: 'Hard', sub: '困难', value: 2 },
  { key: 'good', text: 'Good', sub: '良好', value: 3 },
  { key: 'easy', text: 'Easy', sub: '简单', value: 4 }
]

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

// 按小节 id 加载详情：GET /index/notes/queryChapter?id=
// 返回字段用到 name(笔记名) / full_title 或 title(标题) / content(正文) /
// is_ban(是否已取消关注) / is_like(是否已重点关注)
const loadChapter = async (id) => {
  if (!id) {
    resetChapter()
    detailLoading.value = false
    return
  }
  const seq = ++detailRequestSeq
  detailLoading.value = true
  try {
    const res = await api.queryChapterDetail(id)
    if (seq !== detailRequestSeq) return
    const ok = !!(res && (res.success === true || res.code === 200 || res.code === 0))
    const data = ok && res.data && typeof res.data === 'object' ? res.data : {}
    noteName.value = typeof data.name === 'string' ? data.name : ''
    // full_title 形如「Gateway: 过滤器」，优先展示完整的
    chapterTitle.value = data.full_title || data.title || ''
    chapterContent.value = typeof data.content === 'string' ? data.content : ''
    unfollowed.value = isYes(data.is_ban)
    focused.value = isYes(data.is_like)
  } catch (e) {
    console.error('加载小节详情失败', e)
    if (seq === detailRequestSeq) resetChapter()
  } finally {
    if (seq === detailRequestSeq) detailLoading.value = false
  }
}

// 加载当前小节历史记录与后端统计字段
const loadStudyRecords = async (relationId) => {
  if (!relationId) {
    retentionLine.value = { noReviewSeries: [], withReviewSeries: [] }
    studyIsFirst.value = false
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
    studyStats.value = {
      totalCount: Number(data.totalCount) || 0,
      totalTiming: typeof data.totalTiming === 'string' && data.totalTiming ? data.totalTiming : '00:00:00',
      nextReviewTime: typeof data.nextReviewTime === 'string' ? data.nextReviewTime : ''
    }
    // isFirst 由后端给出（历史记录为空即为首次学习）
    studyIsFirst.value = data.isFirst === true || data.isFirst === 'true'
    const line = data.line && typeof data.line === 'object' ? data.line : {}
    retentionLine.value = {
      noReviewSeries: Array.isArray(line.noReviewSeries) ? line.noReviewSeries : [],
      withReviewSeries: Array.isArray(line.withReviewSeries) ? line.withReviewSeries : []
    }
  } catch (e) {
    console.error('查询打卡历史失败', e)
    if (seq === checkinRequestSeq) retentionLine.value = { noReviewSeries: [], withReviewSeries: [] }
  } finally {
    if (seq === checkinRequestSeq) studyRecordsLoading.value = false
  }
}

const startCheckinTimer = () => {
  if (checkinTimer) clearInterval(checkinTimer)
  checkinTimer = setInterval(() => {
    elapsedSec.value = Math.max(0, Math.round((Date.now() - sessionStartAt.value) / 1000))
  }, 1000)
}

const stopCheckinTimer = () => {
  if (checkinTimer) clearInterval(checkinTimer)
  checkinTimer = null
}

const handleCheckin = async (option, event) => {
  const relationId = props.chapterId ? String(props.chapterId) : ''
  if (!relationId || checkinLock.value) return
  checkinLock.value = true
  const now = Date.now()
  const sec = Math.max(1, Math.round((now - sessionStartAt.value) / 1000))
  const ratingValue = option ? option.value : 3
  const ratingText = option ? option.text : 'Good'
  const isFirst = studyIsFirst.value
  // 礼花锚点元素：必须在 await 之前取，事件派发结束后 event.currentTarget 会被置空
  const burstEl = event && event.currentTarget
  // 点击反馈：标记被点中的按钮，播放一次按压动画
  pressedRating.value = option ? option.value : null
  if (pressedTimer) clearTimeout(pressedTimer)
  pressedTimer = setTimeout(() => { pressedRating.value = null }, 360)

  let ok = false
  try {
    const res = await api.saveStudyRecord({
      relationId,
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
    showToast('保存失败，请稍后重试')
    setTimeout(() => { checkinLock.value = false }, 1000)
    return
  }

  // 打卡成功：重新拉取历史记录，并开启新一轮计时
  sessionStartAt.value = now
  elapsedSec.value = 0
  showToast(`打卡成功（${ratingText}），本次学习 ${formatDuration(sec)}`)
  burstConfetti(burstRoot.value, burstEl)
  loadStudyRecords(relationId)
  emit('checked', { relationId, ratingText, sec })
  setTimeout(() => { checkinLock.value = false }, 1000)
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

const zoomIn = () => { imageScale.value = Math.min(MAX_SCALE, imageScale.value + ZOOM_STEP) }
const zoomOut = () => { imageScale.value = Math.max(MIN_SCALE, imageScale.value - ZOOM_STEP) }
const resetZoom = () => { imageScale.value = 1 }

const handleImageWheel = (e) => {
  const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP
  imageScale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, imageScale.value + delta))
}

const handleKeyDown = (e) => {
  if (e.key === 'Escape') closeImageViewer()
}

// 切换小节：重置打卡态、开启新一轮计时并加载该小节记录
watch(
  () => props.chapterId,
  (id) => {
    // 换小节：重置关注与打卡态（关注状态由 loadChapter 拉到详情后填充）
    detailRequestSeq++ // 作废上一次未完成的详情请求
    unfollowed.value = false
    focused.value = false
    followLock.value = false
    focusLock.value = false
    studyStats.value = { totalCount: 0, totalTiming: '00:00:00', nextReviewTime: '' }
    retentionLine.value = { noReviewSeries: [], withReviewSeries: [] }
    studyIsFirst.value = false
    sessionStartAt.value = Date.now()
    elapsedSec.value = 0
    if (id) {
      startCheckinTimer()
      loadStudyRecords(id)
      loadChapter(id)
    } else {
      stopCheckinTimer()
      resetChapter()
      detailLoading.value = false
    }
  },
  { immediate: true }
)

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  stopCheckinTimer()
  if (pressedTimer) clearTimeout(pressedTimer)
  if (toastTimer) clearTimeout(toastTimer)
})
</script>

<style scoped>
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
.md-body-wrap {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
}

/* 详情加载中的占位提示 */
.card-tip {
  margin: 8px 0 0;
  font-size: 14px;
  color: var(--text-muted);
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
/* ========== 关注操作：取消关注 / 重点关注 ========== */
/* 取消关注靠左、重点关注靠右；
   用 auto 外边距而非 space-between，这样只剩一个按钮时它仍留在自己那一侧，不会跳到中间/另一边 */
.follow-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 28px;
}

.follow-btn-focus {
  margin-left: auto;
}

.follow-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-card);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, color 0.2s ease,
    border-color 0.2s ease, background 0.2s ease, opacity 0.2s ease;
}

.follow-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  box-shadow: 0 8px 20px -12px var(--accent-primary);
}

.follow-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.97);
}

.follow-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.follow-btn-icon {
  width: 16px;
  height: 16px;
}

/* 取消关注：负向操作，hover 转为警示色 */
.follow-btn-cancel:hover:not(:disabled) {
  border-color: #f43f5e;
  color: #f43f5e;
  box-shadow: 0 8px 20px -12px rgba(244, 63, 94, 0.6);
}

/* 已取消关注：按钮转为「恢复关注」，用主题色提示可以点回来 */
.follow-btn-cancel.is-done {
  color: var(--accent-primary);
  background: var(--accent-glow);
  border-color: color-mix(in srgb, var(--accent-primary) 45%, transparent);
}

.follow-btn-cancel.is-done:hover:not(:disabled) {
  border-color: var(--accent-primary);
  box-shadow: 0 8px 20px -12px var(--accent-primary);
}

/* 重点关注已激活：主题渐变实心 + 实心星标 */
.follow-btn-focus.is-active {
  color: #fff;
  border-color: transparent;
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
  box-shadow: 0 10px 24px -12px var(--accent-primary), 0 0 0 1px var(--accent-glow);
}

.follow-btn-focus.is-active:hover:not(:disabled) {
  color: #fff;
  border-color: transparent;
  box-shadow: 0 14px 30px -12px var(--accent-primary), 0 0 0 1px var(--accent-primary);
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
  border-color: currentColor;
  box-shadow: 0 6px 16px -10px currentColor;
}

.rating-btn:active:not(:disabled) {
  transform: scale(0.97);
}

.rating-btn:disabled {
  cursor: not-allowed;
}

/* 点击反馈：一次轻微按压回弹，不做悬浮位移 */
.rating-btn.is-pressed {
  animation: rating-press 0.34s ease;
}

@keyframes rating-press {
  0% { transform: scale(1); }
  35% { transform: scale(0.93); }
  70% { transform: scale(1.03); }
  100% { transform: scale(1); }
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

  .checkin-stat {
    padding: 14px 0;
  }

  .retention-wrap {
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

  /* 关注操作移动端适配 */
  .follow-bar {
    gap: 10px;
    margin-top: 22px;
  }

  .follow-btn {
    padding: 9px 16px;
    font-size: 13px;
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
