<template>
  <AdminLayout>
    <div class="dashboard">
      <header class="content-header">
        <div>
          <h1>仪表盘</h1>
          <p>欢迎回家！</p>
        </div>
      </header>

      <!-- 文章模块 -->
      <section class="module-section">
        <div class="module-header">
          <div class="module-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <h2>文章</h2>
          </div>
          <button class="btn btn-secondary" @click="goToArticles()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
            管理文章
          </button>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon articles">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ articleStats.totalArticles }}</span>
              <span class="stat-label">文章总数</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon published">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ articleStats.publishedArticles }}</span>
              <span class="stat-label">已发布</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon views">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ formatNumber(articleStats.totalViews) }}</span>
              <span class="stat-label">总浏览量</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon likes">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ formatNumber(articleStats.totalLikes) }}</span>
              <span class="stat-label">总点赞量</span>
            </div>
          </div>
        </div>

        <!-- 创作日历 -->
          <div class="calendar-container">
            <div class="calendar-header">
              <h3>创作日历</h3>
            <div class="calendar-nav">
              <button class="calendar-nav-btn" @click="prevYear" :disabled="calendarLoading">&lt;</button>
              <span class="calendar-year">{{ calendarYear }}</span>
              <button class="calendar-nav-btn" @click="nextYear" :disabled="calendarLoading">&gt;</button>
            </div>
          </div>
          <div class="calendar-body">
            <div v-if="calendarLoading" class="calendar-loading">加载中...</div>
            <template v-else>
              <div class="calendar-grid-wrapper">
                <div class="calendar-weekdays">
                  <span v-for="d in weekdays" :key="d">{{ d }}</span>
                </div>
                <div class="calendar-scroll">
                  <!-- 月份标签行 -->
                  <div class="calendar-months" :style="{ display: 'grid', gridTemplateColumns: `repeat(${calendarCols}, 13px)`, gap: '2px' }">
                    <span
                      v-for="(ml, i) in monthLabels"
                      :key="'m'+i"
                      class="calendar-month-label"
                      :style="{ gridColumn: ml.col + ' / span ' + ml.span }"
                    >{{ ml.name }}</span>
                  </div>
                  <!-- 日期网格 -->
                  <div class="calendar-grid" :style="{ gridTemplateColumns: `repeat(${calendarCols}, 13px)` }">
                    <div
                      v-for="(day, idx) in calendarDays"
                      :key="idx"
                      class="calendar-day"
                      :class="[
                        day ? 'level-' + getLevel(day.count) : 'empty',
                        { 'today': day && day.date === todayStr }
                      ]"
                      :data-tooltip="day ? day.date + '：' + day.count + ' 篇' : ''"
                    ></div>
                  </div>
                </div>
              </div>
              <div class="calendar-legend">
                <span class="legend-label">少</span>
                <span class="legend-cell level-0"></span>
                <span class="legend-cell level-1"></span>
                <span class="legend-cell level-2"></span>
                <span class="legend-cell level-3"></span>
                <span class="legend-cell level-4"></span>
                <span class="legend-label">多</span>
              </div>
            </template>
          </div>
        </div>
      </section>

      <!-- 笔记模块 -->
      <section class="module-section">
        <div class="module-header">
          <div class="module-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <h2>笔记</h2>
          </div>
          <button class="btn btn-secondary" @click="goToNotes()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
            管理笔记
          </button>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon notes">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ noteStats.totalNotes }}</span>
              <span class="stat-label">笔记总数</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon learning">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <polyline points="12 7 12 12 15.5 14"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ noteStats.learningNotes }}</span>
              <span class="stat-label">学习中</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon finished">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M8.5 12.5 11 15l4.5-5"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ noteStats.completedNotes }}</span>
              <span class="stat-label">已完成</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon study-days">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ noteStats.monthStudyDays }}</span>
              <span class="stat-label">本月学习天数</span>
            </div>
          </div>
        </div>

        <!-- 学习日历（笔记打卡统计，可切换月份，扁平化展示） -->
        <div class="calendar-container calendar-flat">
          <div class="calendar-header">
            <h3>学习日历</h3>
            <div class="calendar-nav">
              <button class="calendar-nav-btn" @click="shiftNoteMonth(-1)" :disabled="noteCalendarLoading">&lt;</button>
              <span class="calendar-year">{{ noteMonthLabel }}</span>
              <button class="calendar-nav-btn" @click="shiftNoteMonth(1)" :disabled="noteCalendarLoading">&gt;</button>
            </div>
          </div>
          <div class="calendar-body">
            <div v-if="noteCalendarLoading" class="calendar-loading">加载中...</div>
            <template v-else>
              <div class="note-calendar-grid">
                <div
                  v-for="cell in noteCalendarDays"
                  :key="cell.date"
                  class="note-calendar-cell"
                  :class="{
                    'today': cell.date === todayStr,
                    'active': cell.num > 0
                  }"
                  :data-tooltip="cell.date + '：' + cell.num + ' 条'"
                >
                  <span class="note-cal-week">{{ cell.week }}</span>
                  <span class="note-cal-date">{{ cell.day }}</span>
                  <span class="note-cal-count">
                    <template v-if="cell.num > 0">
                      <span class="note-cal-num">{{ cell.num }}</span><span class="note-cal-unit">篇</span>
                    </template>
                  </span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </section>

      <!-- API 模块 -->
      <section class="module-section">
        <div class="module-header">
          <div class="module-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
            </svg>
            <h2>API</h2>
          </div>
          <button class="btn btn-secondary" @click="goToApis()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
            管理 API
          </button>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon apis">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ apiStats.totalApis }}</span>
              <span class="stat-label">API 总数</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon free">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ apiStats.freeApis }}</span>
              <span class="stat-label">免费 API</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon calls">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ apiStats.totalCalls }}</span>
              <span class="stat-label">总调用次数</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon success">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ apiStats.avgSuccessRate }}%</span>
              <span class="stat-label">平均成功率</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../../api/article'
