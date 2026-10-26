<template>
  <div class="notes-page">
    <!-- 背景效果 -->
    <div class="bg-grid"></div>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>
    <!-- 主题背景装饰（随主题切换树木/风车等元素） -->
    <BgScenery />

    <!-- 导航栏 -->
    <Navbar activeMenu="笔记" @navigate="handleNavigate" />

    <!-- 页面标题 -->
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">知识笔记</h1>
        <p class="page-desc">总该学点什么吧</p>
      </div>
    </section>

    <!-- 内容区 -->
    <section class="notes-section">
      <div class="container">
        <!-- 加载中 -->
        <div v-if="loading" class="notes-state">
          <div class="loading-spinner"></div>
          <span>笔记加载中…</span>
        </div>

        <!-- 加载失败 -->
        <div v-else-if="loadError" class="notes-state">
          <p>{{ loadError }}</p>
          <button class="retry-btn" @click="loadNotes">重新加载</button>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!notes.length" class="notes-state empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          <p>暂无已发布的笔记</p>
          <span>博主正在创作中，敬请期待</span>
        </div>

        <!-- 笔记网格 -->
        <div v-else class="notes-grid">
          <!-- 点击卡片在当前标签页直接打开阅读页（Ctrl/中键仍可新标签打开） -->
          <router-link
            v-for="note in notes"
            :key="note.id"
            :to="`/notes/${note.id}`"
            class="note-card"
          >
            <!-- 章节统计：固定在卡片最右上角 -->
            <div v-if="hasStats(note)" class="card-stats">
              <span class="stats-badge">共计:{{ note.chapterNum }}章{{ note.sectionNum }}节</span>
            </div>
            <div class="card-body">
              <h3 class="note-name">{{ note.name }}</h3>
              <p class="note-preface">{{ note.preface || '暂无简介' }}</p>
              <!-- 单篇字数 / 代码行数：位于序言下方，右对齐，"/" 拼接 -->
              <div v-if="hasCardStats(note)" class="card-meta">
                <span class="meta-stat" :title="cardStatsTitle(note)">{{ formatCardStats(note) }}</span>
              </div>
            </div>
            <div class="card-progress">
              <div class="progress-track">
                <div
                  class="progress-fill"
                  :style="{ width: clampProcess(note.process) + '%' }"
                ></div>
              </div>
              <span class="progress-text">{{ clampProcess(note.process) }}%</span>
            </div>
            <div class="card-foot">
              <span class="note-author">{{ note.author || '未知作者' }}</span>
              <span class="note-time">{{ formatTime(note.createTime) }}</span>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/article.js'
import Navbar from './Navbar.vue'
import BgScenery from './BgScenery.vue'
import Footer from './Footer.vue'

const router = useRouter()

const loading = ref(false)
const loadError = ref('')
const notes = ref([])

// 时间仅展示到日期
const formatTime = (value) => {
  if (!value) return ''
  return String(value).slice(0, 10)
}

// 千分位格式化：1234567 → 1,234,567；缺省为 0
const formatNumber = (n) => {
  const num = Number(n)
  if (!Number.isFinite(num)) return '0'
  return num.toLocaleString('en-US')
}

