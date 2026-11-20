<template>
  <div class="study-domain-page">
    <!-- 背景效果 -->
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>
    <!-- 主题背景装饰 -->
    <BgScenery />

    <!-- 导航栏 -->
    <Navbar activeMenu="学习域" />

    <!-- 页面主体 -->
    <main class="page-main">
      <div class="container">
        <div class="domain-head">
          <h1 class="domain-title">学习域</h1>
          <span class="domain-sub">记忆宫殿</span>
        </div>

        <!-- 本周每日学习概况：周一 ~ 周日柱状图 -->
        <div class="week-chart">
          <div class="week-chart-head">
            <span class="week-chart-title">本周学习</span>
            <span class="week-chart-total">共 {{ weekTotal }} 节</span>
          </div>
          <p v-if="weekLoading" class="week-chart-tip">数据加载中…</p>
          <p v-else-if="weekError" class="week-chart-tip">本周学习数据暂不可用</p>
          <div v-else class="week-chart-bars">
            <div
              v-for="d in weekBars"
              :key="d.full"
              class="week-bar-item"
              :class="{ 'is-today': d.isToday }"
              :title="`${d.short} 学习 ${d.num} 节`"
            >
              <span class="week-bar-num" :class="{ 'is-zero': d.num === 0 }">{{ d.num }}</span>
              <div class="week-bar-track">
                <div class="week-bar" :style="{ height: barHeight(d.num) }"></div>
              </div>
              <span class="week-bar-label">{{ d.label }}</span>
            </div>
          </div>
        </div>

        <!-- 指标表格：2 列 4 行 -->
        <p v-if="loading" class="stats-tip">数据加载中…</p>
        <div v-else-if="loadError" class="stats-tip">
          <span>{{ loadError }}</span>
          <button type="button" class="stats-retry" @click="loadStudyDomain">重新加载</button>
        </div>
        <div v-else class="stats-table">
          <div
            v-for="item in statCards"
            :key="item.key"
            class="stat-cell"
            :class="['stat-' + item.key, { 'is-active': activeKey === item.key }]"
            role="button"
            tabindex="0"
            :title="`查看${item.label}列表`"
            @click="toggleCell(item)"
            @keydown.enter.prevent="toggleCell(item)"
          >
            <div class="stat-cell-top">
              <span
                class="stat-icon"
                :class="{ 'is-attention': item.key === 'review' && item.value > 0 }"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                  v-html="item.icon"
                ></svg>
              </span>
              <span class="stat-label">{{ item.label }}</span>
            </div>
            <div class="stat-cell-value">
              <span class="stat-num">{{ item.value }}</span>
              <span v-if="item.unit" class="stat-unit">{{ item.unit }}</span>
            </div>
            <span class="stat-desc">{{ item.desc }}</span>
          </div>
        </div>

        <!-- 点击格子后展示对应列表（接口暂定，字段：标题 / 复习时间） -->
        <section v-if="activeCard" class="domain-list">
          <div class="domain-list-head">
            <span class="domain-list-title">
              {{ activeCard.label }}
              <em v-if="!listLoading">共 {{ listItems.length }} 条</em>
            </span>
            <button type="button" class="domain-list-close" @click="closeList">收起</button>
          </div>

          <p v-if="listLoading" class="domain-list-tip">列表加载中…</p>
          <ul v-else-if="listItems.length" class="domain-list-items">
            <li
              v-for="(row, i) in listItems"
              :key="i"
              class="domain-list-item"
              :class="{ 'is-open': detailId === getRowId(row) }"
              role="button"
              tabindex="0"
              title="点击查看本节内容"
              @click="openDetail(row)"
              @keydown.enter.prevent="openDetail(row)"
            >
              <span class="item-title" :title="row.title">{{ row.title }}</span>
              <span class="item-time" v-if="row.next_review">{{ formatReviewTime(row.next_review) }}</span>
            </li>
          </ul>
          <p v-else class="domain-list-tip">暂无数据</p>
        </section>

        <!-- 点击列表项后展示该小节内容：只传 id，正文 / 关注状态 / 打卡都由组件自行加载 -->
        <StudyChapterCard
          v-if="detailId"
          :chapter-id="detailId"
          @checked="handleChapterChecked"
        />
      </div>
    </main>

    <!-- 回到顶部：滚动超过 300px 后出现，平滑滚回页面顶部 -->
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

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '../api/article.js'
import Navbar from './Navbar.vue'
import Footer from './Footer.vue'
import BgScenery from './BgScenery.vue'
import StudyChapterCard from './StudyChapterCard.vue'

