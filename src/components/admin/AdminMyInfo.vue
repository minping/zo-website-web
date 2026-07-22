<template>
  <AdminLayout>
    <div class="my-info-page">
      <!-- Toast 提示 -->
      <Transition name="toast">
        <div v-if="toast.show" class="toast" :class="toast.type">
          <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {{ toast.message }}
        </div>
      </Transition>

      <!-- 页面头部 -->
      <header class="content-header">
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div class="header-text">
          <h1>我的信息</h1>
          <p>管理您的个人资料和公开信息</p>
        </div>
      </header>

      <!-- 主体布局：头像卡片 + 表单 -->
      <div class="info-layout">
        <!-- 左侧：表单 -->
        <div class="form-card">
          <div class="form-section">
            <div class="form-divider">
              <span class="divider-label">个人信息</span>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="label-icon">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  姓名
                </label>
                <input v-model="form.name" type="text" class="input" placeholder="请输入您的姓名" />
              </div>
              <div class="form-group">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="label-icon">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                  职位
                </label>
                <input v-model="form.title" type="text" class="input" placeholder="例如：全栈开发工程师" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="label-icon">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  邮箱
                </label>
                <input v-model="form.email" type="email" class="input" placeholder="yourname@example.com" />
              </div>
              <div class="form-group">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="label-icon">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                  </svg>
                  GitHub
                </label>
                <input v-model="form.github" type="url" class="input" placeholder="https://github.com/yourname" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="label-icon">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                  从事行业时间
                </label>
                <input v-model="form.industryYears" type="month" class="input" />
              </div>
              <div class="form-group form-group-placeholder" />
            </div>

            <div class="form-group">
              <label>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="label-icon">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
                个人简介
              </label>
              <textarea v-model="form.bio" class="input textarea" rows="3" placeholder="简单介绍一下自己，比如技术栈、兴趣爱好等..."></textarea>
              <span class="char-count">{{ form.bio ? form.bio.length : 0 }} 字</span>
            </div>

            <div class="form-group">
              <label>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="label-icon">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                头像
              </label>
              <div class="upload-area" :class="{ 'has-preview': form.avatar, uploading }" @click="triggerUpload" @dragover.prevent @drop.prevent="handleDrop">
                <!-- 预览已有头像 -->
                <template v-if="form.avatar && !uploading">
                  <div class="upload-preview">
                    <img :src="form.avatar" alt="头像预览" />
                    <div class="upload-overlay">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <span>更换头像</span>
                    </div>
                  </div>
                  <button class="upload-remove" @click.stop="removeAvatar" title="移除头像">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </template>
                <!-- 上传中 -->
                <template v-else-if="uploading">
                  <div class="upload-loading">
                    <div class="spinner"></div>
                    <span>上传中...</span>
                  </div>
                </template>
                <!-- 空状态：点击/拖拽上传 -->
                <template v-else>
                  <div class="upload-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <div class="upload-hint">
                      <span class="upload-primary-text">点击上传或拖拽图片到此处</span>
                      <span class="upload-secondary-text">支持 JPG、PNG、WebP，不超过 5MB</span>
                    </div>
                  </div>
                </template>
                <input ref="fileInputRef" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="file-input" @change="handleFileChange" />
              </div>
            </div>

            <!-- 技术栈 -->
            <div class="form-divider">
              <span class="divider-label">技术栈</span>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="label-icon">
                    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                  </svg>
                  前端
                </label>
                <div class="tag-input" :class="{ focused: tagFocused.frontend }" @click="focusTagInput('frontend')">
                  <span v-for="(tag, i) in form.techStack.frontend" :key="i" class="tag-pill">
                    {{ tag }}
                    <button class="tag-remove" @click.stop="removeTag('frontend', i)">&times;</button>
                  </span>
                  <input
                    :ref="el => tagInputRefs.frontend = el"
                    v-model="tagInput.frontend"
                    class="tag-input-text"
                    placeholder="输入后回车添加"
                    @focus="tagFocused.frontend = true"
                    @blur="tagFocused.frontend = false"
                    @keydown.enter.prevent="addTag('frontend')"
                    @keydown.,.prevent="addTag('frontend')"
                    @keydown.delete="handleBackspace('frontend')"
                  />
                </div>
              </div>
              <div class="form-group">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="label-icon">
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
                  </svg>
                  后端
                </label>
                <div class="tag-input" :class="{ focused: tagFocused.backend }" @click="focusTagInput('backend')">
                  <span v-for="(tag, i) in form.techStack.backend" :key="i" class="tag-pill">
                    {{ tag }}
                    <button class="tag-remove" @click.stop="removeTag('backend', i)">&times;</button>
                  </span>
                  <input
                    :ref="el => tagInputRefs.backend = el"
                    v-model="tagInput.backend"
                    class="tag-input-text"
                    placeholder="输入后回车添加"
                    @focus="tagFocused.backend = true"
                    @blur="tagFocused.backend = false"
                    @keydown.enter.prevent="addTag('backend')"
                    @keydown.,.prevent="addTag('backend')"
                    @keydown.delete="handleBackspace('backend')"
                  />
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="label-icon">
                    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  工具
                </label>
                <div class="tag-input" :class="{ focused: tagFocused.tools }" @click="focusTagInput('tools')">
                  <span v-for="(tag, i) in form.techStack.tools" :key="i" class="tag-pill">
                    {{ tag }}
                    <button class="tag-remove" @click.stop="removeTag('tools', i)">&times;</button>
                  </span>
                  <input
                    :ref="el => tagInputRefs.tools = el"
                    v-model="tagInput.tools"
                    class="tag-input-text"
                    placeholder="输入后回车添加"
                    @focus="tagFocused.tools = true"
                    @blur="tagFocused.tools = false"
                    @keydown.enter.prevent="addTag('tools')"
                    @keydown.,.prevent="addTag('tools')"
                    @keydown.delete="handleBackspace('tools')"
                  />
                </div>
              </div>
              <div class="form-group">
                <label>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="label-icon">
                    <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
                  </svg>
                  DevOps
                </label>
                <div class="tag-input" :class="{ focused: tagFocused.devops }" @click="focusTagInput('devops')">
                  <span v-for="(tag, i) in form.techStack.devops" :key="i" class="tag-pill">
                    {{ tag }}
                    <button class="tag-remove" @click.stop="removeTag('devops', i)">&times;</button>
                  </span>
                  <input
                    :ref="el => tagInputRefs.devops = el"
                    v-model="tagInput.devops"
                    class="tag-input-text"
                    placeholder="输入后回车添加"
                    @focus="tagFocused.devops = true"
                    @blur="tagFocused.devops = false"
                    @keydown.enter.prevent="addTag('devops')"
                    @keydown.,.prevent="addTag('devops')"
                    @keydown.delete="handleBackspace('devops')"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 个人历程 -->
            <div class="timeline-section">
              <div class="form-divider">
                <span class="divider-label">个人历程</span>
              </div>
              <div v-if="visibleTimeline.length === 0" class="timeline-empty">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>暂无历程记录，点击下方按钮添加</span>
              </div>
              <div v-else class="timeline-table">
                <div class="timeline-header">
                  <span class="col-date">时间（年月日）</span>
                  <span class="col-event">事件</span>
                  <span class="col-action">操作</span>
                </div>
                <div
                  v-for="(item, index) in visibleTimeline"
                  :key="index"
                  class="timeline-row"
                >
                  <div class="col-date">
                    <input
                      v-model="item.date"
                      type="text"
                      class="input timeline-input"
                      placeholder="如：2024-01-15"
                    />
                  </div>
                  <div class="col-event">
                    <input
                      v-model="item.event"
                      type="text"
                      class="input timeline-input"
                      placeholder="描述这段历程..."
                    />
                  </div>
                  <div class="col-action">
                    <button class="timeline-row-remove" @click="removeTimeline(item)" title="删除此项">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <button class="timeline-add-btn" @click="addTimeline">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                添加历程
              </button>
          </div>
        </div>

        <!-- 右侧：头像卡片 -->
        <div class="avatar-card">
          <div class="avatar-wrapper">
            <img v-if="form.avatar" :src="form.avatar" alt="头像" class="avatar-img" />
            <div v-else class="avatar-fallback">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          </div>
          <div class="avatar-name">{{ form.name || '未设置' }}</div>
          <div class="avatar-title">{{ form.title || '未设置职位' }}</div>
          <button class="btn-save" :disabled="saving" @click="handleSave">
            <template v-if="saving">
              <span class="btn-spinner"></span>
              保存中...
            </template>
            <template v-else>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              保存信息
            </template>
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import { api } from '../../api/article'

