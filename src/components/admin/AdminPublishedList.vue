<template>
  <AdminLayout>
    <div class="article-management">
      <header class="content-header">
        <div class="header-left">
          <h1>已发布</h1>
          <p>管理已发布的文章</p>
        </div>
      </header>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <div class="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索文章..."
          />
        </div>
        <select v-model="filterTag" class="filter-select">
          <option value="">全部标签</option>
          <option v-for="tag in availableTags" :key="tag.id" :value="tag.id">{{ tag.name }}</option>
        </select>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <!-- 文章列表 -->
      <div v-else-if="paginatedArticles.length > 0" class="article-list">
        <div 
          v-for="article in paginatedArticles" 
          :key="article.id" 
          class="article-item"
        >
          <div class="article-thumb" :style="{ background: article.gradient }">
            <span class="tag-badge" :style="{ background: 'rgba(0,0,0,0.5)', color: 'white' }">
              {{ article.tag }}
            </span>
          </div>
          <div class="article-info">
            <h3>{{ article.title }}</h3>
            <p>{{ article.desc }}</p>
            <div class="article-meta">
              <span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> {{ article.author }}</span>
              <span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> {{ article.date }}</span>
              <span>浏览量: {{ article.views || 0 }}</span>
              <span>点赞: {{ article.likes || 0 }}</span>
              <span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> {{ article.readTime }}分钟</span>
            </div>
          </div>
          <div class="article-actions">
            <span class="status-badge published">已发布</span>
            <button 
              class="action-btn unpublish" 
              @click="confirmUnpublish(article)"
              title="下架"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <h3>暂无已发布的文章</h3>
        <p>将草稿箱的文章发布后将显示在这里</p>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          class="page-btn" 
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          上一页
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button 
          class="page-btn" 
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 下架确认弹窗 -->
    <div v-if="showUnpublishModal" class="modal-overlay" @click.self="showUnpublishModal = false">
      <div class="modal">
        <h3>确认下架</h3>
        <p>确定要下架文章「{{ articleToUnpublish?.title }}」吗？下架后文章将从前台消失。</p>
        <div class="modal-actions">
          <button class="btn" @click="showUnpublishModal = false">取消</button>
          <button class="btn btn-danger" @click="togglePublish">下架</button>
        </div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      {{ toast.message }}
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../../api/article'
import AdminLayout from './AdminLayout.vue'

const router = useRouter()
const articles = ref([])
const tags = ref([])
const loading = ref(false)
const searchQuery = ref('')
const filterTag = ref('')
const currentPage = ref(1)
const pageSize = 10
const showUnpublishModal = ref(false)
const articleToUnpublish = ref(null)

// Toast
const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

// 搜索防抖定时器
let searchTimer = null

// 监听搜索输入，防抖处理
watch(searchQuery, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    filterArticles()
  }, 1000)
})

// 监听标签筛选
watch(filterTag, () => {
  filterArticles()
})

// 显示提示
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// 可用标签
const availableTags = computed(() => tags.value)

// 加载标签
const loadTags = async () => {
  try {
    const res = await api.getArticleTags()
    if (res.success) {
      tags.value = res.data || []
    }
  } catch (error) {
    console.error('获取标签失败:', error)
  }
}

