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

// 翻年
const prevYear = () => { calendarYear.value--; fetchCalendarData() }
const nextYear = () => { calendarYear.value++; fetchCalendarData() }

// 获取日历数据
const fetchCalendarData = async () => {
  calendarLoading.value = true
  try {
    const res = await api.getArticleDayStatics()
    if (res.success && res.data) {
      calendarData.value = res.data
    }
  } catch (error) {
    console.error('获取文章日历数据失败:', error)
  } finally {
    calendarLoading.value = false
  }
}

// 获取文章统计数据
const fetchArticleStatics = async () => {
  try {
    const res = await api.getArticleStatics()
    if (res.success && res.data) {
      articleStats.value = res.data
    }
  } catch (error) {
    console.error('获取文章统计数据失败:', error)
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

onMounted(() => {
  fetchArticleStatics()
  fetchApis()
  fetchCalendarData()
})
</script>

<style scoped src="./AdminDashboard.css"></style>
