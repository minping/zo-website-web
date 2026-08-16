<template>
  <AdminLayout>
    <div class="api-editor">
      <header class="content-header">
        <div class="header-left">
          <button class="back-btn" @click="goBack">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div>
            <h1>{{ isEditing ? '编辑 API' : '新建 API' }}</h1>
            <p>{{ isEditing ? '修改 API 接口信息' : '创建一个新的 API 接口' }}</p>
          </div>
        </div>
      </header>

      <form class="editor-form" @submit.prevent="handleSubmit">
        <div class="form-main">
          <div class="form-card">
            <h3>基本信息</h3>
            <div class="form-row form-row-wide">
              <div class="form-group">
                <label>接口图标</label>
                <div class="icon-upload-area" :class="{ 'has-preview': formData.icon, 'is-uploading': uploading }" @click="!formData.icon && triggerIconUpload()">
                  <template v-if="formData.icon">
                    <img :src="formData.icon" class="icon-upload-preview" alt="图标预览" />
                    <div class="icon-upload-actions">
                      <button type="button" class="icon-btn" @click.stop="triggerIconUpload">更换</button>
                      <button type="button" class="icon-btn icon-btn-remove" @click.stop="formData.icon = ''">移除</button>
                    </div>
                  </template>
                  <template v-else>
                    <div class="icon-upload-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="4"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span>{{ uploading ? '上传中...' : '上传图标' }}</span>
                    </div>
                  </template>
                  <input ref="iconInputRef" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="file-input" @change="handleIconChange" />
                </div>
                <p class="hint">建议 128×128 透明底 PNG，≤5MB</p>
              </div>
              <div class="form-group">
                <label>作者</label>
                <input v-model="formData.author" type="text" placeholder="输入作者名称" />
              </div>
            </div>
            <div class="form-row form-row-wide">
              <div class="form-group">
                <label>API 名称 <span class="required">*</span></label>
                <input v-model="formData.name" type="text" placeholder="输入 API 名称" required />
              </div>
              <div class="form-group">
                <label>请求方法 <span class="required">*</span></label>
                <select v-model="formData.method" required>
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
            </div>
            <div class="form-row form-row-wide">
              <div class="form-group">
                <label>接口地址 <span class="required">*</span></label>
                <input v-model="formData.endpoint" type="text" placeholder="/api/v1/example" required />
              </div>
              <div class="form-group">
                <label>返回格式</label>
                <select v-model="formData.responseFormat">
                  <option value="JSON">JSON</option>
                  <option value="XML">XML</option>
                  <option value="HTML">HTML</option>
                  <option value="TEXT">TEXT</option>
                  <option value="BINARY">BINARY</option>
                </select>
              </div>
            </div>
            <div class="form-row form-row-wide">
              <div class="form-group">
                <label>接口描述</label>
                <input v-model="formData.description" type="text" placeholder="简要描述该 API 的功能" />
              </div>
              <div class="form-group">
                <label>分类标签 <span class="required">*</span></label>
                <div class="multi-tag-select" ref="tagSelectRef">
                  <div class="tag-select-trigger" @click="showTagDropdown = !showTagDropdown">
                    <span v-if="formData.tags.length === 0" class="tag-placeholder">选择分类</span>
                    <span v-for="tagName in formData.tags" :key="tagName" class="selected-tag-chip" :style="{ background: getTagByName(tagName)?.color + '20', color: getTagByName(tagName)?.color }">
                      {{ tagName }}
                      <button class="chip-remove" @click.stop="removeTag(tagName)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </span>
                    <svg class="tag-arrow" :class="{ open: showTagDropdown }" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                  <div v-if="showTagDropdown" class="tag-dropdown">
                    <div v-for="tag in tags" :key="tag.id" class="tag-dropdown-item" :class="{ selected: formData.tags.includes(tag.name) }" @click="toggleTag(tag.name)">
                      <span class="tag-dropdown-dot" :style="{ background: tag.color }"></span>
                      <span>{{ tag.name }}</span>
                      <svg v-if="formData.tags.includes(tag.name)" class="tag-check" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-card">
            <h3>输入参数</h3>
            <div class="param-table-wrapper">
              <table class="param-table" v-if="formData.inputParams.length > 0">
                <thead>
                  <tr>
                    <th class="col-name">参数名称</th>
                    <th class="col-desc">参数描述</th>
                    <th class="col-type">参数类型</th>
                    <th class="col-pass">传入方法</th>
                    <th class="col-req">必填</th>
                    <th class="col-def">默认值</th>
                    <th class="col-act">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(param, idx) in formData.inputParams" :key="idx" :class="{ 'row-deleted': param.deleted == '1' }">
                    <td>
                      <input v-model="param.name" type="text" placeholder="参数名" :disabled="param.deleted == '1'" />
                    </td>
                    <td>
                      <input v-model="param.description" type="text" placeholder="参数描述" :disabled="param.deleted == '1'" />
                    </td>
                    <td>
                      <select v-model="param.type" :disabled="param.deleted == '1'">
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                        <option value="array">array</option>
                        <option value="object">object</option>
                        <option value="file">file</option>
                      </select>
                    </td>
                    <td>
                      <select v-model="param.passMethod" :disabled="param.deleted == '1'">
                        <option value="query">query</option>
                        <option value="path">path</option>
                        <option value="header">header</option>
                        <option value="body">body</option>
                        <option value="form">form</option>
                      </select>
                    </td>
                    <td class="td-center">
                      <label class="req-checkbox" @click.stop>
                        <span class="custom-checkbox" :class="{ checked: param.required }">
                          <svg v-if="param.required" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                        <input type="checkbox" :checked="param.required" @change="param.required = $event.target.checked" :disabled="param.deleted == '1'" />
                      </label>
                    </td>
                    <td>
                      <input v-model="param.defaultValue" :disabled="param.deleted == '1'" type="text" placeholder="默认值" />
                    </td>
                    <td class="td-center">
                      <button v-if="param.deleted == '1'" type="button" class="param-action-btn param-restore-btn" @click="restoreParam(idx)" title="恢复">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                      </button>
                      <button v-else type="button" class="param-action-btn param-del-btn" @click="removeParam(idx)" title="删除">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-else class="param-empty">暂无参数，点击下方按钮添加</div>
            </div>
            <button type="button" class="add-param-btn" @click="addParam">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              新增参数
            </button>
          </div>

          <div class="form-card">
            <h3 class="card-header-with-action">
              <span>响应示例</span>
              <div class="debug-header-controls">
                <button type="button" class="btn-debug" :disabled="debugging" @click="debugApi">
                  <svg v-if="!debugging" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  <span v-else class="spinner"></span>
                  {{ debugging ? '请求中...' : '调试' }}
                </button>
              </div>
            </h3>
            <div v-if="debugResult" class="debug-info">
              <span class="debug-info-badge" :class="debugResult.status >= 200 && debugResult.status < 300 ? 'debug-success' : (debugResult.status > 0 ? 'debug-error' : 'debug-net-err')">
                {{ debugResult.status > 0 ? debugResult.status : 'ERR' }} {{ debugResult.statusText }}
              </span>
              <span class="debug-info-meta">{{ debugResult.elapsed }}ms</span>
              <span class="debug-info-meta debug-url" :title="debugResult.url">{{ debugResult.method }} {{ debugResult.url }}</span>
            </div>
            <div class="form-group">
              <label>响应示例 JSON <span v-if="formData.responseTime > 0" class="response-time-label">{{ formData.responseTime }}ms</span></label>
              <textarea v-model="formData.responseExample" rows="6" placeholder='{ "code": 200, "data": {} }' class="code-textarea"></textarea>
            </div>
          </div>
        </div>

        <div class="form-sidebar">
          <div class="sidebar-card">
            <h3>发布设置</h3>
            <div class="form-group">
              <label class="checkbox-label" @click.stop>
                <span class="custom-checkbox" :class="{ checked: !formData.isFree }">
                  <svg v-if="!formData.isFree" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <input type="checkbox" :checked="!formData.isFree" @change="formData.isFree = !$event.target.checked" />
                <span>付费 API</span>
              </label>
              <p class="hint">开启后用户需付费调用此 API</p>
            </div>

            <div class="form-group">
              <label>上架状态</label>
              <div class="status-toggle">
                <button type="button" class="status-option" :class="{ active: formData.status === 1 }" @click="formData.status = 1">上架</button>
                <button type="button" class="status-option" :class="{ active: formData.status === 0 }" @click="formData.status = 0">下架</button>
              </div>
            </div>

          </div>

          <div class="sidebar-card">
            <h3>已选标签</h3>
            <div class="form-group">
              <div v-if="formData.tags.length === 0" class="no-tags-text">未选择标签</div>
              <div v-else class="selected-tags-list">
                <span v-for="tagName in formData.tags" :key="tagName" class="tag-chip-sm" :style="{ background: getTagByName(tagName)?.color + '20', color: getTagByName(tagName)?.color, borderColor: getTagByName(tagName)?.color + '40' }">
                  {{ tagName }}
                </span>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="goBack">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
      </form>

      <Transition name="toast">
        <div v-if="toast.show" class="toast" :class="toast.type">
          {{ toast.message }}
        </div>
      </Transition>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '../../api/article'