// 筛选文章（调用后端接口）
const filterArticles = async () => {
  currentPage.value = 1
  try {
    loading.value = true
    // 固定筛选已发布状态
    const res = await api.getAdminArticles(searchQuery.value, filterTag.value, '1')
    if (res.success) {
      articles.value = res.data || []
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取文章列表
const fetchArticles = async () => {
  try {
    loading.value = true
    // 固定筛选已发布状态
    const res = await api.getAdminArticles('', '', '1')
    if (res.success) {
      articles.value = res.data || []
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 分页后的文章
const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return articles.value.slice(start, start + pageSize)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(articles.value.length / pageSize) || 1
})

// 打开编辑器
const openEditor = () => {
  router.push('/admin/editor')
}

// 编辑文章
const editArticle = (article) => {
  router.push(`/admin/editor?id=${article.id}`)
}

// 确认下架
const confirmUnpublish = (article) => {
  articleToUnpublish.value = article
  showUnpublishModal.value = true
}

// 切换发布状态（下架）
const togglePublish = async () => {
  try {
    const res = await api.updateArticleStatus(articleToUnpublish.value.id, 'draft')
    if (res.success) {
      showToast('文章已下架')
      showUnpublishModal.value = false
      articleToUnpublish.value = null
      fetchArticles()
    }
  } catch (error) {
    console.error('更新状态失败:', error)
    showToast('操作失败', 'error')
  }
}

onMounted(() => {
  loadTags()
  fetchArticles()
})
</script>

<style scoped>
/* 暗色主题 */
.article-management {
  --admin-bg-primary: #0f0f23;
  --admin-bg-card: #1a1a2e;
  --admin-border-color: #2d2d44;
  --admin-text-primary: #e4e4e7;
  --admin-text-secondary: #a1a1aa;
  --admin-accent-primary: #6366f1;
  --admin-hover-bg: rgba(99, 102, 241, 0.15);
  
  max-width: 1200px;
}

.content-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
}

.header-left h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--admin-text-primary);
  margin-bottom: 4px;
}

.header-left p {
  color: var(--admin-text-secondary);
  font-size: 14px;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--admin-bg-card);
  border: 1px solid var(--admin-border-color);
  border-radius: 8px;
}

.search-box:focus-within {
  border-color: var(--admin-accent-primary);
}

.search-box svg {
  color: var(--admin-text-secondary);
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--admin-text-primary);
  font-size: 14px;
  outline: none;
}

.filter-select {
  padding: 12px 16px;
  background: var(--admin-bg-card);
  border: 1px solid var(--admin-border-color);
  border-radius: 8px;
  color: var(--admin-text-primary);
  font-size: 14px;
  cursor: pointer;
  min-width: 140px;
}

/* 按钮样式 */
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
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
  border: 1px solid var(--admin-border-color);
  color: var(--admin-text-primary);
}

.btn-secondary:hover {
  background: var(--admin-hover-bg);
  color: var(--admin-accent-primary);
  border-color: var(--admin-accent-primary);
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  opacity: 0.9;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: var(--admin-text-secondary);
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(59, 130, 246, 0.1);
  border-top-color: var(--admin-accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 文章列表 */
.article-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: var(--admin-bg-card);
  border: 1px solid var(--admin-border-color);
  border-radius: 12px;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.article-item:hover {
  border-color: var(--admin-accent-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.article-thumb {
  width: 100px;
  height: 70px;
  border-radius: 8px;
  flex-shrink: 0;
  position: relative;
}

.tag-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.article-info {
  flex: 1;
  min-width: 0;
}

.article-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--admin-text-primary);
  margin-bottom: 8px;
}

.article-info p {
  font-size: 13px;
  color: var(--admin-text-secondary);
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: var(--admin-text-secondary);
}

.article-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.article-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.published {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--admin-border-color);
  border-radius: 8px;
  color: var(--admin-text-secondary);
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  background: var(--admin-hover-bg);
}

.action-btn.edit:hover {
  color: var(--admin-accent-primary);
  border-color: var(--admin-accent-primary);
}

.action-btn.unpublish:hover {
  color: #ef4444;
  border-color: #ef4444;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: var(--admin-text-secondary);
  gap: 16px;
}

.empty-state svg {
  opacity: 0.5;
}

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px 0;
}

.page-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--admin-bg-card);
  border: 1px solid var(--admin-border-color);
  border-radius: 8px;
  color: var(--admin-text-secondary);
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--admin-accent-primary);
  color: var(--admin-accent-primary);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: var(--admin-text-secondary);
  min-width: 60px;
  text-align: center;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--admin-bg-card);
  border: 1px solid var(--admin-border-color);
  border-radius: 16px;
  padding: 32px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.modal h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--admin-text-primary);
  margin-bottom: 12px;
}

.modal p {
  color: var(--admin-text-secondary);
  margin-bottom: 24px;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1001;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.toast.success {
  background: #22c55e;
  color: white;
}

.toast.error {
  background: #ef4444;
  color: white;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