// 指标定义：field 对应 /index/study/queryStudyDomain 返回的字段名
// type 对应 /index/study/queryStudyDomainNoticeList 的类型参数（0-5）
const statCards = ref([
  {
    key: 'review', field: 'todayNeedStudyCount', type: 1, label: '今日需复习', value: 0, unit: '节', desc: '今天需复习的小节, 快来学习!',
    // 需复习：闹钟（到期待复习）
    icon: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/>'
  },
  {
    key: 'learned', field: 'todayStudyCount', type: 0, label: '今日已学习', value: 0, unit: '节', desc: '今天已学习的小节, 真棒!',
    // 已学习：翻开的书
    icon: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'
  },
  {
    key: 'building', field: 'ing', type: 2, label: '记忆构建', value: 0, unit: '个', desc: '正在形成长期记忆, 继续努力!',
    // 记忆构建：层叠（搭建中）
    icon: '<path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>'
  },
  {
    key: 'solid', field: 'finish', type: 3, label: '记忆牢固', value: 0, unit: '个', desc: '记忆稳定度相对达标, 有空记得回来复习!',
    // 记忆牢固：盾牌打勾
    icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>'
  },
  {
    key: 'hard', field: 'hard', type: 4, label: '难标记', value: 0, unit: '次', desc: '头次学习标记为 Again',
    // 难标记：火焰
    icon: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>'
  },
  {
    key: 'easy', field: 'easy', type: 5, label: '易标记', value: 0, unit: '次', desc: '最近连续三次标记为 Easy',
    // 易标记：星光
    icon: '<path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z"/>'
  },
  // 关注状态统计：取自 queryStudyDomain 的 flow / cancelFlow
  {
    key: 'flow', field: 'flow', type: 6, label: '重点关注', value: 0, unit: '节', desc: '你的重点关注',
    // 重点关注：五角星
    icon: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>'
  },
  {
    key: 'cancelflow', field: 'cancelFlow', type: 7, label: '取消关注', value: 0, unit: '节', desc: '已取消关注的小节, 太简单不值得回看!',
    // 取消关注：圆圈减号
    icon: '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/>'
  }
])

const loading = ref(true)
const loadError = ref('')

