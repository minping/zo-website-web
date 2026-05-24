<template>
  <AdminLayout>
    <div class="api-list">
      <header class="content-header">
        <div>
          <h1>API 管理</h1>
          <p>管理开放 API 接口</p>
        </div>
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
        <div v-for="api in paginatedApis" :key="api.id" class="api-card">
          <div class="api-card-header">
            <div class="api-title">
              <h3>{{ api.name }}</h3>
              <span class="api-method" :style="{ background: methodColors[api.method] }">{{ api.method }}</span>
            </div>
            <div class="api-actions">
              <button class="action-btn edit" @click="editApi(api)" title="编辑">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="action-btn delete" @click="confirmDelete(api)" title="删除">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
          <p class="api-desc">{{ api.description }}</p>
          <div class="api-tags">
            <span class="api-tag" :style="{ background: (api.tagColor || '#6366f1') + '20', color: api.tagColor || '#6366f1' }">{{ api.tag }}</span>
            <span v-if="!api.isFree" class="api-tag paid-tag">付费</span>
          </div>
          <div class="api-stats">
            <span><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>{{ api.stats?.calls || 0 }}</span>
            <span><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>{{ api.stats?.successRate || 0 }}%</span>
            <span><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>{{ api.stats?.avgTime || 0 }}ms</span>
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
        <div class="form-header">
          <h3>管理标签</h3>
          <button class="close-btn" @click="closeTagModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
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
              <button class="action-btn delete" @click="deleteTag(tag.name)" title="删除">
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

    <!-- API 表单弹窗 -->
    <div v-if="showFormModal" class="modal-overlay" @click.self="closeForm">
      <div class="form-modal">
        <div class="form-header">
          <h3>{{ editingApi ? '编辑 API' : '新建 API' }}</h3>
          <button class="close-btn" @click="closeForm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="form-row">
            <div class="form-group">
              <label>API 名称 *</label>
              <input v-model="formData.name" type="text" placeholder="输入 API 名称" required />
            </div>
            <div class="form-group">
              <label>请求方法 *</label>
              <select v-model="formData.method" required>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>接口地址 *</label>
              <input v-model="formData.endpoint" type="text" placeholder="/api/v1/example" required />
            </div>
            <div class="form-group">
              <label>分类标签 *</label>
              <select v-model="formData.tag" required>
                <option value="">选择分类</option>
                <option v-for="tag in tags" :key="tag.name" :value="tag.name">{{ tag.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>接口描述</label>
            <textarea v-model="formData.description" rows="2" placeholder="详细描述该 API"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label><input type="checkbox" v-model="formData.isFree" /> 免费 API</label>
            </div>
            <div class="form-group" v-if="!formData.isFree">
              <label>价格 (元/月)</label>
              <input v-model.number="formData.price" type="number" min="0" />
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="closeForm">取消</button>
            <button type="submit" class="btn btn-primary">{{ editingApi ? '保存' : '创建' }}</button>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { getApis } from '../../api/modules'
import AdminLayout from './AdminLayout.vue'

const apiList = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedTag = ref('全部')
const currentPage = ref(1)
const pageSize = 12
const showDeleteModal = ref(false)
const deletingApi = ref(null)
const showFormModal = ref(false)
const editingApi = ref(null)

const formData = reactive({
  name: '', method: 'GET', endpoint: '', tag: '', description: '', isFree: true, price: 0
})

// 标签管理
const tags = ref([])
const showTagModal = ref(false)
const editingTag = ref(null)
const tagForm = reactive({ name: '', color: '#6366f1' })

const loadTags = () => {
  const saved = localStorage.getItem('adminApiTags')
  if (saved) {
    tags.value = JSON.parse(saved)
  } else {
    // 默认标签
    tags.value = [
      { name: '用户', color: '#10b981' },
      { name: '内容', color: '#3b82f6' },
      { name: '数据', color: '#f59e0b' },
      { name: '工具', color: '#ef4444' }
    ]
    localStorage.setItem('adminApiTags', JSON.stringify(tags.value))
  }
}

const saveTags = () => {
  localStorage.setItem('adminApiTags', JSON.stringify(tags.value))
}

const closeTagModal = () => {
  showTagModal.value = false
  editingTag.value = null
  tagForm.name = ''
  tagForm.color = '#6366f1'
}

const addTag = () => {
  if (!tagForm.name.trim()) return
  if (editingTag.value) {
    const i = tags.value.findIndex(t => t.name === editingTag.value.name)
    if (i !== -1) {
      tags.value[i] = { name: tagForm.name.trim(), color: tagForm.color }
    }
    editingTag.value = null
  } else {
    if (tags.value.some(t => t.name === tagForm.name.trim())) return
    tags.value.push({ name: tagForm.name.trim(), color: tagForm.color })
  }
  saveTags()
  tagForm.name = ''
  tagForm.color = '#6366f1'
}

const editTag = (tag) => {
  editingTag.value = tag
  tagForm.name = tag.name
  tagForm.color = tag.color
}

const deleteTag = (name) => {
  tags.value = tags.value.filter(t => t.name !== name)
  saveTags()
}

const filterTags = computed(() => {
  const allTags = ['全部', ...tags.value.map(t => t.name)]
  // 如果有API使用了不在标签列表中的标签，也显示出来
  const usedTags = new Set(apiList.value.map(api => api.tag))
  usedTags.forEach(tag => {
    if (!tags.value.some(t => t.name === tag)) {
      allTags.push(tag)
    }
  })
  return allTags
})

const filteredApis = computed(() => {
  let result = apiList.value
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(api => api.name.toLowerCase().includes(query) || api.description?.toLowerCase().includes(query))
  }
  if (selectedTag.value !== '全部') {
    result = result.filter(api => api.tag === selectedTag.value)
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

const fetchApis = async () => {
  try {
    loading.value = true
    const savedApis = localStorage.getItem('adminApis')
    if (savedApis) {
      apiList.value = JSON.parse(savedApis)
    } else {
      const res = await getApis()
      if (res.success) apiList.value = res.data
    }
  } catch (error) {
    console.error('获取 API 列表失败:', error)
  } finally {
    loading.value = false
  }
}

const openEditor = () => {
  editingApi.value = null
  Object.assign(formData, { name: '', method: 'GET', endpoint: '', tag: '', description: '', isFree: true, price: 0 })
  showFormModal.value = true
}

const editApi = (api) => {
  editingApi.value = api
  Object.assign(formData, { name: api.name, method: api.method, endpoint: api.endpoint || '', tag: api.tag, description: api.description || '', isFree: api.isFree ?? true, price: api.price || 0 })
  showFormModal.value = true
}

const closeForm = () => {
  showFormModal.value = false
  editingApi.value = null
}

const handleSubmit = () => {
  if (!formData.name || !formData.endpoint || !formData.tag) return
  let apis = JSON.parse(localStorage.getItem('adminApis') || '[]')
  const data = { id: editingApi.value ? editingApi.value.id : Date.now(), ...formData, stats: editingApi.value?.stats || { calls: 0, successRate: 0, avgTime: 0 } }
  if (editingApi.value) {
    const i = apis.findIndex(a => a.id === editingApi.value.id)
    if (i !== -1) apis[i] = data
  } else {
    apis.push(data)
  }
  localStorage.setItem('adminApis', JSON.stringify(apis))
  apiList.value = apis
  closeForm()
}

const confirmDelete = (api) => {
  deletingApi.value = api
  showDeleteModal.value = true
}

const deleteApi = () => {
  apiList.value = apiList.value.filter(a => a.id !== deletingApi.value.id)
  localStorage.setItem('adminApis', JSON.stringify(apiList.value))
  showDeleteModal.value = false
  deletingApi.value = null
}

onMounted(() => { fetchApis(); loadTags() })
</script>

<style scoped>
/* 暗色主题 */
.api-list {
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
  margin-bottom: 24px;
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

/* 筛选栏 */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: var(--admin-bg-card);
  border: 1px solid var(--admin-border-color);
  border-radius: 8px;
  flex: 1;
  max-width: 300px;
}

.search-box svg {
  color: var(--admin-text-secondary);
}

.search-box input {
  flex: 1;
  background: none;
  border: none;
  color: var(--admin-text-primary);
  font-size: 14px;
  outline: none;
}

.search-box input::placeholder {
  color: var(--admin-text-secondary);
}

.filter-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tag {
  padding: 8px 16px;
  background: var(--admin-bg-card);
  border: 1px solid var(--admin-border-color);
  border-radius: 6px;
  color: var(--admin-text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-tag:hover,
.filter-tag.active {
  background: var(--admin-accent-primary);
  border-color: var(--admin-accent-primary);
  color: white;
}

.filter-tag .tag-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  display: inline-block;
}

/* API 网格 */
.api-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.api-card {
  background: var(--admin-bg-card);
  border: 1px solid var(--admin-border-color);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.api-card:hover {
  border-color: var(--admin-accent-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.api-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.api-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.api-title h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--admin-text-primary);
}

.api-method {
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  border-radius: 4px;
}

.api-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--admin-border-color);
  background: transparent;
  color: var(--admin-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.action-btn:hover {
  background: var(--admin-hover-bg);
}

.action-btn.edit:hover {
  border-color: var(--admin-accent-primary);
  color: var(--admin-accent-primary);
}

.action-btn.delete:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.api-desc {
  font-size: 13px;
  color: var(--admin-text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
}

.api-tags {
  display: flex;
  gap: 8px;
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
  display: flex;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--admin-border-color);
}

.api-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--admin-text-secondary);
}

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
}

.page-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--admin-border-color);
  background: var(--admin-bg-card);
  color: var(--admin-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  background: var(--admin-hover-bg);
  color: var(--admin-accent-primary);
  border-color: var(--admin-accent-primary);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: var(--admin-text-secondary);
}

/* 加载和空状态 */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 0;
  color: var(--admin-text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(99, 102, 241, 0.1);
  border-top-color: var(--admin-accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state svg {
  opacity: 0.5;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--admin-bg-card);
  border: 1px solid var(--admin-border-color);
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
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
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
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

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  opacity: 0.9;
}

/* 表单弹窗 */
.form-modal {
  background: var(--admin-bg-card);
  border: 1px solid var(--admin-border-color);
  border-radius: 12px;
  padding: 24px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--admin-text-primary);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--admin-text-secondary);
  cursor: pointer;
  padding: 4px;
}

.close-btn:hover {
  color: var(--admin-text-primary);
}

.form-modal .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-modal .form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-modal .form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--admin-text-primary);
}

