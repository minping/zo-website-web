<template>
  <div class="notes-page">
    <!-- 背景效果 -->
    <div class="bg-grid"></div>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>

    <!-- 导航栏 -->
    <Navbar activeMenu="笔记" @navigate="handleNavigate" />

    <!-- 页面标题 -->
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">知识笔记</h1>
        <p class="page-desc">记录思考，沉淀知识</p>
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
          <a
            v-for="note in notes"
            :key="note.id"
            :href="getNoteHref(note)"
            target="_blank"
            rel="noopener noreferrer"
            class="note-card"
          >
            <div class="card-body">
              <h3 class="note-name">{{ note.name }}</h3>
              <p class="note-preface">{{ note.preface || '暂无简介' }}</p>
            </div>
            <div class="card-foot">
              <span class="note-author">{{ note.author || '未知作者' }}</span>
              <span class="note-time">{{ formatTime(note.createTime) }}</span>
            </div>
          </a>
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

// 点击笔记卡片：新标签页打开只读阅读页（仅传 id）
const getNoteHref = (note) =>
  router.resolve({ path: `/notes/${note.id}` }).href

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
  padding: 100px 0 30px;
}

.page-title {
  font-size: 30px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.page-desc {
  font-size: 15px;
  color: var(--text-muted);
  margin: 0;
}

/* ========== 内容区 ========== */
.notes-section {
  padding: 40px 0 80px;
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

/* ========== 笔记卡片（简洁笔记本封面） ========== */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
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
@media (max-width: 768px) {
  .page-header {
    padding: 80px 0 20px;
  }

  .page-title {
    font-size: 24px;
  }

  .notes-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 18px;
  }

  .note-card {
    min-height: 220px;
    padding: 24px 20px 16px;
  }
}
</style>
