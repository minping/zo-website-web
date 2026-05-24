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
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '../../api/article'
import AdminLayout from './AdminLayout.vue'
import MilkdownEditor from './MilkdownEditor.vue'

const router = useRouter()
const route = useRoute()

// 状态
const saving = ref(false)
const isEditing = ref(false)

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
    const res = await api.getTags()
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

// 显示提示
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// 返回
const goBack = () => {
  router.push('/admin/articles')
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
      id: isEditing.value ? formData.value.id : undefined
    }
    
    const res = isEditing.value 
      ? await api.updateArticle(articleData)
      : await api.createArticle(articleData)
    
    if (res.success) {
      showToast(isEditing.value ? '文章更新成功' : '文章创建成功')
      setTimeout(() => {
        router.push('/admin/drafts')
      }, 1000)
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
</script>

<style scoped>
.article-editor {
  max-width: 1200px;
}

.content-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.header-left h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.header-left p {
  color: var(--text-secondary);
  font-size: 14px;
}

/* 编辑器 */
.editor-form {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}

.form-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
}

.sidebar-card h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.required {
  color: #ef4444;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  transition: all 0.3s;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

.form-group select option {
  background: #1a1a2e;
  color: #ffffff;
  padding: 8px;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.form-group textarea {
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
}

.content-editor {
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  min-height: 400px !important;
}

.color-input-wrapper {
  display: flex;
  gap: 8px;
}

.color-picker {
  width: 44px;
  height: 40px;
  padding: 2px;
  cursor: pointer;
}

.color-text {
  flex: 1;
}

.gradient-preview {
  height: 60px;
  border-radius: 8px;
  margin-top: 8px;
}

.gradient-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gradient-colors {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-picker-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.color-input {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 0;
  background: transparent;
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input::-webkit-color-swatch {
  border: 2px solid var(--border-color);
  border-radius: 8px;
}

.color-label {
  font-size: 11px;
  color: var(--text-secondary);
}

.color-arrow {
  color: var(--text-secondary);
  font-size: 18px;
  margin-top: 20px;
}

.gradient-angle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gradient-angle label {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.angle-input {
  width: 70px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: #ffffff;
  font-size: 14px;
}

.gradient-angle span {
  color: var(--text-secondary);
  font-size: 14px;
}

.gradient-presets {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.preset-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.preset-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-btn:hover {
  transform: scale(1.15);
  border-color: var(--accent-primary);
}

.form-actions {
  display: flex;
  gap: 12px;
}

.form-actions .btn-primary {
  flex: 1;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background: var(--accent-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
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
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
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
  .editor-form {
    grid-template-columns: 1fr;
  }
}
</style>
