<template>
  <AdminLayout>
    <div class="article-editor">
      <header class="content-header">
        <div class="header-left">
          <button class="back-btn" @click="goBack">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div>
            <h1>{{ isEditing ? '编辑文章' : '新建文章' }}</h1>
            <p>{{ isEditing ? '修改文章内容' : '创建一个新文章' }}</p>
          </div>
        </div>
      </header>

      <form class="editor-form" @submit.prevent="saveArticle">
        <div class="form-main">
          <div class="form-group">
            <label>文章标题 <span class="required">*</span></label>
            <input 
              v-model="formData.title" 
              type="text" 
              placeholder="输入文章标题"
              required
            />
          </div>

          <div class="form-group">
            <label>文章描述 <span class="required">*</span></label>
            <textarea 
              v-model="formData.desc" 
              placeholder="输入文章简介（显示在列表中）"
              rows="2"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label>文章内容（Markdown） <span class="required">*</span></label>
            <div class="milkdown-editor-wrapper">
              <MilkdownEditor v-model="formData.content" />
            </div>
          </div>

          <div class="form-group">
            <label>附件管理</label>
            <div class="attachment-section">
              <div class="attachment-upload-area">
                <input 
                  ref="attachmentInput"
                  type="file" 
                  class="attachment-file-input"
                  @change="handleAttachmentChange"
                  :disabled="attachmentUploading"
                />
                <div class="attachment-upload-placeholder" @click="$refs.attachmentInput.click()">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span class="upload-text">{{ attachmentUploading ? '上传中...' : '点击选择文件' }}</span>
                  <span class="upload-hint">支持 PDF、Word、压缩包等</span>
                </div>
              </div>

              <div v-if="attachments.length > 0" class="attachment-list">
                <div 
                  v-for="(file, index) in attachments" 
                  :key="index"
                  class="attachment-item"
                >
                  <div class="attachment-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                      <polyline points="13 2 13 9 20 9"/>
                    </svg>
                  </div>
                  <div class="attachment-info">
                    <span class="attachment-name" :title="file.name">{{ file.name }}</span>
                    <span class="attachment-size">{{ formatFileSize(file.size) }}</span>
                  </div>
                  <button class="attachment-delete" @click="removeAttachment(index)" title="删除附件">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div v-else class="attachment-empty">
                <span>暂未上传附件</span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-sidebar">
          <div class="sidebar-card">
            <h3>发布设置</h3>
            
            <div class="form-group">
              <label>标签 <span class="required">*</span></label>
              <select v-model="formData.selectedTag" required>
                <option value="">选择标签</option>
                <option v-for="tag in availableTags" :key="tag.id" :value="tag">{{ tag.name }}</option>
              </select>
            </div>


            <div class="form-group">
              <label>封面渐变色</label>
              <div class="gradient-editor">
                <div class="gradient-colors">
                  <div class="color-picker-wrapper">
                    <input 
                      v-model="gradientStart" 
                      type="color" 
                      class="color-input"
                    />
                    <span class="color-label">起始色</span>
                  </div>
                  <span class="color-arrow">→</span>
                  <div class="color-picker-wrapper">
                    <input 
                      v-model="gradientEnd" 
                      type="color" 
                      class="color-input"
                    />
                    <span class="color-label">结束色</span>
                  </div>
                </div>
                <div class="gradient-angle">
                  <label>角度</label>
                  <input 
                    v-model.number="gradientAngle" 
                    type="number" 
                    min="0" 
                    max="360" 
                    class="angle-input"
                  />
                  <span>°</span>
                </div>
                <div class="gradient-preview" :style="{ background: formData.gradient }"></div>
                <div class="gradient-presets">
                  <span class="preset-label">预设:</span>
                  <button 
                    v-for="preset in gradientPresets" 
                    :key="preset.gradient"
                    class="preset-btn"
                    :style="{ background: preset.gradient }"
                    :title="preset.name"
                    @click="applyPreset(preset)"
                  ></button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>发布状态</label>
              <select v-model="formData.status">
                <option value="draft">草稿</option>
                <option value="published">立即发布</option>
              </select>
            </div>
          </div>

          <div class="sidebar-card">
            <h3>其他信息</h3>

            <div class="form-group">
              <label>作者 <span class="required">*</span></label>
              <input 
                v-model="formData.author" 
                type="text" 
                placeholder="作者名称"
                required
              />
            </div>

            <div class="form-group">
              <label>阅读时间（分钟）</label>
              <input 
                v-model.number="formData.readTime" 
                type="number" 
                min="1" 
                placeholder="5"
              />
            </div>

          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="goBack">
              取消
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? '保存中...' : '保存文章' }}
            </button>
            <span v-if="autoSavePending" class="auto-save-indicator">自动保存中...</span>
          </div>
        </div>
      </form>
    </div>

    <!-- 提示消息 -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </Transition>
  </AdminLayout>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '../../api/article'