const defaultForm = () => ({
  name: '',
  title: '',
  email: '',
  github: '',
  bio: '',
  avatar: '',
  industryYears: '',
  techStack: {
    frontend: [],
    backend: [],
    tools: [],
    devops: []
  },
  timeline: []
})

const form = ref(defaultForm())

const infoId = ref(null)

// 个人历程：仅展示未删除项
const visibleTimeline = computed(() => form.value.timeline.filter(item => item.deleted !== 1))

// Toast 提示
const toast = ref({ show: false, message: '', type: 'success' })
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

// 保存状态
const saving = ref(false)

// 头像上传
const fileInputRef = ref(null)
const uploading = ref(false)

const triggerUpload = () => {
  fileInputRef.value?.click()
}

const handleFileChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  await doUpload(file)
  // 清空 input，允许重复上传同一文件
  e.target.value = ''
}

const handleDrop = async (e) => {
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  await doUpload(file)
}

const doUpload = async (file) => {
  // 校验类型
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(file.type)) {
    showToast('仅支持 JPG、PNG、WebP、GIF 格式的图片', 'error')
    return
  }
  // 校验大小
  if (file.size > 5 * 1024 * 1024) {
    showToast('图片大小不能超过 5MB', 'error')
    return
  }

  uploading.value = true
  try {
    const res = await api.uploadImage(file)
    if (res.success && res.data) {
      form.value.avatar = res.data.url || res.data.filePath || ''
    } else {
      showToast(res.message || '上传失败，请重试', 'error')
    }
  } catch (err) {
    console.error('头像上传失败:', err)
    showToast('上传失败，请检查网络后重试', 'error')
  } finally {
    uploading.value = false
  }
}

