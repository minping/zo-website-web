<template>
  <AdminLayout>
    <div class="projects-page">
      <header class="content-header">
        <div>
          <h1>项目经历</h1>
          <p>管理工作经历与项目经验</p>
        </div>
        <button class="btn btn-primary" @click="openAddDialog">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          添加经历
        </button>
      </header>

      <!-- 空状态 -->
      <div v-if="projects.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
        <p>暂无项目经历</p>
        <span>点击上方按钮添加你的项目经验</span>
      </div>

      <!-- 项目列表 -->
      <div v-else class="project-list">
        <div v-for="(project, index) in projects" :key="project.id || index" class="project-card">
          <div class="project-header">
            <h3>{{ project.name }}</h3>
            <span class="project-period">{{ project.startDate }} ~ {{ project.endDate || '至今' }}</span>
          </div>
          <p class="project-role">{{ project.role }}</p>
          <p class="project-desc">{{ project.description }}</p>
          <div class="project-tags" v-if="project.tags && project.tags.length">
            <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <div class="project-actions">
            <button class="btn btn-secondary btn-sm" @click="openEditDialog(project)">编辑</button>
            <button class="btn btn-danger btn-sm" @click="handleDelete(index)">删除</button>
          </div>
        </div>
      </div>

      <!-- 添加/编辑弹窗 -->
      <div v-if="showDialog" class="modal-overlay" @click.self="closeDialog">
        <div class="modal-card">
          <h2>{{ editingProject ? '编辑项目经历' : '添加项目经历' }}</h2>
          <div class="form-group">
            <label>项目名称</label>
            <input v-model="form.name" type="text" class="input" placeholder="请输入项目名称" />
          </div>
          <div class="form-group">
            <label>担任角色</label>
            <input v-model="form.role" type="text" class="input" placeholder="请输入担任角色" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>开始日期</label>
              <input v-model="form.startDate" type="month" class="input" />
            </div>
            <div class="form-group">
              <label>结束日期</label>
              <div class="date-row">
                <input v-model="form.endDate" type="month" class="input" :disabled="form.isCurrent" />
                <label class="current-label">
                  <input v-model="form.isCurrent" type="checkbox" />
                  至今
                </label>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>项目描述</label>
            <textarea v-model="form.description" class="input textarea" rows="4" placeholder="请输入项目描述"></textarea>
          </div>
          <div class="form-group">
            <label>技术标签（逗号分隔）</label>
            <input v-model="tagInput" type="text" class="input" placeholder="例如: Vue, Java, MySQL" @blur="syncTags" />
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="closeDialog">取消</button>
            <button class="btn btn-primary" @click="handleSave">保存</button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'

const projects = ref([])
const showDialog = ref(false)
const editingProject = ref(null)
const tagInput = ref('')

const form = reactive({
  name: '',
  role: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  description: '',
  tags: []
})

onMounted(() => {
  loadProjects()
})

const loadProjects = () => {
  // TODO: 从后端加载项目经历
}

const openAddDialog = () => {
  editingProject.value = null
  resetForm()
  showDialog.value = true
}

const openEditDialog = (project) => {
  editingProject.value = project
  form.name = project.name
  form.role = project.role
  form.startDate = project.startDate
  form.endDate = project.endDate
  form.isCurrent = project.isCurrent || false
  form.description = project.description
  form.tags = [...(project.tags || [])]
  tagInput.value = (project.tags || []).join(', ')
  showDialog.value = true
}

const resetForm = () => {
  form.name = ''
  form.role = ''
  form.startDate = ''
  form.endDate = ''
  form.isCurrent = false
  form.description = ''
  form.tags = []
  tagInput.value = ''
}

const syncTags = () => {
  form.tags = tagInput.value.split(',').map(t => t.trim()).filter(Boolean)
}

const closeDialog = () => {
  showDialog.value = false
  editingProject.value = null
}

const handleSave = () => {
  syncTags()
  const data = {
    id: editingProject.value?.id || Date.now().toString(),
    name: form.name,
    role: form.role,
    startDate: form.startDate,
    endDate: form.isCurrent ? '' : form.endDate,
    isCurrent: form.isCurrent,
    description: form.description,
    tags: form.tags
  }

  if (editingProject.value) {
    const idx = projects.value.findIndex(p => p.id === editingProject.value.id)
    if (idx > -1) projects.value[idx] = data
  } else {
    projects.value.push(data)
  }

  // TODO: 同步到后端
  closeDialog()
}

const handleDelete = (index) => {
  if (confirm('确定要删除这条项目经历吗？')) {
    projects.value.splice(index, 1)
    // TODO: 同步到后端
  }
}
</script>

<style scoped>
.projects-page {
  max-width: 800px;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.content-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--admin-text-primary);
  margin: 0 0 4px 0;
}

.content-header p {
  color: var(--admin-text-secondary);
  font-size: 14px;
  margin: 0;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-primary {
  background: #6366f1;
  color: #fff;
}

.btn-primary:hover {
  background: #4f46e5;
}

.btn-secondary {
  background: var(--admin-bg-input);
  color: var(--admin-text-primary);
  border: 1px solid var(--admin-border);
}

.btn-secondary:hover {
  background: var(--admin-border);
}

.btn-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.2);
}

.btn-sm {
  padding: 6px 14px;
  font-size: 13px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: var(--admin-bg-card);
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  color: var(--admin-text-secondary);
}

.empty-state svg {
  margin-bottom: 16px;
  opacity: 0.4;
}

.empty-state p {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 4px 0;
  color: var(--admin-text-primary);
}

.empty-state span {
  font-size: 13px;
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-card {
  background: var(--admin-bg-card);
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  padding: 20px;
}

.project-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.project-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--admin-text-primary);
  margin: 0;
}

.project-period {
  font-size: 13px;
  color: var(--admin-text-secondary);
}

.project-role {
  font-size: 14px;
  color: #6366f1;
  margin: 0 0 8px 0;
}

.project-desc {
  font-size: 14px;
  color: var(--admin-text-secondary);
  margin: 0 0 12px 0;
  line-height: 1.6;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.tag {
  padding: 3px 10px;
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border-radius: 100px;
  font-size: 12px;
}

.project-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--admin-border);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: var(--admin-bg-card);
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  padding: 24px;
  width: 520px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-card h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--admin-text-primary);
  margin: 0 0 20px 0;
}

.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--admin-text-primary);
  margin-bottom: 6px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.input {
  width: 100%;
  padding: 10px 14px;
  background: var(--admin-bg-input);
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  color: var(--admin-text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.input:focus {
  border-color: #6366f1;
}

.date-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-row .input {
  flex: 1;
}

.current-label {
  display: flex !important;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  font-size: 13px !important;
  margin-bottom: 0 !important;
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--admin-border);
}
</style>
