<template>
  <AdminLayout>
    <div class="self-projects-page">
      <header class="content-header">
        <div>
          <h1>自研项目</h1>
          <p>展示个人自研项目与开源作品</p>
        </div>
        <button class="btn btn-primary" @click="openAddDialog">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          添加项目
        </button>
      </header>

      <!-- 空状态 -->
      <div v-if="projects.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 18 22 12 16 6"/>
          <polyline points="8 6 2 12 8 18"/>
        </svg>
        <p>暂无自研项目</p>
        <span>点击上方按钮展示你的开源作品</span>
      </div>

      <!-- 项目网格 -->
      <div v-else class="project-grid">
        <div v-for="(project, index) in projects" :key="project.id || index" class="project-card">
          <div class="card-header">
            <div class="project-icon" v-if="project.icon">{{ project.icon }}</div>
            <div class="project-icon fallback" v-else>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
              </svg>
            </div>
            <div class="card-links" v-if="project.demoUrl || project.githubUrl">
              <a v-if="project.demoUrl" :href="project.demoUrl" target="_blank" title="在线演示" class="link-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
              <a v-if="project.githubUrl" :href="project.githubUrl" target="_blank" title="源代码" class="link-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
              </a>
            </div>
          </div>
          <h3>{{ project.name }}</h3>
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
          <h2>{{ editingProject ? '编辑自研项目' : '添加自研项目' }}</h2>
          <div class="form-group">
            <label>项目名称</label>
            <input v-model="form.name" type="text" class="input" placeholder="请输入项目名称" />
          </div>
          <div class="form-group">
            <label>图标/Emoji</label>
            <input v-model="form.icon" type="text" class="input" placeholder="输入 emoji 作为项目图标，如 🚀" maxlength="2" />
          </div>
          <div class="form-group">
            <label>项目描述</label>
            <textarea v-model="form.description" class="input textarea" rows="3" placeholder="请输入项目描述"></textarea>
          </div>
          <div class="form-group">
            <label>在线演示地址</label>
            <input v-model="form.demoUrl" type="url" class="input" placeholder="https://" />
          </div>
          <div class="form-group">
            <label>GitHub 地址</label>
            <input v-model="form.githubUrl" type="url" class="input" placeholder="https://github.com/" />
          </div>
          <div class="form-group">
            <label>技术标签（逗号分隔）</label>
            <input v-model="tagInput" type="text" class="input" placeholder="例如: Vue 3, Spring Boot, Redis" @blur="syncTags" />
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
  icon: '',
  description: '',
  demoUrl: '',
  githubUrl: '',
  tags: []
})

onMounted(() => {
  loadProjects()
})

const loadProjects = () => {
  // TODO: 从后端加载自研项目
}

const openAddDialog = () => {
  editingProject.value = null
  resetForm()
  showDialog.value = true
}

const openEditDialog = (project) => {
  editingProject.value = project
  form.name = project.name
  form.icon = project.icon || ''
  form.description = project.description
  form.demoUrl = project.demoUrl || ''
  form.githubUrl = project.githubUrl || ''
  form.tags = [...(project.tags || [])]
  tagInput.value = (project.tags || []).join(', ')
  showDialog.value = true
}

const resetForm = () => {
  form.name = ''
  form.icon = ''
  form.description = ''
  form.demoUrl = ''
  form.githubUrl = ''
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
    icon: form.icon,
    description: form.description,
    demoUrl: form.demoUrl,
    githubUrl: form.githubUrl,
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
  if (confirm('确定要删除这个自研项目吗？')) {
    projects.value.splice(index, 1)
    // TODO: 同步到后端
  }
}
</script>

<style scoped>
.self-projects-page {
  max-width: 900px;
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

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.project-card {
  background: var(--admin-bg-card);
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.project-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(99, 102, 241, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
  font-size: 20px;
}

.project-icon.fallback {
  font-size: inherit;
}

.card-links {
  display: flex;
  gap: 6px;
}

.link-btn {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  background: var(--admin-bg-input);
  border: 1px solid var(--admin-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--admin-text-secondary);
  text-decoration: none;
  transition: all 0.2s;
}

.link-btn:hover {
  color: #6366f1;
  border-color: #6366f1;
}

.project-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--admin-text-primary);
  margin: 0 0 8px 0;
}

.project-desc {
  font-size: 13px;
  color: var(--admin-text-secondary);
  margin: 0 0 12px 0;
  line-height: 1.5;
  flex: 1;
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