const loadStudyDomain = async (silent = false) => {
  // silent 静默刷新：不显示加载态、保留旧数据，适合打卡后的自动刷新
  if (!silent) loading.value = true
  loadError.value = ''
  try {
    const res = await api.queryStudyDomain()
    const ok = !!(res && (res.success === true || res.code === 200 || res.code === 0))
    const data = ok && res.data && typeof res.data === 'object' ? res.data : null
    if (!data) {
      loadError.value = '学习数据加载失败'
      return
    }
    // todayStudyCount 后端按字符串返回，其余为数字，这里统一转为数字
    statCards.value = statCards.value.map((item) => ({
      ...item,
      value: Number(data[item.field]) || 0
    }))
  } catch (e) {
    console.error('查询学习域数据失败', e)
    loadError.value = '学习数据加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// ========== 点击格子查看对应列表（接口暂定） ==========
const activeKey = ref('')
const listItems = ref([])
const listLoading = ref(false)

const activeCard = computed(() =>
  statCards.value.find((item) => item.key === activeKey.value) || null
)

// 复习时间：'yyyy-MM-dd HH:mm' 省略年份显示为 'MM-dd HH:mm'；
// 后端也可能直接给「10月24日 08:55」这类已格式化文本，原样展示
// 复习时间为空则不展示（列表项只显示标题）
const formatReviewTime = (v) => {
  if (!v) return ''
  return String(v);
}



// type: 0-7，对应上面的 8 个类别（6 重点关注 / 7 取消关注 为暂定，按后端实际取值调整）
// 注意：某些类别本来就可能没有数据，接口异常/空结果一律按空列表处理，不提示「加载失败」
const loadList = async (type, silent = false) => {
  if (!silent) listLoading.value = true
  // 静默刷新时保留旧列表，拿到新数据后整体替换
  if (!silent) listItems.value = []
  try {
    const res = await api.queryStudyDomainNoticeList(type)
    const ok = !!(res && (res.success === true || res.code === 200 || res.code === 0))
    const data = ok ? res.data : null
    // 兼容两种返回结构：数组 或 { list: [...] }
    listItems.value = Array.isArray(data)
      ? data
      : (data && Array.isArray(data.list) ? data.list : [])
  } catch (e) {
    console.warn('学习域列表暂无数据或请求异常', e)
    listItems.value = []
  } finally {
    listLoading.value = false
  }
}

// 点击格子：已选中则收起，否则切换并加载对应列表
const toggleCell = (item) => {
  if (activeKey.value === item.key) {
    closeList()
    return
  }
  activeKey.value = item.key
  // 切换指标：列表内容换了，收起上一个类别展开的小节内容
  closeDetail()
  loadList(item.type)
}

const closeList = () => {
  activeKey.value = ''
  listItems.value = []
  closeDetail()
}

// ========== 打卡成功后的自动刷新 ==========
// 卡片内打卡成功（checked 事件）后等待 1 秒（给后端落库留时间），
// 静默刷新：8 格指标数量 + 当前展开的列表 + 本周概况（不闪加载态、保留旧数据），
// 同时收起下方已展开的小节内容卡片
let refreshTimer = null
const handleChapterChecked = () => {
  if (refreshTimer) clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => {
    refreshTimer = null
    loadStudyDomain(true)
    const active = statCards.value.find((item) => item.key === activeKey.value)
    if (active) loadList(active.type, true)
    loadWeekStudy(true)
    closeDetail()
  }, 1000)
}

// ========== 点击列表项：展示该小节内容 + 打卡 ==========
// 小节 id（也即打卡用的 relationId）：接口当前返回 id，
// 后端若改用 zo_website_note_chapter_id / chapterId 也能直接兼容
const getRowId = (row) => {
  const v = row && (row.zo_website_note_chapter_id ?? row.chapterId ?? row.id)
  return v == null ? '' : String(v)
}

// 当前展开的小节 id：内容 / 关注状态 / 打卡都由 StudyChapterCard 按 id 自行加载
const detailId = ref('')

const openDetail = (row) => {
  const id = getRowId(row)
  if (!id) return
  // 再点同一项则收起
  detailId.value = detailId.value === id ? '' : id
}

const closeDetail = () => {
  detailId.value = ''
}

// ========== 本周每日学习概况 ==========
// 周一 ~ 周日 7 天骨架，并标记今天
const buildWeekSkeleton = () => {
  const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const monday = new Date(today)
  // 周日 getDay() 为 0，视为第 7 天，统一回退到本周周一
  monday.setDate(monday.getDate() - (monday.getDay() || 7) + 1)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return {
      label: labels[i],
      full: `${d.getFullYear()}-${mm}-${dd}`,
      short: `${mm}-${dd}`,
      num: 0,
      isToday: d.getTime() === today.getTime()
    }
  })
}

const weekBars = ref(buildWeekSkeleton())
const weekLoading = ref(true)
const weekError = ref(false)

const weekTotal = computed(() => weekBars.value.reduce((s, d) => s + d.num, 0))
const weekMax = computed(() => Math.max(...weekBars.value.map((d) => d.num), 1))

// 柱高：有数据按占比（最低 16%），无数据给 3px 小柱占位
const barHeight = (num) =>
  num > 0 ? `${Math.max(16, Math.round((num / weekMax.value) * 100))}%` : '3px'