import AdminLayout from './AdminLayout.vue'
import MilkdownEditor from './MilkdownEditor.vue'

const router = useRouter()
const route = useRoute()

// 状态
const saving = ref(false)
const isEditing = ref(false)
const autoSavePending = ref(false)

// 自动保存
let autoSaveTimer = null
const AUTO_SAVE_DELAY = 10000

// 检查必填项
const hasRequiredFields = () => {
  return formData.value.title.trim() &&
    formData.value.desc.trim() &&
    formData.value.content.trim() &&
    formData.value.selectedTag &&
    formData.value.author.trim()
}

// 自动保存
const autoSave = async () => {
  if (saving.value || !hasRequiredFields()) return
  autoSavePending.value = true
  try {
    const selectedTag = formData.value.selectedTag
    const articleData = {
      ...formData.value,
      tagValue: selectedTag?.id || '',
      tagText: selectedTag?.name || '',
      id: isEditing.value ? formData.value.id : undefined,
      files: JSON.stringify(attachments.value)
    }

    const res = isEditing.value
      ? await api.updateArticle(articleData)
      : await api.createArticle(articleData)

    if (res.success) {
      // 新建文章首次自动保存后，切换到编辑模式
      if (!isEditing.value) {
        isEditing.value = true
        if (res.data?.id) {
          formData.value.id = res.data.id
        }
      }
      showToast('已自动保存', 'success')
    }
  } catch (error) {
    console.error('自动保存失败:', error)
  } finally {
    autoSavePending.value = false
  }
}

// 重置自动保存计时器
const resetAutoSaveTimer = () => {
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(autoSave, AUTO_SAVE_DELAY)
}

// 表单数据
const formData = ref({
  title: '',
  desc: '',
  content: '',
  selectedTag: '',
  selectedTagId: '',
  selectedTagName: '',
  author: '',
  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  readTime: 5,
  status: 'draft'
})

// 渐变色编辑器
const gradientStart = ref('#667eea')
const gradientEnd = ref('#764ba2')
const gradientAngle = ref(135)

// 附件管理
const attachmentInput = ref(null)
const attachments = ref([])
const attachmentUploading = ref(false)

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// 处理附件选择上传
const handleAttachmentChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  attachmentUploading.value = true
  try {
    const res = await api.uploadAttachment(file)
    if (res.success) {
      const cols = res.data?.columns || {}
      attachments.value.push({
        id: cols.zo_file_id || '',
        name: cols.original_name || file.name,
        size: cols.file_size || file.size,
        path: cols.file_path || ''
      })
      showToast(`附件 "${file.name}" 上传成功`)
    } else {
      showToast(res.message || '附件上传失败', 'error')
    }
  } catch (err) {
    console.error('附件上传失败:', err)
    showToast('附件上传失败，请重试', 'error')
  } finally {
    attachmentUploading.value = false
    // 清空 input 以允许重复上传同名文件
    if (attachmentInput.value) {
      attachmentInput.value.value = ''
    }
  }
}

// 删除附件
const removeAttachment = (index) => {
  attachments.value.splice(index, 1)
}