import { getApis } from '../../api/modules'
import AdminLayout from './AdminLayout.vue'

const router = useRouter()
const apiList = ref([])

// 文章统计数据
const articleStats = ref({
  totalArticles: 0,
  publishedArticles: 0,
  totalViews: 0,
  totalLikes: 0
})

// API 统计数据
const apiStats = ref({
  totalApis: 0,
  freeApis: 0,
  totalCalls: 0,
  avgSuccessRate: 0
})

// 笔记统计数据
const noteStats = ref({
  totalNotes: 0,
  learningNotes: 0,
  completedNotes: 0,
  monthStudyDays: 0
})

// 格式化数字
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

// ========== 创作日历 ==========
const calendarData = ref({})       // { 'yyyy-MM-dd': count }
const calendarLoading = ref(false)
const calendarYear = ref(new Date().getFullYear())
const weekdays = ['一', '二', '三', '四', '五', '六', '日']
const todayStr = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

// 闰年判断
const isLeapYear = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0

// 格式化为 yyyy-MM-dd
const fmtDate = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

// 格式化为 yyyy-MM
const fmtMonth = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

// 计算开头需要填充的空格数（让第一列是周一）
const calcStartPad = (year) => {
  const jan1 = new Date(year, 0, 1)
  // getDay: 0=Sun → 偏移 6, 1=Mon → 偏移 0, ..., 6=Sat → 偏移 5
  return (jan1.getDay() + 6) % 7
}

// 总列数（周数）
const calendarCols = computed(() => {
  const pad = calcStartPad(calendarYear.value)
  const totalDays = isLeapYear(calendarYear.value) ? 366 : 365
  return Math.ceil((pad + totalDays) / 7)
})

// 生成扁平日期数组
const calendarDays = computed(() => {
  const year = calendarYear.value
  const data = calendarData.value
  const days = []
  const startPad = calcStartPad(year)

  // 开头填充
  for (let i = 0; i < startPad; i++) days.push(null)

  const total = isLeapYear(year) ? 366 : 365
  for (let i = 0; i < total; i++) {
    const d = new Date(year, 0, i + 1)
    const dateStr = fmtDate(year, d.getMonth(), d.getDate())
    days.push({ date: dateStr, count: data[dateStr] || 0 })
  }

  // 末尾补齐整行
  const tail = (7 - (days.length % 7)) % 7
  for (let i = 0; i < tail; i++) days.push(null)

  return days
})

// 一年中的第几天（0-indexed，1月1日=0）
const dayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 1)
  return Math.floor((date - start) / 86400000)
}

// 月份标签：计算每个月的起始列和跨度
const monthLabels = computed(() => {
  const year = calendarYear.value
  const startPad = calcStartPad(year)
  const labels = []

  for (let m = 0; m < 12; m++) {
    const firstDay = new Date(year, m, 1)
    const lastDay = new Date(year, m + 1, 0)
    const firstPos = startPad + dayOfYear(firstDay)
    const lastPos = startPad + dayOfYear(lastDay)
    const startCol = Math.floor(firstPos / 7) + 1
    const endCol = Math.floor(lastPos / 7) + 1

    labels.push({
      name: (m + 1) + '月',
      col: startCol,
      span: endCol - startCol + 1
    })
  }

  return labels
})

// 颜色等级
const getLevel = (count) => {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 4) return 2
  if (count <= 6) return 3
  return 4
}