import AdminLayout from './AdminLayout.vue'

const router = useRouter()
const route = useRoute()

const saving = ref(false)
const isEditing = ref(false)

const formData = reactive({
  id: null,
  icon: '',
  author: '',
  name: '',
  method: 'GET',
  endpoint: '',
  tags: [],
  tagColor: '',
  description: '',
  isFree: true,
  price: 0,
  requestExample: '',
  responseExample: '',
  responseFormat: 'JSON',
  responseTime: 0,
  status: 1,
  inputParams: []
})

const emptyParam = () => ({
  id: '',
  name: '',
  description: '',
  type: 'string',
  passMethod: 'query',
  required: false,
  defaultValue: '',
  deleted: '0'
})

const addParam = () => {
  formData.inputParams.push(emptyParam())
}

const removeParam = (index) => {
  const param = formData.inputParams[index]
  if (param.id) {
    param.deleted = '1'
  } else {
    formData.inputParams.splice(index, 1)
  }
}

const restoreParam = (index) => {
  formData.inputParams[index].deleted = '0'
}

const normalizeParam = (item) => ({
  id: item['zo_website_api_param_id'] || '',
  name: item.para || item.name || '',
  description: item.desc || item.description || '',
  type: item.type || 'string',
  passMethod: item.method || item.passMethod || 'query',
  required: item.required ?? false,
  defaultValue: item.defaultValue || item.default_value || '',
  deleted: (item.deleted == '1' || item.deleted == 1) ? '1' : '0'
})