// 渐变色预设
const gradientPresets = [
  { name: '紫罗兰', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: '蓝绿', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { name: '橙红', gradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)' },
  { name: '蓝紫', gradient: 'linear-gradient(135deg, #5f2c82 0%, #49a09d 100%)' },
  { name: '粉红', gradient: 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)' },
  { name: '深蓝', gradient: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)' },
  { name: '暗夜', gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 100%)' },
  { name: '日出', gradient: 'linear-gradient(135deg, #ff5f6d 0%, #ffc371 100%)' }
]

// 更新渐变色
const updateGradient = () => {
  formData.value.gradient = `linear-gradient(${gradientAngle.value}deg, ${gradientStart.value} 0%, ${gradientEnd.value} 100%)`
}

// 监听渐变色参数变化
watch([gradientStart, gradientEnd, gradientAngle], updateGradient)

// 应用预设
const applyPreset = (preset) => {
  formData.value.gradient = preset.gradient
  parseGradient(preset.gradient)
}

// 解析渐变色
const parseGradient = (gradientStr) => {
  if (!gradientStr) return
  const colors = gradientStr.match(/#[a-fA-F0-9]{6}/g)
  if (colors && colors.length >= 2) {
    gradientStart.value = colors[0]
    gradientEnd.value = colors[1]
  }
  const angleMatch = gradientStr.match(/(\d+)deg/)
  if (angleMatch) {
    gradientAngle.value = parseInt(angleMatch[1])
  }
}

// Toast
const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

// 可用标签
const availableTags = ref([])

// 待回显的文章数据
let pendingArticle = null

// 加载标签列表
const loadTags = async () => {
  try {
    const res = await api.getArticleTags()
    if (res.success && res.data) {
      availableTags.value = res.data
      // 如果有待回显的文章，根据 tagValue 匹配 selectedTag
      if (pendingArticle) {
        const matchedTag = availableTags.value.find(t => t.id === pendingArticle.tagValue)
        formData.value.selectedTag = matchedTag || availableTags.value[0] || ''
        pendingArticle = null
      }
    }
  } catch (error) {
    console.error('获取标签失败:', error)
  }
}

// 监听表单变化，触发自动保存计时
watch(
  () => ({
    title: formData.value.title,
    desc: formData.value.desc,
    content: formData.value.content,
    selectedTag: formData.value.selectedTag,
    author: formData.value.author,
    gradient: formData.value.gradient,
    readTime: formData.value.readTime,
    status: formData.value.status
  }),
  () => {
    if (hasRequiredFields()) {
      resetAutoSaveTimer()
    }
  },
  { deep: true }
)

// 显示提示
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// 返回
const goBack = () => {
  router.push('/admin/drafts')
}

// 获取文章详情
const fetchArticle = async (id) => {
  try {
    const res = await api.getArticleById(id)
    if (res.success && res.data) {
      const article = res.data
      isEditing.value = true
      
      // 解析渐变色
      parseGradient(article.gradient)
      
      formData.value = {
        id: article.id,
        title: article.title,
        desc: article.desc,
        content: article.content || '',
        selectedTag: '',
        selectedTagId: article.tagValue,
        selectedTagName: article.tag,
        author: article.author,
        gradient: article.gradient,
        readTime: article.readTime,
        status: article.status
      }

      // 回显附件
      if (article.files) {
        try {
          attachments.value = typeof article.files === 'string'
            ? JSON.parse(article.files)
            : article.files
        } catch (e) {
          console.warn('附件数据解析失败:', e)
          attachments.value = []
        }
      } else {
        attachments.value = []
      }
      // 保存待回显的文章数据，等标签加载完成后匹配
      pendingArticle = { tagValue: article.tagValue }
      // 如果标签已加载，立即匹配
      if (availableTags.value.length > 0) {
        const matchedTag = availableTags.value.find(t => t.id === article.tagValue)
        formData.value.selectedTag = matchedTag || ''
      }
    } else {
      showToast(res.message || '文章不存在', 'error')
    }
  } catch (error) {
    console.error('获取文章详情失败:', error)
    showToast('获取文章详情失败', 'error')
  }
}

// 保存文章
const saveArticle = async () => {
  try {
    saving.value = true
    
    // 处理标签数据
    const selectedTag = formData.value.selectedTag
    const articleData = {
      ...formData.value,
      tagValue: selectedTag?.id || '',
      tagText: selectedTag?.name || '',
      id: isEditing.value ? formData.value.id : undefined,
      files: JSON.stringify(attachments.value)
    }
    
    const res = isEditing.value 
      ? await api.updateArticle(articleData)
      : await api.createArticle(articleData)
    
    if (res.success) {
      showToast(isEditing.value ? '文章更新成功' : '文章创建成功')
    } else {
      showToast(res.message || '操作失败', 'error')
    }
  } catch (error) {
    console.error('保存文章失败:', error)
    showToast('保存文章失败', 'error')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadTags()
  const articleId = route.query.id
  if (articleId) {
    fetchArticle(articleId)
  }
})

onBeforeUnmount(() => {
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
})
</script>

<style scoped src="./AdminArticleEditor.css"></style>
