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
        <div v-for="(project, index) in projects" :key="project.id || index" class="project-card" @click="openEditDialog(project)">
          <div class="card-header">
            <div class="project-icon" v-if="project.icon">
              <img v-if="isImageUrl(project.icon)" :src="project.icon" alt="icon" />
              <span v-else>{{ project.icon }}</span>
            </div>
            <div class="project-icon fallback" v-else>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
              </svg>
            </div>
            <div class="card-actions">
              <div class="card-links" v-if="project.demoUrl || project.githubUrl">
                <a v-if="project.demoUrl" :href="project.demoUrl" target="_blank" title="在线演示" class="link-btn" @click.stop>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
                <a v-if="project.githubUrl" :href="project.githubUrl" target="_blank" title="源代码" class="link-btn" @click.stop>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                  </svg>
                </a>
              </div>
              <button class="btn-delete" @click.stop="handleDelete(index)" title="删除项目">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
          <h3>{{ project.name }}</h3>
          <p class="project-desc">{{ project.description }}</p>
          <div class="project-tags" v-if="project.tags && project.tags.length">
            <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <div class="click-hint">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
            点击编辑
          </div>
        </div>
      </div>

      <!-- 添加/编辑弹窗 -->
      <div v-if="showDialog" class="modal-overlay" @click.self="closeDialog">
        <div class="modal-card">
          <div class="modal-header">
            <h2>{{ editingProject ? '编辑自研项目' : '添加自研项目' }}</h2>
            <button class="modal-close" @click="closeDialog">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- 基本信息 -->
          <div class="form-section">
            <div class="form-row icon-row">
              <div class="form-group flex-1">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  项目名称
                  <span class="required">*</span>
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  class="input"
                  :class="{ 'input-error': errors.name }"
                  placeholder="请输入项目名称"
                  @input="errors.name = ''"
                />
                <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
              </div>
              <div class="form-group icon-group">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  项目图标
                </label>
                <div class="icon-upload-area" @click="triggerIconUpload" @dragover.prevent @drop.prevent="handleIconDrop">
                  <!-- 已上传：显示图片预览 -->
                  <template v-if="iconPreviewUrl">
                    <div class="icon-upload-preview">
                      <img :src="iconPreviewUrl" alt="项目图标" />
                      <button class="icon-remove-btn" @click.stop="removeIcon" title="移除图标">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  </template>
                  <!-- 上传中 -->
                  <template v-else-if="iconUploading">
                    <div class="icon-upload-loading">
                      <span class="spinner"></span>
                      <span>上传中...</span>
                    </div>
                  </template>
                  <!-- 默认：上传提示 -->
                  <template v-else>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span class="upload-hint">点击或拖拽上传图标</span>
                    <span class="upload-sub-hint">PNG、JPG、SVG，不超过 2MB</span>
                  </template>
                </div>
                <input
                  ref="iconFileInput"
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  style="display:none"
                  @change="handleIconFileChange"
                />
              </div>
            </div>

            <div class="form-group">
              <label>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                项目描述
              </label>
              <textarea
                v-model="form.description"
                class="input textarea"
                :class="{ 'input-error': errors.description }"
                rows="3"
                placeholder="简要描述项目功能与亮点"
                maxlength="200"
                @input="errors.description = ''"
              ></textarea>
              <span class="char-count">{{ form.description.length }}/200</span>
              <span v-if="errors.description" class="error-msg">{{ errors.description }}</span>
            </div>
          </div>

          <!-- 链接信息 -->
          <div class="form-section">
            <div class="form-row two-col">
              <div class="form-group">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  在线演示
                </label>
                <input
                  v-model="form.demoUrl"
                  type="url"
                  class="input"
                  :class="{ 'input-error': errors.demoUrl }"
                  placeholder="https://"
                  @input="errors.demoUrl = ''"
                />
                <span v-if="errors.demoUrl" class="error-msg">{{ errors.demoUrl }}</span>
              </div>
              <div class="form-group">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                  GitHub
                </label>
                <input
                  v-model="form.githubUrl"
                  type="url"
                  class="input"
                  :class="{ 'input-error': errors.githubUrl }"
                  placeholder="https://github.com/"
                  @input="errors.githubUrl = ''"
                />
                <span v-if="errors.githubUrl" class="error-msg">{{ errors.githubUrl }}</span>
              </div>
            </div>
          </div>

          <!-- 技术标签 -->
          <div class="form-section">
            <div class="form-group">
              <label>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                技术标签
              </label>
              <div class="tag-input-area" @click="focusTagInput">
                <span v-for="(tag, idx) in form.tags" :key="idx" class="tag-chip">
                  {{ tag }}
                  <button class="tag-remove" @click.stop="removeTag(idx)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </span>
                <input
                  ref="tagInputRef"
                  v-model="tagInput"
                  type="text"
                  class="tag-inline-input"
                  placeholder="输入后按回车添加"
                  @keydown.enter.prevent="addTag"
                  @keydown.backspace="handleBackspace"
                  @keydown.,="handleComma"
                />
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn btn-secondary" @click="closeDialog" :disabled="saving">取消</button>
            <button class="btn btn-primary" @click="handleSave" :disabled="saving">
              <span v-if="saving" class="spinner-small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              {{ saving ? '保存中...' : (editingProject ? '保存修改' : '添加项目') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Toast 提示 -->
      <Transition name="toast">
        <div v-if="toast.show" class="toast" :class="toast.type">
          {{ toast.message }}
        </div>
      </Transition>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import { api } from '../../api/article.js'