.form-modal .form-group input,
.form-modal .form-group select,
.form-modal .form-group textarea {
  padding: 10px 12px;
  border: 1px solid var(--admin-border-color);
  border-radius: 6px;
  font-size: 14px;
  background: var(--admin-bg-primary);
  color: var(--admin-text-primary);
}

.form-modal .form-group input:focus,
.form-modal .form-group select:focus,
.form-modal .form-group textarea:focus {
  outline: none;
  border-color: var(--admin-accent-primary);
}

.form-modal .form-group textarea {
  resize: vertical;
  min-height: 60px;
}

.form-modal .form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--admin-border-color);
}

/* 标签管理弹窗 */
.tag-modal {
  background: var(--admin-bg-card);
  border: 1px solid var(--admin-border-color);
  border-radius: 12px;
  padding: 24px;
  max-width: 480px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.tag-form {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--admin-border-color);
}

.tag-input-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.tag-input-row input[type="text"] {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--admin-border-color);
  border-radius: 6px;
  font-size: 14px;
  background: var(--admin-bg-primary);
  color: var(--admin-text-primary);
}

.tag-input-row input[type="text"]:focus {
  outline: none;
  border-color: var(--admin-accent-primary);
}

.color-picker {
  position: relative;
}

.color-picker input[type="color"] {
  width: 40px;
  height: 40px;
  border: 1px solid var(--admin-border-color);
  border-radius: 6px;
  padding: 2px;
  cursor: pointer;
  background: var(--admin-bg-primary);
}

.tag-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tag-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: var(--admin-bg-primary);
  border: 1px solid var(--admin-border-color);
  border-radius: 8px;
}

.tag-name {
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 16px;
}

.tag-actions {
  display: flex;
  gap: 8px;
}

.tag-actions .action-btn {
  width: 28px;
  height: 28px;
}

.empty-tags {
  text-align: center;
  color: var(--admin-text-secondary);
  font-size: 14px;
  padding: 24px 0;
}

@media (max-width: 768px) {
  .content-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: none;
  }
  
  .api-grid {
    grid-template-columns: 1fr;
  }
}
</style>