// 翻年（days 数据已包含全年份，切换年份无需重新请求）
const prevYear = () => { calendarYear.value-- }
const nextYear = () => { calendarYear.value++ }

// 获取文章统计数据（一次请求同时更新统计卡片与日历，days 取自 queryArticleStatics）
const fetchArticleStatics = async () => {
  calendarLoading.value = true
  try {
    const res = await api.getArticleStatics()
    if (res.success && res.data) {
      articleStats.value = res.data
      calendarData.value = res.data.days || {}
    }
  } catch (error) {
    console.error('获取文章统计数据失败:', error)
  } finally {
    calendarLoading.value = false
  }
}

// 获取 API 列表
const fetchApis = async () => {
  try {
    const res = await getApis()
    if (res.success) {
      apiList.value = res.data
      // 计算 API 统计数据
      const totalApis = apiList.value.length
      const freeApis = apiList.value.filter(a => a.isFree).length
      const totalCalls = apiList.value.reduce((sum, a) => {
        const calls = a.stats?.calls || '0'
        if (calls.includes('M')) return sum + parseFloat(calls) * 1000000
        if (calls.includes('K')) return sum + parseFloat(calls) * 1000
        return sum + parseInt(calls)
      }, 0)
      const avgSuccessRate = apiList.value.length > 0
        ? (apiList.value.reduce((sum, a) => sum + (a.stats?.successRate || 0), 0) / apiList.value.length).toFixed(1)
        : 0
      
      apiStats.value = {
        totalApis,
        freeApis,
        totalCalls: formatNumber(totalCalls),
        avgSuccessRate
      }
    }
  } catch (error) {
    console.error('获取 API 列表失败:', error)
  }
}

const goToArticles = () => {
  router.push('/admin/published')
}

const goToApis = () => {
  router.push('/admin/apis')
}

const goToNotes = () => {
  router.push('/admin/notes')
}

// ========== 学习日历（笔记打卡统计） ==========
const noteCalendarLoading = ref(false)
const noteMonth = ref(fmtMonth(new Date()))   // 当前月份 'yyyy-MM'
const noteDays = ref({})                       // { 'yyyy-MM-dd': num }

// 月份标题
const noteMonthLabel = computed(() => {
  const [y, m] = noteMonth.value.split('-')
  return `${y}年${Number(m)}月`
})

// 生成当月日期（平铺成一行，每个格子带星期几）
const noteCalendarDays = computed(() => {
  const [y, m] = noteMonth.value.split('-').map(Number)
  const total = new Date(y, m, 0).getDate()
  const weekNames = ['日', '一', '二', '三', '四', '五', '六']
  const cells = []

  for (let d = 1; d <= total; d++) {
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({
      day: d,
      date: dateStr,
      week: weekNames[new Date(y, m - 1, d).getDay()],
      num: noteDays.value[dateStr] || 0
    })
  }

  return cells
})

// 切换月份
const shiftNoteMonth = (delta) => {
  const [y, m] = noteMonth.value.split('-').map(Number)
  noteMonth.value = fmtMonth(new Date(y, m - 1 + delta, 1))
  fetchNoteStatics()
}

// 获取笔记统计数据：请求 queryNoteStatics?month=yyyy-MM
// 返回 total(总数)、studying(学习中)、finish(已完成)、monthStudy(本月学习天数)、days([{ day, num }])
const fetchNoteStatics = async () => {
  noteCalendarLoading.value = true
  try {
    const res = await api.getNoteStatics(noteMonth.value)
    const data = (res && res.data) || {}
    noteStats.value = {
      totalNotes: data.total || 0,
      learningNotes: data.studying || 0,
      completedNotes: data.finish || 0,
      monthStudyDays: data.monthStudy || 0
    }
    const map = {}
    if (Array.isArray(data.days)) {
      data.days.forEach((item) => {
        if (!item) return
        const raw = String(item.day ?? '').trim()
        if (!raw) return
        // 兼容完整日期(yyyy-MM-dd)或仅日号(如 "5")两种返回
        let key = raw.slice(0, 10)
        if (!key.includes('-')) {
          const d = Number(raw)
          if (!d) return
          key = `${noteMonth.value}-${String(d).padStart(2, '0')}`
        }
        map[key] = Number(item.num) || 0
      })
    }
    noteDays.value = map
  } catch (error) {
    console.error('获取笔记统计数据失败:', error)
  } finally {
    noteCalendarLoading.value = false
  }
}

onMounted(() => {
  fetchArticleStatics()
  fetchApis()
  fetchNoteStatics()
})
</script>

<style scoped src="./AdminDashboard.css"></style>