const parseInputParams = (raw) => {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map(normalizeParam)
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(normalizeParam) : []
  } catch {
    return []
  }
}

const tags = ref([])
const showTagDropdown = ref(false)
const tagSelectRef = ref(null)

const handleClickOutside = (e) => {
  if (tagSelectRef.value && !tagSelectRef.value.contains(e.target)) {
    showTagDropdown.value = false
  }
}

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

const getTagByName = (name) => {
  return tags.value.find(t => t.name === name)
}

const toggleTag = (tagName) => {
  const idx = formData.tags.indexOf(tagName)
  if (idx > -1) {
    formData.tags.splice(idx, 1)
  } else {
    formData.tags.push(tagName)
  }
}

const removeTag = (tagName) => {
  const idx = formData.tags.indexOf(tagName)
  if (idx > -1) formData.tags.splice(idx, 1)
}



// 调试
const debugging = ref(false)
const debugResult = ref(null)

const debugApi = async () => {
  const rawUrl = formData.endpoint.trim()
  if (!rawUrl) {
    showToast('请先填写接口地址', 'error')
    return
  }

  // 校验是否为完整 URL（需包含域名或 IP+端口）
  if (!/^https?:\/\/[^/]+/.test(rawUrl)) {
    showToast('接口地址必须为完整 URL，包含域名或 IP（如 https://example.com/api/xxx）', 'error')
    return
  }

  debugging.value = true
  debugResult.value = null
  const startTime = performance.now()

  try {
    let url = rawUrl

    const params = formData.inputParams.filter(p => p.name.trim())
    const queryParams = params.filter(p => p.passMethod === 'query')
    const headerParams = params.filter(p => p.passMethod === 'header')
    const bodyParams = params.filter(p => p.passMethod === 'body')
    const formParams = params.filter(p => p.passMethod === 'form')
    const pathParams = params.filter(p => p.passMethod === 'path')

    // 替换 path 参数
    pathParams.forEach(p => {
      url = url.replace(`{${p.name}}`, encodeURIComponent(p.defaultValue || ''))
      url = url.replace(`:${p.name}`, encodeURIComponent(p.defaultValue || ''))
    })

    // 拼 query string
    if (queryParams.length > 0) {
      const qs = queryParams
        .map(p => `${encodeURIComponent(p.name)}=${encodeURIComponent(p.defaultValue || '')}`)
        .join('&')
      url += (url.includes('?') ? '&' : '?') + qs
    }

    // 构建 headers
    const headers = {}
    headerParams.forEach(p => {
      if (p.name.trim()) headers[p.name.trim()] = p.defaultValue || ''
    })

    // 构建 fetch options
    const fetchOptions = {
      method: formData.method,
      headers: { ...headers }
    }

    // body / form
    if (['POST', 'PUT', 'PATCH'].includes(formData.method)) {
      if (bodyParams.length > 0) {
        if (!fetchOptions.headers['Content-Type']) {
          fetchOptions.headers['Content-Type'] = 'application/json'
        }
        const bodyObj = {}
        bodyParams.forEach(p => {
          if (p.name.trim()) {
            let val = p.defaultValue || ''
            if (p.type === 'number') val = Number(val)
            else if (p.type === 'boolean') val = val === 'true'
            else if (p.type === 'object' || p.type === 'array') {
              try { val = JSON.parse(val) } catch { /* keep string */ }
            }
            bodyObj[p.name.trim()] = val
          }
        })
        fetchOptions.body = JSON.stringify(bodyObj)
      } else if (formParams.length > 0) {
        const fd = new FormData()
        formParams.forEach(p => {
          if (p.name.trim()) fd.append(p.name.trim(), p.defaultValue || '')
        })
        fetchOptions.body = fd
      }
    }

    const response = await fetch(url, fetchOptions)
    const elapsed = Math.round(performance.now() - startTime)
    const contentType = response.headers.get('content-type') || ''
    let body

    if (contentType.includes('application/json')) {
      body = await response.json()
    } else {
      body = await response.text()
    }

    const result = {
      url,
      method: formData.method,
      status: response.status,
      statusText: response.statusText,
      elapsed,
      headers: Object.fromEntries(response.headers.entries()),
      body
    }

    debugResult.value = result
    // 自动填充响应示例 & 保存耗时
    formData.responseExample = typeof body === 'object'
      ? JSON.stringify(body, null, 2)
      : body
    formData.responseTime = elapsed
  } catch (error) {
    const elapsed = Math.round(performance.now() - startTime)
    debugResult.value = {
      url,
      method: formData.method,
      status: 0,
      statusText: error.message,
      elapsed,
      headers: {},
      body: error.message
    }
    formData.responseExample = error.message
    formData.responseTime = 0
  } finally {
    debugging.value = false
  }
}

