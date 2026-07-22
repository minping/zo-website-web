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
        <div v-for="(project, index) in projects" :key="project.id || index" class="project-card" @click="openEditDialog(project)">
          <!-- 封面缩略图 -->
          <div class="card-thumb" v-if="project.image">
            <img :src="project.image" :alt="project.name" />
          </div>
          <div class="card-body">
            <div class="project-header">
              <h3>{{ project.name }}</h3>
              <span class="project-period">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {{ project.startDate }} ~ {{ project.endDate }}
              </span>
            </div>
            <div class="project-role-badge">{{ project.role }}</div>
            <p class="project-desc">{{ project.description }}</p>
            <div class="card-footer">
              <div class="card-left">
                <div class="project-meta" v-if="project.acceptance || project.userBase">
                  <span v-if="project.acceptance" class="meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    验收：{{ project.acceptance }}
                  </span>
                  <span v-if="project.userBase" class="meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    用户：{{ project.userBase }}
                  </span>
                </div>
                <div class="project-tags" v-if="project.tags && project.tags.length">
                  <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>
              </div>
              <div class="card-right">
                <span class="card-edit-hint">点击编辑</span>
                <button class="btn-delete-icon" @click.stop="handleDelete(index)" title="删除">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加/编辑弹窗 -->
      <div v-if="showDialog" class="modal-overlay" @click.self="closeDialog">
        <div class="modal-card">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <div class="modal-title-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h2>{{ editingProject ? '编辑项目经历' : '添加项目经历' }}</h2>
            </div>
            <button class="modal-close-btn" @click="closeDialog" title="关闭">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="form-divider">
            <span class="divider-label">项目信息</span>
          </div>

          <div class="form-group">
            <label>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="label-icon">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              项目名称
            </label>
            <input v-model="form.name" type="text" class="input" placeholder="请输入项目名称" />
          </div>
          <div class="form-group">
            <label>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="label-icon">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              担任角色
            </label>
            <input v-model="form.role" type="text" class="input" placeholder="例如：全栈开发" />
          </div>

          <!-- 项目封面 -->
          <div class="form-group">
            <label>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="label-icon">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              项目封面
            </label>
            <div
              class="upload-area"
              :class="{ 'has-preview': form.image, 'is-uploading': uploading }"
              @click="!form.image && triggerUpload()"
            >
              <template v-if="form.image">
                <img :src="form.image" class="upload-preview" alt="封面预览" />
                <div class="upload-preview-actions">
                  <button type="button" class="btn-change" @click.stop="triggerUpload">更换</button>
                </div>
              </template>
              <template v-else>
                <div class="upload-placeholder">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span v-if="uploading">上传中...</span>
                  <span v-else>点击上传项目封面</span>
                </div>
              </template>
              <input ref="fileInputRef" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="file-input" @change="handleFileChange" />
            </div>
          </div>

          <div class="form-divider">
            <span class="divider-label">时间范围</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="label-icon">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                开始日期
              </label>
              <input v-model="form.startDate" type="month" class="input input-month" />
            </div>
            <div class="form-group">
              <label>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="label-icon">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                结束日期
              </label>
              <div class="date-row">
                <input v-model="form.endDate" type="month" class="input input-month" :disabled="form.isCurrent" />
                <label class="current-label">
                  <input v-model="form.isCurrent" type="checkbox" />
                  至今
                </label>
              </div>
            </div>
          </div>

          <div class="form-divider">
            <span class="divider-label">项目详情</span>
          </div>

          <div class="form-group">
            <label>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="label-icon">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              项目描述
            </label>
            <textarea v-model="form.description" class="input textarea" rows="4" placeholder="请输入项目描述..."></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="label-icon">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                验收情况
              </label>
              <input v-model="form.acceptance" type="text" class="input" placeholder="例如：已通过甲方验收" />
            </div>
            <div class="form-group">
              <label>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="label-icon">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                用户基数
              </label>
              <input v-model="form.userBase" type="text" class="input" placeholder="例如：10万+" />
            </div>
          </div>
          <div class="form-group">
            <label>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="label-icon">
                <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
              </svg>
              技术标签
            </label>
            <div class="tag-input" :class="{ focused: tagInputFocused }" @click="focusTagInput">
              <span v-for="(tag, i) in form.tags" :key="i" class="tag-pill">
                {{ tag }}
                <button class="tag-remove" @click.stop="removeTag(i)">&times;</button>
              </span>
              <input
                ref="tagInputEl"
                v-model="tagInputValue"
                class="tag-input-text"
                placeholder="输入后回车添加"
                @focus="tagInputFocused = true"
                @blur="tagInputFocused = false"
                @keydown.enter.prevent="addTag"
                @keydown.,.prevent="addTag"
                @keydown.delete="handleTagBackspace"
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn btn-cancel" @click="closeDialog">取消</button>
            <button class="btn btn-save" @click="handleSave">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
              </svg>
              保存
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </Transition>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import api from '../../api/article.js'

