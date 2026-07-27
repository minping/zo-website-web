<template>
  <AdminLayout>
    <div class="project-form-page">
      <header class="content-header">
        <div class="header-left">
          <button class="back-btn" @click="goBack">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div>
            <h1>{{ isEditing ? '编辑项目经历' : '添加项目经历' }}</h1>
            <p>{{ isEditing ? '修改项目经历信息' : '记录新的项目经验' }}</p>
          </div>
        </div>
      </header>

      <form class="form-container">
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
              <img :src="form.image" class="upload-preview-img" alt="封面预览" />
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
          <div class="desc-editor">
            <div class="desc-toolbar">
              <button type="button" class="desc-tool-btn" @click="insertBold" title="标记重点 (Ctrl+B)">
                <strong>B</strong>
              </button>
              <span class="desc-toolbar-divider"></span>
              <button type="button" class="desc-preview-toggle" :class="{ active: descPreview }" @click="descPreview = !descPreview" title="预览效果">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                {{ descPreview ? '编辑' : '预览' }}
              </button>
            </div>
            <textarea
              v-if="!descPreview"
              ref="descTextareaRef"
              v-model="form.description"
              class="input textarea desc-textarea"
              rows="12"
              placeholder="请输入项目描述...&#10;支持换行，使用 **文本** 标记重点内容"
              @keydown="handleDescKeydown"
            ></textarea>
            <div
              v-else
              class="desc-preview-content"
              v-html="formatDescription(form.description) || '<span class=&quot;desc-placeholder&quot;>暂无描述内容</span>'"
            ></div>
          </div>
          <span class="form-hint">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            支持换行，使用 <code>**文本**</code> 标记重点内容
          </span>
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
            />
          </div>
        </div>

      </form>

      <div class="form-actions">
        <button type="button" class="btn btn-cancel" @click="goBack">取消</button>
        <button type="submit" class="btn btn-save" :disabled="saving" @click="handleSave">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
          </svg>
          {{ saving ? '保存中...' : '保存' }}
        </button>
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
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from './AdminLayout.vue'
import api from '../../api/article.js'

const router = useRouter()
const route = useRoute()

// Toast
const toast = ref({ show: false, message: '', type: 'success' })
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 2500)
}

const isEditing = ref(false)
const saving = ref(false)
const editingId = ref(null)
const descPreview = ref(false)
const descTextareaRef = ref(null)

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

// 描述编辑器 - 格式化文本
const formatDescription = (text) => {
  if (!text) return ''
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const withBreaks = escaped.replace(/\n/g, '<br>')
  const withHighlights = withBreaks.replace(/\*\*(.+?)\*\*/g, '<strong class="highlight">$1</strong>')
  return withHighlights
}

// 插入 ** 重点标记
const insertBold = () => {
  const el = descTextareaRef.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const text = form.description
  const before = text.substring(0, start)
  const selected = text.substring(start, end)
  const after = text.substring(end)

  if (selected) {
    form.description = before + '**' + selected + '**' + after
    const newPos = before.length + selected.length + 4
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(newPos, newPos)
    })
  } else {
    form.description = before + '****' + after
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + 2, start + 2)
    })
  }
}

// Ctrl+B 快捷键
const handleDescKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
    e.preventDefault()
    insertBold()
  }
}

const goBack = () => {
  router.push('/admin/projects')
}

const loadProject = async (id) => {
  try {
    const res = await api.getProjectDetail(id)
    console.log('项目详情响应:', res)
    let detail = null
    if (res.success || res.code === 200 || res.code === 0) {
      detail = res.data
    } else if (res.data) {
      detail = res.data
    }
    if (detail) {
      isEditing.value = true
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
    } else {
      showToast('项目不存在', 'error')
      setTimeout(() => router.push('/admin/projects'), 1500)
    }
  } catch (e) {
    console.error('获取项目详情失败:', e)
    showToast('加载项目详情失败', 'error')
  }
}

const handleSave = async () => {
  if (!form.name.trim()) {
    showToast('请填写项目名称', 'error')
    return
  }
  saving.value = true

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

  if (editingId.value) {
    payload.id = editingId.value
  }

  try {
    const res = await api.saveProject(payload)
    if (res.code === 200 || res.code === 0 || res.success) {
      showToast(editingId.value ? '项目更新成功' : '项目创建成功')
      setTimeout(() => {
        router.push('/admin/projects')
      }, 800)
    } else {
      showToast(res.message || '保存失败', 'error')
    }
  } catch (e) {
    console.error('保存项目失败:', e)
    showToast('保存失败，请重试', 'error')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  const id = route.query.id
  if (id) {
    editingId.value = id
    loadProject(id)
  }
})
</script>

<style scoped src="./AdminProjectForm.css"></style>
