<template>
  <AdminLayout>
    <div class="api-list">
      <header class="content-header">
        <div>
          <h1>API 管理</h1>
          <p>管理开放 API 接口</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" @click="openEditor()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            新建 API
          </button>
          <button class="btn btn-secondary" @click="showTagModal = true">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            管理标签
          </button>
        </div>
      </header>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <div class="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" v-model="searchQuery" placeholder="搜索 API 名称或描述..."/>
        </div>
        <div class="filter-tags">
          <button v-for="tag in filterTags" :key="tag" class="filter-tag" :class="{ active: selectedTag === tag }" @click="selectedTag = tag">
            <span v-if="tag !== '全部'" class="tag-dot" :style="{ background: getTagColor(tag) }"></span>
            {{ tag }}
          </button>
        </div>
      </div>

      <!-- API 列表 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <div v-else-if="filteredApis.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
        <p>暂无 API</p>
      </div>

      <div v-else class="api-grid">
        <div v-for="api in paginatedApis" :key="api.id" class="api-card" @click="editApi(api)">
          <span class="status-flag" :class="Number(api.status) === 1 ? 'status-on' : 'status-off'">
            <span class="status-dot"></span>{{ Number(api.status) === 1 ? '已上架' : '已下架' }}
          </span>
          <div class="api-card-header">
            <div class="api-title">
              <h3>{{ api.name }}</h3>
              <span class="api-method" :style="{ background: methodColors[api.method] }">{{ api.method }}</span>
            </div>
          </div>
          <p class="api-desc">{{ api.description }}</p>
          <div class="api-tags">
            <span v-for="tag in getApiTags(api)" :key="tag" class="api-tag" :style="{ background: (getTagColor(tag) || '#6366f1') + '20', color: getTagColor(tag) || '#6366f1' }">{{ tag }}</span>
            <span v-if="!api.isFree" class="api-tag paid-tag">付费</span>
          </div>
          <div class="api-stats">
            <span><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>{{ api.stats?.calls || 0 }}</span>
            <span><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>{{ api.stats?.successRate || 0 }}%</span>
            <span><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>{{ api.stats?.avgTime || 0 }}ms</span>
            <span v-if="api.responseTime > 0" class="stat-response"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>{{ api.responseTime }}ms</span>
          </div>
          <div class="api-card-footer">
            <button class="action-btn delete" @click.stop="confirmDelete(api)" title="删除">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>

    <!-- 标签管理弹窗 -->
    <div v-if="showTagModal" class="modal-overlay" @click.self="closeTagModal">
      <div class="tag-modal">
        <button class="modal-close-btn" @click="closeTagModal" title="关闭">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <h3 class="modal-title">管理标签</h3>
        <div class="tag-form">
          <div class="tag-input-row">
            <input v-model="tagForm.name" type="text" placeholder="标签名称" />
            <div class="color-picker">
              <input v-model="tagForm.color" type="color" />
            </div>
            <button class="btn btn-primary" @click="addTag">{{ editingTag ? '更新' : '添加' }}</button>
          </div>
        </div>
        <div class="tag-list">
          <div v-for="tag in tags" :key="tag.name" class="tag-item">
            <span class="tag-name" :style="{ background: tag.color + '20', color: tag.color }">{{ tag.name }}</span>
            <div class="tag-actions">
              <button class="action-btn edit" @click="editTag(tag)" title="编辑">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="action-btn delete" @click="deleteTag(tag.id)" title="删除">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
          <div v-if="tags.length === 0" class="empty-tags">暂无标签，请添加</div>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal">
        <h3>确认删除</h3>
        <p>确定要删除 API「{{ deletingApi?.name }}」吗？此操作不可恢复。</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showDeleteModal = false">取消</button>
          <button class="btn btn-danger" @click="deleteApi">确认删除</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      {{ toast.message }}
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../../api/article'
import AdminLayout from './AdminLayout.vue'

const router = useRouter()

const apiList = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedTag = ref('全部')
const currentPage = ref(1)
const pageSize = 12
const showDeleteModal = ref(false)
const deletingApi = ref(null)

