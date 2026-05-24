<template>
  <div class="api-page">
    <!-- 背景效果 -->
    <div class="bg-grid"></div>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>

    <!-- 导航栏 -->
    <Navbar activeMenu="API" @navigate="handleNavigate" />

    <!-- 检索区域 -->
    <section class="search-section">
      <div class="container">
        <h1 class="page-title">开放 API</h1>
        <p class="page-desc">探索并使用高质量的免费 API 接口</p>
        
        <div class="search-box">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索 API 名称、描述或标签..."
            class="search-input"
          />
          <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- 标签筛选 -->
        <div class="filter-tags">
          <button 
            class="filter-tag" 
            :class="{ active: selectedTag === '' }"
            @click="selectedTag = ''"
          >
            全部
          </button>
          <button 
            v-for="tag in allTags" 
            :key="tag.name"
            class="filter-tag"
            :class="{ active: selectedTag === tag.name }"
            :style="selectedTag === tag.name ? { background: tag.color + '20', color: tag.color, borderColor: tag.color } : {}"
            @click="selectedTag = tag.name"
          >
            {{ tag.name }}
          </button>
        </div>

        <!-- 筛选结果统计 -->
        <div class="search-stats">
          共找到 <span class="stat-highlight">{{ filteredApis.length }}</span> 个 API
        </div>
      </div>
    </section>

    <!-- API 列表 -->
    <section class="api-list-section">
      <div class="container">
        <div class="api-grid">
          <div 
            v-for="api in filteredApis" 
            :key="api.id" 
            class="api-card"
            @click="goToApiDetail(api)"
          >
            <div class="api-card-header">
              <span class="api-name">{{ api.name }}</span>
              <span class="api-method" :style="{ background: methodColors[api.method] }">
                {{ api.method }}
              </span>
            </div>
            <p class="api-desc">{{ api.description }}</p>
            <div class="api-tags">
              <span class="api-tag" :style="{ background: api.tagColor + '20', color: api.tagColor }">
                {{ api.tag }}
              </span>
              <span v-if="!api.isFree" class="api-tag paid-tag">
                付费
              </span>
            </div>
            <div class="api-stats">
              <span class="api-stat" data-tip="累计 API 调用次数">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                {{ api.stats.calls }}
              </span>
              <span class="api-stat" data-tip="请求成功比例">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {{ api.stats.successRate }}%
              </span>
              <span class="api-stat" data-tip="平均响应时间">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                {{ api.stats.avgTime }}ms
              </span>
              <span class="api-stat" data-tip="用户点赞数">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {{ api.stats.likes }}
              </span>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredApis.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p>未找到匹配的 API</p>
          <span>尝试其他关键词或筛选条件</span>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from './Navbar.vue'
import Footer from './Footer.vue'
import { openApis } from '../api/modules'

const router = useRouter()

const searchQuery = ref('')
const selectedTag = ref('')

const methodColors = {
  GET: '#10b981',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  DELETE: '#ef4444'
}

const allTags = [
  { name: '图片', color: '#10b981' },
  { name: '生活', color: '#3b82f6' },
  { name: '工具', color: '#8b5cf6' },
  { name: 'AI', color: '#f97316' }
]

const filteredApis = computed(() => {
  let result = openApis
  
  // 按标签筛选
  if (selectedTag.value) {
    result = result.filter(api => api.tag === selectedTag.value)
  }
  
  // 按关键词搜索
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(api => 
      api.name.toLowerCase().includes(query) ||
      api.description.toLowerCase().includes(query) ||
      api.tag.toLowerCase().includes(query)
    )
  }
  
  return result
})

const handleNavigate = (menu) => {
  router.push('/')
}

const goToApiDetail = (api) => {
  router.push(`/api/${api.id}`)
}
</script>

<style scoped>
.api-page {
  min-height: 100vh;
  position: relative;
}

/* 背景效果 */
.bg-grid {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 0;
}

.bg-glow {
  position: fixed;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.15;
  pointer-events: none;
  z-index: 0;
}

.bg-glow-1 {
  top: -200px;
  right: -200px;
  background: var(--accent-primary);
}

.bg-glow-2 {
  bottom: -200px;
  left: -200px;
  background: var(--accent-secondary);
}

/* 检索区域 */
.search-section {
  padding: 140px 0 40px;
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin: 0 0 12px;
}

.page-desc {
  font-size: 1.1rem;
  color: var(--text-secondary);
  text-align: center;
  margin: 0 0 40px;
}

.search-box {
  position: relative;
  max-width: 600px;
  margin: 0 auto 24px;
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
}

.search-input {
  width: 100%;
  padding: 16px 50px 16px 52px;
  font-size: 16px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 16px;
  color: var(--text-primary);
  outline: none;
  transition: all 0.3s;
}

.search-input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 4px var(--accent-glow);
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.clear-btn {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border: none;
  border-radius: 50%;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: var(--accent-primary);
  color: white;
}

/* 标签筛选 */
.filter-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-bottom: 24px;
}

.filter-tag {
  padding: 8px 18px;
  font-size: 14px;
  font-weight: 500;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s;
}

.filter-tag:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.filter-tag.active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
}

.search-stats {
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
}

.stat-highlight {
  color: var(--accent-primary);
  font-weight: 600;
}

/* API 列表 */
.api-list-section {
  padding: 20px 0 100px;
  position: relative;
  z-index: 1;
}

.api-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.api-card {
  display: flex;
  flex-direction: column;
  padding: 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.3s;
}

.api-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-primary);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.api-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.api-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.api-method {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  color: white;
}

.api-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 12px;
  flex: 1;
}

.api-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.api-tag {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 12px;
}

.paid-tag {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.api-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.api-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-secondary);
  cursor: help;
  position: relative;
}

.api-stat svg {
  color: var(--text-tertiary);
}

.api-stat:hover {
  color: var(--accent-primary);
}

.api-stat:hover::after {
  content: attr(data-tip);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 10px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 11px;
  color: var(--text-primary);
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.api-stat:hover::before {
  content: '';
  position: absolute;
  bottom: calc(100% + 2px);
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: var(--border-color);
  z-index: 10;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: var(--text-tertiary);
}

.empty-state svg {
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0 0 8px;
}

.empty-state span {
  font-size: 14px;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.8rem;
  }
  
  .search-section {
    padding: 120px 0 30px;
  }
  
  .api-grid {
    grid-template-columns: 1fr;
  }
}
</style>
