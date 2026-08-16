<template>
  <div class="api-page">
    <!-- 背景效果 -->
    <div class="bg-grid"></div>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>

    <!-- 导航栏 -->
    <Navbar activeMenu="接口商城" @navigate="handleNavigate" />

    <!-- 检索区域 -->
    <section class="search-section">
      <div class="container">
        <div class="search-header">
          <h1 class="page-title">接口商城</h1>
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
          <button v-show="searchQuery" class="clear-btn" @click="searchQuery = ''">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
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
            :key="tag.id"
            class="filter-tag"
            :class="{ active: selectedTag === tag.id }"
            @click="selectedTag = tag.id"
          >
            {{ tag.name }}
          </button>
        </div>

        <!-- 筛选结果统计 -->
        <div class="search-stats">
          共找到 <span class="stat-highlight">{{ apiList.length }}</span> 个 API
        </div>
      </div>
    </section>

    <!-- API 列表 -->
    <section class="api-list-section">
      <div class="container">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>
        <template v-else>
        <!-- 精选付费接口 -->
        <div v-if="paidApis.length" class="featured-section">
          <div class="section-header">
            <h2 class="section-title">精选付费接口</h2>
            <button
              v-if="paidApis.length > paidLimit"
              class="more-btn"
              @click="paidLimit = Infinity"
            >查看更多</button>
          </div>
          <div class="api-grid">
            <ApiCard
              v-for="api in visiblePaidApis"
              :key="api.id"
              :api="api"
              @select="goToApiDetail"
            />
          </div>
        </div>

        <!-- 精选免费接口 -->
        <template v-if="freeApis.length">
          <div class="section-header">
            <h2 class="section-title">精选免费接口</h2>
            <button
              v-if="freeApis.length > freeLimit"
              class="more-btn"
              @click="freeLimit = Infinity"
            >查看更多</button>
          </div>
          <div class="api-grid">
            <ApiCard
              v-for="api in visibleFreeApis"
              :key="api.id"
              :api="api"
              @select="goToApiDetail"
            />
          </div>
        </template>

        <!-- 空状态 -->
        <div v-else-if="apiList.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p>未找到匹配的 API</p>
          <span>尝试其他关键词或筛选条件</span>
        </div>
        </template>
      </div>
    </section>

    <!-- 页脚 -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from './Navbar.vue'
import Footer from './Footer.vue'
import ApiCard from './ApiCard.vue'
import { getApis, getApiTags } from '../api/modules'

const router = useRouter()

const searchQuery = ref('')
const selectedTag = ref('')
const apiList = ref([])
const allTags = ref([])
const loading = ref(true)
let searchTimer = null

const fetchApis = async () => {
  loading.value = true
  try {
    const res = await getApis(searchQuery.value, selectedTag.value)
    if (res.success && res.data) {
      apiList.value = res.data
    }
  } catch (err) {
    console.error('获取 API 列表失败:', err)
  } finally {
    loading.value = false
  }
}

// 标签变化立即请求
watch(selectedTag, () => {
  fetchApis()
})

// 搜索关键词防抖请求
watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchApis()
  }, 400)
})

const handleNavigate = (menu) => {
  router.push('/')
}

const goToApiDetail = (api) => {
  router.push(`/api/${api.id}`)
}

// 付费 / 免费接口分组
const paidApis = computed(() => apiList.value.filter(a => !a.isFree))
const freeApis = computed(() => apiList.value.filter(a => a.isFree))

// 列表展开控制
const paidLimit = ref(4)
const freeLimit = ref(8)
const visiblePaidApis = computed(() => paidApis.value.slice(0, paidLimit.value))
const visibleFreeApis = computed(() => freeApis.value.slice(0, freeLimit.value))

// 初次加载
onMounted(async () => {
  try {
    const [apiRes, tagRes] = await Promise.all([getApis(), getApiTags()])
    if (apiRes.success && apiRes.data) {
      apiList.value = apiRes.data
    }
    if (tagRes.success && tagRes.data) {
      allTags.value = tagRes.data
    }
  } catch (err) {
    console.error('获取 API 数据失败:', err)
  } finally {
    loading.value = false
  }
})
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
  padding: 84px 0 24px;
  position: relative;
  z-index: 1;
}

.search-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 300px;
  flex: 0 0 auto;
  max-width: 100%;
  margin-left: auto;
  padding: 0 12px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.search-box:hover {
  border-color: var(--border-color);
}

.search-box:focus-within {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 4px var(--accent-glow);
}

.search-icon {
  flex-shrink: 0;
  color: var(--text-tertiary);
}

.search-input {
  flex: 1;
  padding: 12px 0;
  font-size: 14px;
  background: transparent;
  border: none;
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.clear-btn {
  flex-shrink: 0;
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
  justify-content: flex-start;
  gap: 10px;
  margin-bottom: 16px;
}

.filter-tag {
  padding: 5px 14px;
  font-size: 13px;
  font-weight: 500;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s;
}

.filter-tag:hover {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
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
  padding: 16px 0 80px;
  position: relative;
  z-index: 1;
}

.api-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: 14px;
  row-gap: 20px;
}

/* 区块标题 */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.more-btn {
  padding: 4px 14px;
  font-size: 13px;
  color: var(--accent-primary);
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.more-btn:hover {
  color: #fff;
  background: var(--accent-primary);
  border-color: var(--accent-primary);
}

/* 精选付费接口 */
.featured-section {
  margin-bottom: 32px;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 0;
  color: var(--text-secondary, #a1a1aa);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(99, 102, 241, 0.1);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
@media (max-width: 1140px) {
  .api-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 992px) {
  .api-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .search-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .search-box {
    max-width: 100%;
    margin: 0;
  }

.search-section {
  padding: 110px 0 24px;
}
  
  .api-grid {
    grid-template-columns: 1fr;
  }
}
</style>