// 标签管理
const tags = ref([])
const showTagModal = ref(false)
const editingTag = ref(null)
const tagForm = reactive({ name: '', color: '#6366f1' })

const getApiTags = (api) => {
  if (api.tagText) return api.tagText.split('^').filter(Boolean)
  if (Array.isArray(api.tags)) return api.tags
  if (api.tag) return [api.tag]
  return []
}

// Toast
const toast = ref({ show: false, message: '', type: 'success' })
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

// ========== 标签操作（调用 3 个真实接口） ==========

const loadTags = async () => {
  try {
    const res = await api.getApiTags()
    if (res.success && res.data) {
      tags.value = res.data
    }
  } catch (error) {
    console.error('获取标签失败:', error)
  }
}

const closeTagModal = () => {
  showTagModal.value = false
  editingTag.value = null
  tagForm.name = ''
  tagForm.color = '#6366f1'
}

const addTag = async () => {
  if (!tagForm.name.trim()) return
  try {
    const id = editingTag.value ? editingTag.value.id : ''
    const res = await api.saveApiTag(id, tagForm.name.trim(), tagForm.color)
    if (res.success) {
      showToast(editingTag.value ? '标签已更新' : '标签已添加')
      await loadTags()
      closeTagModal()
    } else {
      showToast(res.message || '操作失败', 'error')
    }
  } catch (error) {
    console.error('操作标签失败:', error)
    showToast('操作失败', 'error')
  }
}

const editTag = (tag) => {
  editingTag.value = tag
  tagForm.name = tag.name
  tagForm.color = tag.color
}

const deleteTag = async (tagId) => {
  try {
    const res = await api.deleteApiTag(tagId)
    if (res.success) {
      showToast('标签已删除')
      await loadTags()
    } else {
      showToast(res.message || '删除失败', 'error')
    }
  } catch (error) {
    console.error('删除标签失败:', error)
    showToast('删除失败', 'error')
  }
}

// ========== 筛选 ==========

const filterTags = computed(() => {
  const allTags = ['全部', ...tags.value.map(t => t.name)]
  return allTags
})

const filteredApis = computed(() => {
  let result = apiList.value
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(api => api.name.toLowerCase().includes(query) || api.description?.toLowerCase().includes(query))
  }
  if (selectedTag.value !== '全部') {
    result = result.filter(api => {
      const apiTags = Array.isArray(api.tags) ? api.tags : (api.tag ? [api.tag] : [])
      return apiTags.includes(selectedTag.value)
    })
  }
  return result
})

const totalPages = computed(() => Math.ceil(filteredApis.value.length / pageSize))

const paginatedApis = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredApis.value.slice(start, start + pageSize)
})

const methodColors = { GET: '#10b981', POST: '#3b82f6', PUT: '#f59e0b', DELETE: '#ef4444' }

const getTagColor = (tagName) => {
  const tag = tags.value.find(t => t.name === tagName)
  return tag ? tag.color : '#6366f1'
}

// ========== API 操作 ==========

const fetchApis = async () => {
  try {
    loading.value = true
    const res = await api.getApiList()
    if (res.success && res.data) {
      apiList.value = res.data
    }
  } catch (error) {
    console.error('获取 API 列表失败:', error)
  } finally {
    loading.value = false
  }
}

const openEditor = () => {
  router.push('/admin/apis/editor')
}

const editApi = (apiItem) => {
  router.push({ path: '/admin/apis/editor', query: { id: apiItem.id } })
}

const confirmDelete = (apiItem) => {
  deletingApi.value = apiItem
  showDeleteModal.value = true
}

const deleteApi = async () => {
  try {
    const res = await api.deleteApi(deletingApi.value.id)
    if (res.success) {
      showToast('API 已删除')
      await fetchApis()
    } else {
      showToast(res.message || '删除失败', 'error')
    }
  } catch (error) {
    console.error('删除 API 失败:', error)
    showToast('删除失败', 'error')
  }
  showDeleteModal.value = false
  deletingApi.value = null
}

onMounted(() => {
  fetchApis()
  loadTags()
})
</script>

<style src="./AdminApiList.css"></style>