// 拉取已发布笔记列表
const loadNotes = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const res = await api.getPublishedNotes()
    if (res.success || res.code === 200 || res.code === 0) {
      notes.value = res.data || []
    } else {
      loadError.value = res.message || res.msg || '加载失败'
    }
  } catch (e) {
    console.error('加载笔记失败', e)
    loadError.value = '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

onMounted(loadNotes)

// 进度值处理：process 为 0-100 数字，100 时满格；缺失或非法值按 0 处理
const clampProcess = (v) => {
  const n = Number(v)
  if (Number.isNaN(n)) return 0
  return Math.min(100, Math.max(0, n))
}

// 章节统计是否存在（至少一个字段大于 0 才展示，避免出现 0章0节）
const hasStats = (note) =>
  Number(note.chapterNum ?? 0) > 0 || Number(note.sectionNum ?? 0) > 0

// 字数 / 代码行数是否存在（任一字段大于 0 才展示该行）
const hasCardStats = (note) =>
  Number(note.text_char_count ?? 0) > 0 || Number(note.code_line_count ?? 0) > 0

// 拼出 "1,234 字 / 56 行代码"，0 字段自动忽略
const formatCardStats = (note) => {
  const parts = []
  if (Number(note.text_char_count) > 0) parts.push(`${formatNumber(note.text_char_count)} 字`)
  if (Number(note.code_line_count) > 0) parts.push(`${formatNumber(note.code_line_count)} 行代码`)
  return parts.join(' / ')
}

// 鼠标悬停提示，同步隐藏为 0 的字段
const cardStatsTitle = (note) => {
  const parts = []
  if (Number(note.text_char_count) > 0) parts.push('字数')
  if (Number(note.code_line_count) > 0) parts.push('代码行数')
  return parts.join(' / ')
}

const handleNavigate = (menu) => {
  if (menu === '首页') {
    router.push('/')
  }
}
</script>

<style scoped>
.notes-page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  /* 为 fixed 导航栏预留空间 */
  padding-top: 64px;
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

.page-header,
.notes-section {
  position: relative;
  z-index: 1;
}

/* ========== 页面标题 ========== */
.page-header {
  padding: 40px 0 12px;
  position: relative;
  z-index: 1;
}

/* 标题与描述一行展示 */
.page-header .container {
  display: flex;
  align-items: center;
  gap: 14px;
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

/* ========== 内容区 ========== */
.notes-section {
  padding: 12px 0 80px;
  position: relative;
  z-index: 1;
}

/* ========== 加载 / 错误 / 空状态 ========== */
.notes-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 80px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  color: var(--text-muted);
  text-align: center;
}

.notes-state p {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0;
}

.notes-state span {
  font-size: 14px;
}

.notes-state svg {
  color: var(--accent-primary);
  opacity: 0.6;
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

/* ========== 笔记卡片（简洁笔记本封面，样式对齐首页精选笔记） ========== */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: 14px;
  row-gap: 20px;
}

.note-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 240px;
  padding: 28px 24px 20px;
  border-radius: 16px;
  box-sizing: border-box;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  overflow: hidden;
  text-decoration: none;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

/* 右上角书页折角 */
.note-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, transparent 0 50%, var(--bg-secondary) 50% 100%);
  border-bottom-left-radius: 12px;
  box-shadow: -3px 3px 6px -2px rgba(0, 0, 0, 0.15);
  pointer-events: none;
}

.note-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-primary);
  box-shadow: 0 12px 28px -8px var(--accent-glow);
}

/* 卡片主体 */
.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 22px 4px;
}

/* 章节统计：固定在卡片最左上角 */
.card-stats {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 1;
}

.stats-badge {
  display: inline-block;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 500;
  color: var(--accent-primary);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 999px;
  white-space: nowrap;
}

.note-name {
  margin: 0 0 12px;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.5;
  color: var(--text-primary);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.note-preface {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-secondary);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* 卡片进度条 */
.card-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 4px 14px;
}

.progress-track {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  transition: width 0.3s ease;
}

.progress-text {
  flex-shrink: 0;
  min-width: 32px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-align: right;
}

/* 卡片字数 / 代码行数：序言下方，右对齐 */
.card-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 4px 12px;
  align-self: flex-end;
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.meta-stat {
  white-space: nowrap;
}

/* 卡片底部 */
.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid var(--border-color);
}

.note-author {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-time {
  font-size: 12px;
  color: var(--text-muted);
  flex-shrink: 0;
}

/* ========== 响应式 ========== */
@media (max-width: 1200px) {
  .notes-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 992px) {
  .notes-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 32px 0 10px;
  }

  .page-title {
    font-size: 18px;
  }

  .notes-grid {
    grid-template-columns: 1fr;
  }
}
</style>