// 兼容三种元素形态：基础值（数字/字符串，如 ["4","2"]）、对象行（{ num }）、非法值
const parseWeekNum = (row) => {
  if (row == null) return 0
  if (typeof row === 'number' || typeof row === 'string') return Number(row) || 0
  return Number(row.num ?? row.count ?? row.studyCount ?? row.studyNum ?? row.value) || 0
}

// 按 'yyyy-MM-dd' / 'MM-dd' / 数字下标 匹配到对应星期
const matchWeekIndex = (key, fallback) => {
  if (/^\d$/.test(key)) return Number(key)
  const idx = weekBars.value.findIndex(
    (d) => d.full === key || d.short === key || d.full.endsWith('-' + key)
  )
  return idx >= 0 ? idx : fallback
}

// 【临时】假数据预览开关：真实接口联调通过后改为 false（或整段删除）
const USE_MOCK_WEEK = false
const MOCK_WEEK_NUMS = [1, 3, 7, 0, 4, 6, 2] // 周一 ~ 周日，今天(周三)为 7 用于看高亮效果

const loadWeekStudy = async (silent = false) => {
  if (!silent) weekLoading.value = true
  weekError.value = false
  // 静默刷新时保留旧数据，避免柱子闪回 0
  if (!silent) weekBars.value = buildWeekSkeleton()
  if (USE_MOCK_WEEK) {
    MOCK_WEEK_NUMS.forEach((n, i) => {
      if (i < 7) weekBars.value[i].num = n
    })
    weekLoading.value = false
    return
  }
  try {
    const res = await api.queryWeekStudy()
    const ok = !!(res && (res.success === true || res.code === 200 || res.code === 0))
    const data = ok ? res.data : null
    if (!data) {
      weekError.value = true
      return
    }
    if (Array.isArray(data)) {
      // 1. 数组：按周一~周日顺序
      data.slice(0, 7).forEach((row, i) => {
        weekBars.value[i].num = parseWeekNum(row)
      })
    } else if (Array.isArray(data.days)) {
      // 2. { days: [{ day, num }] }，day 可能是日期或下标
      data.days.forEach((row, i) => {
        const idx = matchWeekIndex(String(row?.day ?? i), i)
        if (idx >= 0 && idx < 7) weekBars.value[idx].num = parseWeekNum(row)
      })
    } else if (typeof data === 'object') {
      // 3. 日期映射 { 'yyyy-MM-dd': num }
      Object.entries(data).forEach(([key, val]) => {
        const idx = matchWeekIndex(String(key), -1)
        if (idx >= 0 && idx < 7) weekBars.value[idx].num = Number(val) || 0
      })
    }
  } catch (e) {
    console.warn('本周学习概况加载失败', e)
    weekError.value = true
  } finally {
    weekLoading.value = false
  }
}

// ========== 回到顶部 ==========
const showBackTop = ref(false)

const onScroll = () => {
  // 页面滚动超过 300px 时显示按钮
  const scroller = document.scrollingElement || document.documentElement
  showBackTop.value = scroller.scrollTop > 300
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  loadStudyDomain()
  loadWeekStudy()
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  if (refreshTimer) clearTimeout(refreshTimer)
})
</script>

<style scoped>
.study-domain-page {
  min-height: 100vh;
  position: relative;
  overflow-x: clip;
}

/* 顶部留出 fixed 导航栏的高度（64px）+ 呼吸空间，避免内容被压在导航栏下 */
.page-main {
  position: relative;
  z-index: 1;
  padding: 88px 0 80px;
}

.container {
  max-width: 780px;
  margin: 0 auto;
  padding: 0 24px;
}

.domain-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 22px;
}

.domain-title {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
}

.domain-sub {
  font-size: 13px;
  color: var(--text-muted);
}

/* ========== 本周每日学习概况 ========== */
.week-chart {
  margin-bottom: 16px;
  padding: 12px 18px 10px;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--bg-card);
}

.week-chart-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}

.week-chart-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary);
}

.week-chart-total {
  font-size: 12px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.week-chart-tip {
  margin: 0;
  padding: 14px 0 4px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}

.week-chart-bars {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  align-items: end;
}

.week-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  min-width: 0;
}

