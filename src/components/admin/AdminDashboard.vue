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
            <div class="stat-icon drafts">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ articleStats.draftArticles }}</span>
              <span class="stat-label">草稿</span>
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
import { ref, onMounted } from 'vue'
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
  draftArticles: 0,
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
  router.push('/admin/articles')
}

const goToApis = () => {
  router.push('/admin/apis')
}

onMounted(() => {
  fetchArticleStatics()
  fetchApis()
})
</script>

<style scoped>
/* 暗色主题变量 */
.api-list,
.dashboard {
  --admin-bg-primary: #0f0f23;
  --admin-bg-card: #1a1a2e;
  --admin-border-color: #2d2d44;
  --admin-text-primary: #e4e4e7;
  --admin-text-secondary: #a1a1aa;
  --admin-accent-primary: #6366f1;
  --admin-hover-bg: rgba(99, 102, 241, 0.15);
}

.dashboard {
  max-width: 1200px;
}

.content-header {
  margin-bottom: 32px;
}

.content-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--admin-text-primary);
  margin-bottom: 4px;
}

.content-header p {
  color: var(--admin-text-secondary);
  font-size: 14px;
}

/* 模块区域 */
.module-section {
  margin-bottom: 32px;
}

.module-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.module-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--admin-text-primary);
}

.module-title h2 {
  font-size: 18px;
  font-weight: 600;
}

.module-title svg {
  color: var(--admin-accent-primary);
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: var(--admin-bg-card);
  border: 1px solid var(--admin-border-color);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.articles {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.stat-icon.published {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.stat-icon.drafts {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
}

.stat-icon.views {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}

.stat-icon.likes {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.stat-icon.apis {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.stat-icon.free {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.stat-icon.calls {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
}

.stat-icon.success {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--admin-text-primary);
}

.stat-label {
  font-size: 12px;
  color: var(--admin-text-secondary);
}

/* 按钮 */
.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background: var(--admin-accent-primary);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  background: transparent;
  color: var(--admin-text-secondary);
  border: 1px solid var(--admin-border-color);
}

.btn-secondary:hover {
  background: var(--admin-hover-bg);
  color: var(--admin-accent-primary);
  border-color: var(--admin-accent-primary);
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .module-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