const removeAvatar = () => {
  form.value.avatar = ''
}

// 标签输入组件状态
const tagInput = reactive({
  frontend: '',
  backend: '',
  tools: '',
  devops: ''
})

const tagFocused = reactive({
  frontend: false,
  backend: false,
  tools: false,
  devops: false
})

const tagInputRefs = reactive({
  frontend: null,
  backend: null,
  tools: null,
  devops: null
})

const focusTagInput = (field) => {
  nextTick(() => {
    tagInputRefs[field]?.focus()
  })
}

const addTag = (field) => {
  const value = tagInput[field].trim()
  if (value && !form.value.techStack[field].includes(value)) {
    form.value.techStack[field].push(value)
  }
  tagInput[field] = ''
}

const removeTag = (field, index) => {
  form.value.techStack[field].splice(index, 1)
}

// 个人历程
const addTimeline = () => {
  form.value.timeline.push({ date: '', event: '', deleted: 0 })
}

const removeTimeline = (item) => {
  item.deleted = 1
}

const handleBackspace = (field) => {
  if (tagInput[field] === '' && form.value.techStack[field].length > 0) {
    form.value.techStack[field].pop()
  }
}

onMounted(() => {
  loadMyInfo()
})

const loadMyInfo = async () => {
  try {
    const res = await api.getMyInfo()
    if (res.success && res.data) {
      const d = res.data
      infoId.value = d.id || null
      form.value.name = d.name || ''
      form.value.title = d.post || ''
      form.value.email = d.email || ''
      form.value.github = d.github || ''
      form.value.bio = d.self || ''
      form.value.avatar = d.avatar || ''
      form.value.industryYears = d.workTime || d.work_time || ''
      form.value.techStack.frontend = toArray(d.frontend)
      form.value.techStack.backend = toArray(d.backend)
      form.value.techStack.tools = toArray(d.tools)
      form.value.techStack.devops = toArray(d.devops)
      form.value.timeline = (d.processList || []).map(item => ({
        id: item.id || null,
        date: item.time || '',
        event: item.event || '',
        deleted: (item.deleted === 1 || item.deleted === '1') ? 1 : 0
      }))
    }
  } catch (err) {
    console.error('加载个人信息失败:', err)
  }
}

const toArray = (val) => {
  if (!val) return []
  if (Array.isArray(val)) return val
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean)
  return []
}

const handleSave = async () => {
  saving.value = true
  try {
    const payload = {}
    if (infoId.value) payload.id = infoId.value
    payload.name = form.value.name
    payload.post = form.value.title
    payload.email = form.value.email
    payload.github = form.value.github
    payload.self = form.value.bio
    payload.avatar = form.value.avatar
    payload.workTime = form.value.industryYears
    payload.frontend = form.value.techStack.frontend.join(',')
    payload.backend = form.value.techStack.backend.join(',')
    payload.tools = form.value.techStack.tools.join(',')
    payload.devops = form.value.techStack.devops.join(',')
    payload.processDtoList = form.value.timeline.map(item => ({
      id: item.id || null,
      time: item.date,
      event: item.event,
      deleted: item.deleted || 0
    }))

    const res = await api.saveInfo(payload)
    if (res.success) {
      // 重新加载以同步 ID，同时清理已删除项
      await loadMyInfo()
      showToast('个人信息保存成功', 'success')
    } else {
      showToast(res.message || '保存失败', 'error')
    }
  } catch (err) {
    console.error('保存个人信息失败:', err)
    showToast('保存失败，请检查网络后重试', 'error')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped src="./AdminMyInfo.css"></style>