/* 数值：固定高度避免有无数字时柱子跳动 */
.week-bar-num {
  height: 13px;
  line-height: 13px;
  font-size: 11px;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

/* 数值为 0 时弱化显示 */
.week-bar-num.is-zero {
  color: var(--text-muted);
  opacity: 0.55;
}

.week-bar-track {
  width: 100%;
  max-width: 22px;
  height: 40px;
  display: flex;
  align-items: flex-end;
  border-radius: 5px;
  background: var(--bg-secondary);
  overflow: hidden;
}

.week-bar {
  width: 100%;
  border-radius: 5px 5px 0 0;
  background: linear-gradient(180deg, var(--accent-primary), var(--accent-secondary));
  opacity: 0.45;
  transition: height 0.4s ease;
}

.week-bar-label {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
}

/* 今天：柱子点亮 + 光晕，标签强调 */
.week-bar-item.is-today .week-bar {
  opacity: 1;
  box-shadow: 0 0 12px -2px var(--accent-primary);
}

.week-bar-item.is-today .week-bar-label {
  color: var(--accent-primary);
  font-weight: 600;
}

.week-bar-item.is-today .week-bar-num {
  color: var(--accent-primary);
  font-weight: 700;
}

/* ========== 指标表格：2 列 3 行 ========== */
.stats-table {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-cell {
  padding: 18px 20px;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--bg-card);
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.stat-cell:hover {
  /* 边框只掺入一半主题色，避免纯色硬边 */
  border-color: color-mix(in srgb, var(--cell-color) 50%, var(--border-color));
  box-shadow: 0 10px 24px -14px var(--cell-color);
}

.stat-cell:focus-visible {
  outline: 2px solid var(--cell-color);
  outline-offset: 2px;
}

/* 选中的格子：淡色描边 + 外侧柔光环，不再叠 inset 内描边（两层边框叠起来会显得又粗又硬）
   背景保持不透明卡片底，只把该格主题色淡淡混进去
   （--accent-glow 是半透明色，直接当 background 会透出页面背景，故用 color-mix 混色） */
.stat-cell.is-active {
  border-color: color-mix(in srgb, var(--cell-color) 60%, var(--border-color));
  background: var(--bg-secondary);
  background: color-mix(in srgb, var(--cell-color) 14%, var(--bg-card));
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--cell-color) 12%, transparent),
    0 10px 26px -16px var(--cell-color);
}

.stat-cell-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 标题前的复合图标：渐变底座 + 主题色线性图标 */
.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 9px;
  color: var(--cell-color);
  background:
    linear-gradient(135deg,
      color-mix(in srgb, var(--cell-color) 16%, transparent),
      color-mix(in srgb, var(--cell-color) 6%, transparent));
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--cell-color) 22%, transparent),
    0 3px 8px -4px color-mix(in srgb, var(--cell-color) 55%, transparent);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.stat-icon svg {
  width: 16px;
  height: 16px;
}

/* 悬停 / 选中格子时，图标微微放大并加深光晕 */
.stat-cell:hover .stat-icon,
.stat-cell.is-active .stat-icon {
  transform: scale(1.08) rotate(-4deg);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--cell-color) 35%, transparent),
    0 4px 12px -4px color-mix(in srgb, var(--cell-color) 70%, transparent);
}

/* 今日需复习数量 > 0：闹钟摇铃动画提醒 */
.stat-icon.is-attention {
  animation: icon-glow 1.8s ease-in-out infinite;
}

.stat-icon.is-attention svg {
  transform-origin: 50% 3px;
  animation: icon-ring 1.8s ease-in-out infinite;
}

/* 摇铃：摆动几下后停顿，循环往复 */
@keyframes icon-ring {
  0%, 55%, 100% { transform: rotate(0deg); }
  5%  { transform: rotate(14deg); }
  15% { transform: rotate(-12deg); }
  25% { transform: rotate(10deg); }
  35% { transform: rotate(-8deg); }
  45% { transform: rotate(5deg); }
}