const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const uploading = ref(false)
const iconInputRef = ref(null)

const triggerIconUpload = () => {
  iconInputRef.value?.click()
}

const handleIconChange = async (event) => {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
    showToast('仅支持 JPG/PNG/WebP/GIF 图片', 'error')
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
      formData.icon = res.data.url || res.data.filePath || ''
      showToast('图标上传成功')
    } else {
      showToast(res.message || '上传失败', 'error')
    }
  } catch (error) {
    console.error('上传图标失败:', error)
    showToast('上传失败，请重试', 'error')
  } finally {
    uploading.value = false
  }
}

const goBack = () => {
  router.push('/admin/apis')
}

const loadApi = async (id) => {
  try {
    const res = await api.queryApiById(id)
    if (res.success && res.data) {
      const found = res.data
      if (found) {
        isEditing.value = true
        Object.assign(formData, {
          id: found.id,
          icon: found.icon || '',
          author: found.author || '',
          name: found.name || '',
          method: found.method || 'GET',
          endpoint: found.endpoint || '',
          tags: (found.tagText || found.tag || '').split('^').filter(Boolean),
          tagColor: found.tagColor || '',
          description: found.description || '',
          isFree: found.isFree ?? true,
          price: found.price || 0,
          requestExample: found.requestExample || '',
          responseExample: found.responseExample || '',
          responseFormat: found.responseFormat || 'JSON',
          responseTime: found.responseTime || 0,
          status: found.status ?? 1,
          inputParams: parseInputParams(found.paramList || found.inputParams)
        })
      } else {
        showToast('API 不存在', 'error')
      }
    } else {
      showToast('API 不存在', 'error')
    }
  } catch (error) {
    console.error('加载 API 失败:', error)
    showToast('加载失败', 'error')
  }
}

const handleSubmit = async () => {
  if (!formData.name.trim() || !formData.endpoint.trim() || formData.tags.length === 0) {
    showToast('请填写必填字段', 'error')
    return
  }
  saving.value = true

  const selectedTags = formData.tags.map(tagName => {
    const found = tags.value.find(t => t.name === tagName)
    return found || { id: '', name: tagName }
  })
  const tagValue = selectedTags.map(t => t.id).join('^')
  const tagText = selectedTags.map(t => t.name).join('^')

  const data = {
    id: formData.id,
    icon: formData.icon,
    author: formData.author.trim(),
    name: formData.name.trim(),
    method: formData.method,
    endpoint: formData.endpoint.trim(),
    tagValue,
    tagText,
    description: formData.description.trim(),
    isFree: formData.isFree,
    responseFormat: formData.responseFormat,
    requestExample: formData.requestExample,
    responseExample: formData.responseExample,
    responseTime: formData.responseTime,
    status: formData.status,
    paramList: formData.inputParams.map(p => ({
      id: p.id || '',
      para: p.name,
      desc: p.description,
      type: p.type,
      method: p.passMethod,
      required: p.required,
      defaultValue: p.defaultValue,
      deleted: p.deleted == '1' ? '1' : '0'
    }))
  }

  try {
    const res = await api.saveApi(data)
    if (res.success) {
      showToast(isEditing.value ? 'API 更新成功' : 'API 创建成功')
      setTimeout(() => {
        router.push('/admin/apis')
      }, 800)
    } else {
      showToast(res.message || '保存失败', 'error')
    }
  } catch (error) {
    console.error('保存 API 失败:', error)
    showToast('网络错误', 'error')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadTags()
  const apiId = route.query.id
  if (apiId) {
    loadApi(apiId)
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped src="./AdminApiEditor.css"></style>
