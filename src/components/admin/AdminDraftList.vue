<template>
  <AdminLayout>
    <div class="article-management">
      <header class="content-header">
        <div class="header-left">
          <h1>草稿箱</h1>
          <p>管理未发布的文章</p>
        </div>
        <button class="btn btn-primary" @click="openEditor()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          新建文章
        </button>
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
        <button class="btn btn-tag-manage" @click="goToTagManage">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
          标签管理
        </button>
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
              <span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> 创建于 {{ article.createTime }}</span>
              <span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> {{ article.readTime }}分钟</span>
            </div>
          </div>
          <div class="article-actions">
            <span class="status-badge draft">草稿</span>
            <button 
              class="action-btn edit" 
              @click="editArticle(article)" 
              title="编辑"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button 
              class="action-btn publish" 
              @click="publishArticle(article)"
              title="发布"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
            <button 
              class="action-btn delete" 
              @click="confirmDelete(article)" 
              title="删除"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
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
        <h3>暂无草稿文章</h3>
        <p>点击「新建文章」开始创作</p>
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

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal">
        <h3>确认删除</h3>
        <p>确定要删除文章「{{ articleToDelete?.title }}」吗？此操作不可撤销。</p>
        <div class="modal-actions">
          <button class="btn" @click="showDeleteModal = false">取消</button>
          <button class="btn btn-danger" @click="deleteArticle">删除</button>
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
const loading = ref(false)
const searchQuery = ref('')
const filterTag = ref('')
const currentPage = ref(1)
const pageSize = 10
const showDeleteModal = ref(false)
const articleToDelete = ref(null)

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
const availableTags = ref([])

// 加载标签
const loadTags = async () => {
  try {
    const res = await api.getArticleTags()
    if (res.success && res.data) {
      availableTags.value = res.data
    }
  } catch (error) {
    console.error('获取标签失败:', error)
  }
}

// 跳转到标签管理页面
const goToTagManage = () => {
  router.push('/admin/tags')
}

// 筛选文章（调用后端接口）
const filterArticles = async () => {
  currentPage.value = 1
  try {
    loading.value = true
    // 固定筛选草稿状态
    const res = await api.getAdminArticles(searchQuery.value, filterTag.value, '0')
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
    // 固定筛选草稿状态
    const res = await api.getAdminArticles('', '', '0')
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

// 发布文章
const publishArticle = async (article) => {
  try {
    loading.value = true
    const res = await api.updateArticleStatus(article.id, 'published')
    if (res.success) {
      showToast('文章已发布')
      // 重置到第一页并刷新列表
      currentPage.value = 1
      await fetchArticles()
    }
  } catch (error) {
    console.error('发布失败:', error)
    showToast('操作失败', 'error')
  } finally {
    loading.value = false
  }
}

// 确认删除
const confirmDelete = (article) => {
  articleToDelete.value = article
  showDeleteModal.value = true
}

// 删除文章
const deleteArticle = async () => {
  try {
    const res = await api.deleteArticle(articleToDelete.value.id)
    if (res.success) {
      showToast('文章已删除')
      showDeleteModal.value = false
      articleToDelete.value = null
      fetchArticles()
    }
  } catch (error) {
    console.error('删除文章失败:', error)
    showToast('删除失败', 'error')
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

.btn-tag-manage {
  padding: 12px 16px;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 8px;
  color: var(--admin-accent-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-tag-manage:hover {
  background: rgba(139, 92, 246, 0.2);
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

.status-badge.draft {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
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

.action-btn.publish:hover {
  color: #22c55e;
  border-color: #22c55e;
}

.action-btn.delete:hover {
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

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

@media (max-width: 992px) {
  .article-item {
    flex-wrap: wrap;
  }
  
  .article-thumb {
    width: 80px;
    height: 56px;
  }
}

@media (max-width: 768px) {
  .article-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 12px;
  }
}
</style>