/* 底座光晕同步呼吸 */
@keyframes icon-glow {
  0%, 55%, 100% {
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, var(--cell-color) 22%, transparent),
      0 3px 8px -4px color-mix(in srgb, var(--cell-color) 55%, transparent);
  }
  25% {
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, var(--cell-color) 40%, transparent),
      0 0 16px -2px color-mix(in srgb, var(--cell-color) 75%, transparent);
  }
}

/* 用户偏好减少动效时停用提醒动画 */
@media (prefers-reduced-motion: reduce) {
  .stat-icon.is-attention,
  .stat-icon.is-attention svg {
    animation: none;
  }
}

.stat-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.stat-cell-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 10px;
}

.stat-num {
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
  color: var(--cell-color);
  font-variant-numeric: tabular-nums;
}

.stat-unit {
  font-size: 12px;
  color: var(--text-muted);
}

.stat-desc {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-muted);
}

/* ========== 指标对应的列表 ========== */
.domain-list {
  margin-top: 26px;
  padding: 16px 18px;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--bg-card);
}

.domain-list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.domain-list-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.domain-list-title em {
  margin-left: 6px;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  color: var(--text-muted);
}

.domain-list-close {
  flex-shrink: 0;
  padding: 5px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.domain-list-close:hover {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  background: var(--accent-glow);
}

.domain-list-items {
  display: flex;
  flex-direction: column;
  max-height: 360px;
  overflow-y: auto;
}

.domain-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 11px 4px;
  border-bottom: 1px dashed var(--border-color);
}

.domain-list-item:last-child {
  border-bottom: none;
}

.item-title {
  min-width: 0;
  font-size: 13px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-time {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.domain-list-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 28px 0;
  font-size: 13px;
  color: var(--text-muted);
}

/* 列表项可点击：悬停 / 选中 */
.domain-list-item[role='button'] {
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.domain-list-item[role='button']:hover {
  background: var(--bg-secondary);
}

.domain-list-item.is-open {
  background: var(--accent-glow);
}

.domain-list-item.is-open .item-title {
  color: var(--accent-primary);
  font-weight: 600;
}


/* 加载中 / 加载失败提示 */
.stats-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 0;
  padding: 48px 0;
  font-size: 13px;
  color: var(--text-muted);
}

.stats-retry {
  padding: 7px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.stats-retry:hover {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  background: var(--bg-secondary);
  background: color-mix(in srgb, var(--accent-primary) 12%, var(--bg-card));
}

/* 每格语义配色：蓝 / 橙 / 紫 / 绿 / 红 / 青 */
.stat-learned { --cell-color: #3b82f6; }
.stat-review { --cell-color: #ea580c; }
.stat-building { --cell-color: #8b5cf6; }
.stat-solid { --cell-color: #16a34a; }
.stat-hard { --cell-color: #e11d48; }
.stat-easy { --cell-color: #0284c7; }
.stat-flow { --cell-color: #f59e0b; }
.stat-cancelflow { --cell-color: #64748b; }

/* 复用站点统一的背景装饰（与摇一摇页一致） */

.bg-glow {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
  pointer-events: none;
}

.bg-glow-1 {
  top: -120px;
  left: -80px;
  width: 380px;
  height: 380px;
  background: var(--accent-primary);
}

.bg-glow-2 {
  bottom: -140px;
  right: -80px;
  width: 420px;
  height: 420px;
  background: var(--accent-secondary);
}

/* 回到顶部 */
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 窄屏：仍保持 2 列 3 行，只收紧间距与字号 */
@media (max-width: 560px) {
  .page-main {
    padding: 80px 0 56px;
  }

  .container {
    padding: 0 16px;
  }

  .stats-table {
    gap: 12px;
  }

  .stat-cell {
    padding: 14px;
  }

  .stat-num {
    font-size: 24px;
  }

  .stat-desc {
    font-size: 11px;
  }

  .domain-title {
    font-size: 22px;
  }

  .week-chart {
    padding: 14px 12px 12px;
  }

  .week-chart-bars {
    gap: 5px;
  }

  .week-bar-label {
    font-size: 10px;
  }
}
</style>
