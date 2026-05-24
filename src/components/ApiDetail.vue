<template>
  <div class="api-detail-page">
    <!-- 背景效果 -->
    <div class="bg-grid"></div>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>

    <!-- 导航栏 -->
    <Navbar activeMenu="API" @navigate="handleNavigate" />

    <!-- 页面内容 -->
    <main class="api-detail-main">
      <div class="container">
        <!-- 返回按钮 -->
        <button class="back-btn" @click="goBack">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          返回
        </button>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{{ error }}</p>
          <button class="btn-primary" @click="goBack">返回列表</button>
        </div>

        <!-- API 详情内容 -->
        <div v-else-if="apiData" class="api-detail-content">
          <!-- API 头部信息 -->
          <header class="api-header">
            <div class="api-header-left">
              <div class="api-title-row">
                <h1 class="api-name">{{ apiData.name }}</h1>
                <span class="api-method" :style="{ background: methodColors[apiData.method] }">
                  {{ apiData.method }}
                </span>
                <span v-if="!apiData.isFree" class="api-paid">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                  付费
                </span>
              </div>
              <p class="api-description">{{ apiData.description }}</p>
              <div class="api-tags">
                <span class="api-tag" :style="{ background: apiData.tagColor + '20', color: apiData.tagColor }">
                  {{ apiData.tag }}
                </span>
              </div>
            </div>
          </header>

          <!-- API 统计数据 -->
          <div class="api-stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <span class="stat-value">{{ apiData.stats.calls }}</span>
              <span class="stat-label">累计调用</span>
            </div>
            <div class="stat-card">
              <div class="stat-icon success">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span class="stat-value">{{ apiData.stats.successRate }}%</span>
              <span class="stat-label">请求成功率</span>
            </div>
            <div class="stat-card">
              <div class="stat-icon time">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <span class="stat-value">{{ apiData.stats.avgTime }}ms</span>
              <span class="stat-label">平均响应</span>
            </div>
            <div class="stat-card">
              <div class="stat-icon like">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <span class="stat-value">{{ apiData.stats.likes }}</span>
              <span class="stat-label">用户点赞</span>
            </div>
          </div>

          <!-- API 详情卡片 -->
          <div class="api-details-grid">
            <!-- 请求地址 -->
            <div class="detail-card">
              <div class="detail-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                <span>请求地址</span>
              </div>
              <div class="endpoint-box">
                <code>{{ apiData.endpoint }}</code>
                <button class="copy-btn" @click="copyEndpoint">
                  <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {{ copied ? '已复制' : '复制' }}
                </button>
              </div>
            </div>

            <!-- 请求方法 -->
            <div class="detail-card">
              <div class="detail-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>请求方法</span>
              </div>
              <div class="method-info">
                <span class="method-badge" :style="{ background: methodColors[apiData.method] }">
                  {{ apiData.method }}
                </span>
                <span class="method-desc">{{ getMethodDesc(apiData.method) }}</span>
              </div>
            </div>

            <!-- 返回格式 -->
            <div class="detail-card">
              <div class="detail-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="4 7 4 4 20 4 20 7"/>
                  <line x1="9" y1="20" x2="15" y2="20"/>
                  <line x1="12" y1="4" x2="12" y2="20"/>
                </svg>
                <span>返回格式</span>
              </div>
              <div class="format-info">
                <span class="format-badge">JSON</span>
                <span class="format-desc">统一返回 JSON 格式数据</span>
              </div>
            </div>

            <!-- 请求示例 -->
            <div class="detail-card full-width">
              <div class="detail-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="16 18 22 12 16 6"/>
                  <polyline points="8 6 2 12 8 18"/>
                </svg>
                <span>请求示例</span>
              </div>
              <div class="code-example">
                <pre><code>{{ getRequestExample(apiData) }}</code></pre>
                <button class="copy-btn" @click="copyExample">
                  <svg v-if="!exampleCopied" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {{ exampleCopied ? '已复制' : '复制' }}
                </button>
              </div>
            </div>

            <!-- 返回示例 -->
            <div class="detail-card full-width">
              <div class="detail-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                <span>返回示例</span>
              </div>
              <div class="code-example">
                <pre><code>{{ getResponseExample(apiData) }}</code></pre>
                <button class="copy-btn" @click="copyResponse">
                  <svg v-if="!responseCopied" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {{ responseCopied ? '已复制' : '复制' }}
                </button>
              </div>
            </div>

            <!-- 状态码说明 -->
            <div class="detail-card full-width">
              <div class="detail-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span>状态码说明</span>
              </div>
              <div class="status-codes">
                <div class="status-item">
                  <span class="status-code success">200</span>
                  <span class="status-desc">请求成功</span>
                </div>
                <div class="status-item">
                  <span class="status-code error">400</span>
                  <span class="status-desc">请求参数错误</span>
                </div>
                <div class="status-item">
                  <span class="status-code error">401</span>
                  <span class="status-desc">未授权访问</span>
                </div>
                <div class="status-item">
                  <span class="status-code error">429</span>
                  <span class="status-desc">请求过于频繁</span>
                </div>
                <div class="status-item">
                  <span class="status-code error">500</span>
                  <span class="status-desc">服务器内部错误</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { openApis, methodColors } from '../api/modules'