// Toast
const toast = ref({ show: false, message: '', type: 'success' })
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 2500)
}

const projects = ref([])
const showDialog = ref(false)
const editingProject = ref(null)

// 标签输入
const tagInputValue = ref('')
const tagInputFocused = ref(false)
const tagInputEl = ref(null)

const focusTagInput = () => {
  tagInputEl.value?.focus()
}

const addTag = () => {
  const value = tagInputValue.value.trim()
  if (value && !form.tags.includes(value)) {
    form.tags.push(value)
  }
  tagInputValue.value = ''
}

const removeTag = (index) => {
  form.tags.splice(index, 1)
}

const handleTagBackspace = () => {
  if (tagInputValue.value === '' && form.tags.length > 0) {
    form.tags.pop()
  }
}

const form = reactive({
  name: '',
  role: '',
  image: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  description: '',
  acceptance: '',
  userBase: '',
  tags: []
})

// 图片上传
const fileInputRef = ref(null)
const uploading = ref(false)

const triggerUpload = () => {
  fileInputRef.value?.click()
}

const handleFileChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  await doUpload(file)
  e.target.value = ''
}

const doUpload = async (file) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(file.type)) {
    showToast('仅支持 JPG、PNG、WebP、GIF 格式', 'error')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('图片大小不能超过 5MB', 'error')
    return
  }
  uploading.value = true
  try {
    const res = await api.uploadImage(file)
    if (res.success && res.data) {
      form.image = res.data.url || res.data.filePath || ''
      showToast('封面上传成功')
    } else {
      showToast(res.message || '上传失败', 'error')
    }
  } catch {
    showToast('上传失败，请重试', 'error')
  } finally {
    uploading.value = false
  }
}

onMounted(() => {
  loadProjects()
})

const loadProjects = async () => {
  try {
    const res = await api.getProjectList()
    // 兼容多种响应格式
    if (res.success || res.code === 200 || res.code === 0) {
      projects.value = res.data || []
    } else if (res.data) {
      projects.value = res.data
    }
    console.log('项目列表:', res, projects.value)
  } catch (e) {
    console.error('加载项目列表失败:', e)
    showToast('加载项目列表失败', 'error')
  }
}

const openAddDialog = () => {
  editingProject.value = null
  resetForm()
  showDialog.value = true
}

const openEditDialog = async (project) => {
  editingProject.value = project
  let detail = null
  // 获取详情以确保数据完整
  try {
    const res = await api.getProjectDetail(project.id)
    console.log('项目详情响应:', res)
    if (res.success || res.code === 200 || res.code === 0) {
      detail = res.data
    } else if (res.data) {
      // 兼容其他响应格式，直接使用 data
      detail = res.data
    }
  } catch (e) {
    console.error('获取项目详情失败:', e)
  }
  // 降级：如果详情获取失败，使用列表数据
  if (!detail) {
    detail = project
  }
  form.name = detail.name
  form.role = detail.role
  form.image = detail.image || ''
  form.startDate = detail.startDate
  form.isCurrent = detail.isCurrent || detail.endDate === '至今'
  form.endDate = form.isCurrent ? '' : detail.endDate
  form.description = detail.description
  form.acceptance = detail.acceptance || ''
  form.userBase = detail.userBase || ''
  form.tags = [...(detail.tags || [])]
  tagInputValue.value = ''
  showDialog.value = true
}

const resetForm = () => {
  form.name = ''
  form.role = ''
  form.image = ''
  form.startDate = ''
  form.endDate = ''
  form.isCurrent = false
  form.description = ''
  form.acceptance = ''
  form.userBase = ''
  form.tags = []
  tagInputValue.value = ''
}

const closeDialog = () => {
  showDialog.value = false
  editingProject.value = null
}

const handleSave = async () => {
  const payload = {
    name: form.name,
    role: form.role,
    description: form.description,
    finish_status: form.acceptance,
    user_num: form.userBase,
    tech: form.tags.join(','),
    image: form.image,
    start_time: form.startDate,
    end_time: form.isCurrent ? '至今' : form.endDate
  }

  // 编辑时传入 id
  if (editingProject.value?.id) {
    payload.id = editingProject.value.id
  }

  try {
    const res = await api.saveProject(payload)
    if (res.code === 200 || res.code === 0 || res.success) {
      showToast(editingProject.value?.id ? '项目更新成功' : '项目创建成功')
      await loadProjects()
      closeDialog()
    } else {
      showToast(res.message || '保存失败', 'error')
    }
  } catch (e) {
    console.error('保存项目失败:', e)
    showToast('保存失败，请重试', 'error')
  }
}

const handleDelete = (index) => {
  if (confirm('确定要删除这条项目经历吗？')) {
    projects.value.splice(index, 1)
    // TODO: 同步到后端
  }
}
</script>

<style scoped src="./AdminProjects.css"></style>