const projects = ref([])
const showDialog = ref(false)
const editingProject = ref(null)
const tagInput = ref('')
const tagInputRef = ref(null)
const iconFileInput = ref(null)

// 图片上传状态
const iconUploading = ref(false)
const iconPreviewUrl = ref('')

// 保存 & 加载状态
const saving = ref(false)
const loading = ref(false)

// Toast
const toast = ref({ show: false, message: '', type: 'success' })
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 2500)
}

const form = reactive({
  name: '',
  icon: '',
  description: '',
  demoUrl: '',
  githubUrl: '',
  tags: []
})

const errors = reactive({
  name: '',
  description: '',
  demoUrl: '',
  githubUrl: ''
})

onMounted(() => {
  loadProjects()
})

const loadProjects = async () => {
  loading.value = true
  try {
    const res = await api.getProductList()
    if (res.code === 200 || res.code === 0 || res.success) {
      projects.value = res.data || []
    } else {
      showToast(res.message || '加载项目列表失败', 'error')
    }
  } catch (e) {
    console.error('加载项目列表失败:', e)
    showToast('加载项目列表失败，请重试', 'error')
  } finally {
    loading.value = false
  }
}

const isImageUrl = (str) => {
  return /^(https?:\/\/|data:image\/)/i.test(str)
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
  tagInput.value = ''
  // 编辑时预览已有图标
  iconPreviewUrl.value = isImageUrl(project.icon) ? project.icon : ''
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
  iconPreviewUrl.value = ''
  clearErrors()
}

const clearErrors = () => {
  errors.name = ''
  errors.description = ''
  errors.demoUrl = ''
  errors.githubUrl = ''
}

// ========== 图标上传 ==========
const triggerIconUpload = () => {
  if (!iconUploading.value) {
    iconFileInput.value?.click()
  }
}

const handleIconFileChange = async (e) => {
  const file = e.target.files?.[0]
  if (file) await uploadIconFile(file)
  // 重置 input 以允许重复选同一个文件
  if (iconFileInput.value) iconFileInput.value.value = ''
}

const handleIconDrop = async (e) => {
  const file = e.dataTransfer?.files?.[0]
  if (file) await uploadIconFile(file)
}