import Navbar from './Navbar.vue'
import Footer from './Footer.vue'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const error = ref(null)
const apiData = ref(null)
const copied = ref(false)
const exampleCopied = ref(false)
const responseCopied = ref(false)

// 获取 API 详情
const fetchApiDetail = (id) => {
  const api = openApis.find(a => a.id === Number(id))
  if (api) {
    apiData.value = api
    loading.value = false
  } else {
    error.value = 'API 不存在'
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.push('/api')
}

// 复制请求地址
const copyEndpoint = async () => {
  try {
    await navigator.clipboard.writeText(apiData.value.endpoint)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 复制示例代码
const copyExample = async () => {
  try {
    await navigator.clipboard.writeText(getRequestExample(apiData.value))
    exampleCopied.value = true
    setTimeout(() => { exampleCopied.value = false }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 复制返回示例
const copyResponse = async () => {
  try {
    await navigator.clipboard.writeText(getResponseExample(apiData.value))
    responseCopied.value = true
    setTimeout(() => { responseCopied.value = false }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 获取方法描述
const getMethodDesc = (method) => {
  const descs = {
    GET: '获取资源数据',
    POST: '创建新资源',
    PUT: '更新完整资源',
    DELETE: '删除资源'
  }
  return descs[method] || ''
}

// 获取请求示例
const getRequestExample = (api) => {
  if (api.method === 'GET') {
    return `curl -X GET "${api.endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN"`
  } else {
    return `curl -X POST "${api.endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{"param": "value"}'`
  }
}

// 获取返回示例
const getResponseExample = (api) => {
  return `{
  "code": 200,
  "message": "success",
  "data": {
    "result": "...",
    "timestamp": ${Date.now()}
  }
}`
}

// 导航处理
const handleNavigate = (menu) => {
  console.log('Navigate to:', menu)
}

onMounted(() => {
  const apiId = route.params.id
  if (apiId) {
    fetchApiDetail(apiId)
  } else {
    error.value = '无效的 API ID'
    loading.value = false
  }
})
</script>

<style scoped>
.api-detail-page {
  position: relative;
  min-height: 100vh;
}

/* 背景效果 */
.bg-grid {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 0;
}

.bg-glow {
  position: fixed;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.3;
  pointer-events: none;
  z-index: 0;
}

.bg-glow-1 {
  top: -200px;
  right: -200px;
  background: var(--accent-primary);
}

.bg-glow-2 {
  bottom: -200px;
  left: -200px;
  background: var(--accent-secondary);
}

/* 主体内容 */
.api-detail-main {
  position: relative;
  padding-top: 100px;
  padding-bottom: 80px;
  z-index: 1;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

/* 返回按钮 */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 32px;
}

.back-btn:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

/* 加载和错误状态 */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 120px 0;
  color: var(--text-muted);
  min-height: 60vh;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state svg {
  color: #ef4444;
  opacity: 0.8;
}

.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
}

/* API 头部 */
.api-header {
  margin-bottom: 32px;
}

.api-header-left {
  flex: 1;
}

.api-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.api-name {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.api-method {
  padding: 6px 12px;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  border-radius: 6px;
}

.api-paid {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
}

.api-description {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.api-tags {
  display: flex;
  gap: 8px;
}

.api-tag {
  padding: 6px 14px;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 20px;
}

/* 统计卡片 */
.api-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: var(--accent-primary);
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 12px;
  color: var(--accent-primary);
}

.stat-icon.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.stat-icon.time {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.stat-icon.like {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* 详情卡片 */
.api-details-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.detail-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
}

.detail-card.full-width {
  grid-column: 1 / -1;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.detail-header svg {
  color: var(--accent-primary);
}

/* 请求地址 */
.endpoint-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px 16px;
}

.endpoint-box code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  color: var(--text-primary);
  word-break: break-all;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-left: 12px;
}

.copy-btn:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

/* 方法信息 */
.method-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.method-badge {
  padding: 6px 16px;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  border-radius: 6px;
}

.method-desc {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

/* 格式信息 */
.format-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.format-badge {
  padding: 6px 16px;
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 6px;
}

.format-desc {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

/* 代码示例 */
.code-example {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.code-example pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
}

.code-example code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  color: var(--text-primary);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

.code-example .copy-btn {
  position: absolute;
  top: 12px;
  right: 12px;
}

/* 状态码 */
.status-codes {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: var(--bg-card);
  border-radius: 8px;
}

.status-code {
  padding: 4px 12px;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 4px;
}

.status-code.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-code.error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.status-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-align: center;
}

/* 响应式 */
@media (max-width: 992px) {
  .api-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .api-details-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .status-codes {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 20px;
  }
  
  .api-name {
    font-size: 1.5rem;
  }
  
  .api-stats-grid {
    grid-template-columns: 1fr;
  }
  
  .api-details-grid {
    grid-template-columns: 1fr;
  }
  
  .status-codes {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .endpoint-box {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .endpoint-box .copy-btn {
    margin-left: 0;
    margin-top: 12px;
  }
}
</style>