const uploadIconFile = async (file) => {
  // 校验类型
  const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    showToast('仅支持 PNG、JPG、SVG、WebP 格式的图片', 'error')
    return
  }
  // 校验大小
  if (file.size > 2 * 1024 * 1024) {
    showToast('图片大小不能超过 2MB', 'error')
    return
  }

  iconUploading.value = true
  try {
    const res = await api.uploadImage(file)
    if (res && res.data) {
      const url = res.data.url || res.data.filePath || ''
      if (url) {
        iconPreviewUrl.value = url
        form.icon = url
        showToast('图标上传成功', 'success')
      } else {
        showToast('上传失败：未获取到图片地址', 'error')
      }
    } else {
      showToast('上传失败，请重试', 'error')
    }
  } catch (err) {
    console.error('图标上传失败:', err)
    showToast('上传失败，请检查网络后重试', 'error')
  } finally {
    iconUploading.value = false
  }
}

const removeIcon = () => {
  iconPreviewUrl.value = ''
  form.icon = ''
}
// ================================

// 标签管理
const addTag = () => {
  const value = tagInput.value.trim()
  if (value && !form.tags.includes(value) && form.tags.length < 10) {
    form.tags.push(value)
    tagInput.value = ''
  }
}

const removeTag = (idx) => {
  form.tags.splice(idx, 1)
}

const handleComma = (e) => {
  e.preventDefault()
  addTag()
}

const handleBackspace = () => {
  if (!tagInput.value && form.tags.length > 0) {
    form.tags.pop()
  }
}

const focusTagInput = () => {
  tagInputRef.value?.focus()
}

// 同步标签（兼容旧逻辑：blur 时逗号分隔文本也转成 tag）
const syncTags = () => {
  if (!tagInput.value.trim()) return
  const parts = tagInput.value.split(',').map(t => t.trim()).filter(Boolean)
  parts.forEach(p => {
    if (!form.tags.includes(p) && form.tags.length < 10) {
      form.tags.push(p)
    }
  })
  tagInput.value = ''
}

// 表单验证
const validate = () => {
  clearErrors()
  let valid = true

  if (!form.name.trim()) {
    errors.name = '请输入项目名称'
    valid = false
  }

  if (form.demoUrl && !/^https?:\/\/.+/.test(form.demoUrl)) {
    errors.demoUrl = '请输入有效的 URL（以 http:// 或 https:// 开头）'
    valid = false
  }

  if (form.githubUrl && !/^https?:\/\/.+/.test(form.githubUrl)) {
    errors.githubUrl = '请输入有效的 URL（以 http:// 或 https:// 开头）'
    valid = false
  }

  return valid
}

const closeDialog = () => {
  showDialog.value = false
  editingProject.value = null
}

const handleSave = async () => {
  syncTags()
  if (!validate()) return

  saving.value = true

  const payload = {
    name: form.name,
    img: form.icon,
    description: form.description,
    playUrl: form.demoUrl,
    githubUrl: form.githubUrl,
    tags: form.tags.join(',')
  }

  // 编辑时传入 id
  if (editingProject.value?.id) {
    payload.id = editingProject.value.id
  }

  try {
    const res = await api.saveProduct(payload)
    if (res.code === 200 || res.code === 0 || res.success) {
      showToast(editingProject.value?.id ? '项目更新成功' : '项目创建成功', 'success')
      closeDialog()
      await loadProjects()
    } else {
      showToast(res.message || '保存失败', 'error')
    }
  } catch (e) {
    console.error('保存失败:', e)
    showToast('保存失败，请重试', 'error')
  } finally {
    saving.value = false
  }
}

const handleDelete = (index) => {
  if (confirm('确定要删除这个自研项目吗？')) {
    projects.value.splice(index, 1)
    // TODO: 同步到后端
  }
}
</script>

<style scoped src="./AdminSelfProjects.css"></style>
