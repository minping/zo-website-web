<template>
  <AdminLayout>
    <div class="tag-management">
      <header class="content-header">
        <div class="header-left">
          <h1>标签管理</h1>
          <p>管理文章分类标签，以星图方式可视化展示</p>
        </div>
      </header>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <!-- 知识星图 -->
      <div v-else class="star-map-container">
        <div class="star-map" ref="starMapRef" @click.self="deselectTag">
          <!-- 连线 -->
          <svg class="connections-svg" :viewBox="`0 0 ${svgSize} ${mapHeight}`">
            <line
              v-for="(line, idx) in connectionLines"
              :key="'line-' + idx"
              :x1="line.x1"
              :y1="line.y1"
              :x2="line.x2"
              :y2="line.y2"
              :stroke="line.color"
              stroke-opacity="0.2"
              stroke-width="1"
              stroke-dasharray="4 4"
            />
          </svg>

          <!-- 中心节点：添加标签 -->
          <div class="center-node" @click="openAddDialog">
            <div class="center-pulse"></div>
            <div class="center-core">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <span class="center-label">添加标签</span>
          </div>

          <!-- 标签星球节点 -->
          <div
            v-for="(tag, index) in tags"
            :key="tag.id"
            class="tag-planet"
            :style="getPlanetStyle(index)"
            @click.stop="selectTag(tag)"
            :class="{ selected: selectedTag?.id === tag.id }"
          >
            <div class="planet-orbit"></div>
            <div class="planet-body" :style="{ background: tag.color || '#6366f1' }">
              <span class="planet-name">{{ tag.name }}</span>
            </div>
            <!-- 选中后的操作按钮 -->
            <div v-if="selectedTag?.id === tag.id" class="planet-actions">
              <button class="action-mini edit" @click.stop="editTag(tag)" title="编辑">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="action-mini delete" @click.stop="confirmDeleteTag(tag)" title="删除">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="tags.length === 0" class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            </svg>
            <p>暂无标签，点击中心添加</p>
          </div>
        </div>
      </div>

      <!-- 底部标签列表概览 -->
      <div class="tag-list-bar">
        <div class="list-title">全部标签 ({{ tags.length }})</div>
        <div class="tag-chips">
          <span
            v-for="tag in tags"
            :key="tag.id"
            class="tag-chip"
            :style="{ background: tag.color + '20', color: tag.color, borderColor: tag.color + '40' }"
            @click="selectTag(tag)"
          >
            {{ tag.name }}
          </span>
          <span v-if="tags.length === 0" class="no-tag-text">暂无标签</span>
        </div>
      </div>
    </div>

    <!-- 添加/编辑标签弹窗 -->
    <div v-if="showFormModal" class="modal-overlay" @click.self="closeForm">
      <div class="form-modal">
        <button class="modal-close-btn" @click="closeForm" title="关闭">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <h3 class="modal-title">{{ editingTag ? '编辑标签' : '新建标签' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>标签名称 *</label>
            <input v-model="formData.name" type="text" placeholder="输入标签名称" required />
          </div>
          <div class="form-group">
            <label>标签颜色</label>
            <div class="color-row">
              <input v-model="formData.color" type="color" class="color-picker" />
              <div
                v-for="c in presetColors"
                :key="c"
                class="preset-color"
                :style="{ background: c }"
                :class="{ active: formData.color === c }"
                @click="formData.color = c"
              ></div>
            </div>
          </div>
          <div class="form-preview">
            <span class="preview-tag" :style="{ background: formData.color + '25', color: formData.color, borderColor: formData.color + '50' }">
              {{ formData.name || '预览效果' }}
            </span>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="closeForm">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="!formData.name.trim()">
              {{ editingTag ? '保存' : '创建' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal">
        <h3>确认删除</h3>
        <p>确定要删除标签「{{ tagToDelete?.name }}」吗？已使用该标签的文章不受影响。</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showDeleteModal = false">取消</button>
          <button class="btn btn-danger" @click="deleteTag">确认删除</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      {{ toast.message }}
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { api } from '../../api/article'
import AdminLayout from './AdminLayout.vue'

const tags = ref([])
const loading = ref(false)
const selectedTag = ref(null)
const showFormModal = ref(false)
const editingTag = ref(null)
const showDeleteModal = ref(false)
const tagToDelete = ref(null)
const starMapRef = ref(null)
const mapWidth = ref(600)
const mapHeight = ref(600)

const formData = reactive({
  name: '',
  color: '#6366f1'
})

const presetColors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#84cc16', '#a855f7'
]

// 动态计算星图尺寸，使 SVG 与 DOM 节点坐标一致
const updateMapSize = () => {
  if (starMapRef.value) {
    const rect = starMapRef.value.getBoundingClientRect()
    mapWidth.value = rect.width
    mapHeight.value = rect.height
  }
}

const svgSize = computed(() => mapWidth.value)
const centerX = computed(() => mapWidth.value / 2)
const centerY = computed(() => mapHeight.value / 2)
const planetRadius = computed(() => Math.min(mapWidth.value, mapHeight.value) * 0.38)

const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

// 简单哈希函数，基于 tag id 生成确定性的伪随机位置
const simpleHash = (str, seed) => {
  let h = seed
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

// 将坐标约束回环形区域内
const clampToRing = (pos, cx, cy, innerR, outerR) => {
  const dx = pos.x - cx
  const dy = pos.y - cy
  let dist = Math.sqrt(dx * dx + dy * dy)
  if (dist < 1) dist = 1
  const angle = Math.atan2(dy, dx)
  if (dist < innerR) dist = innerR
  if (dist > outerR) dist = outerR
  pos.x = cx + dist * Math.cos(angle)
  pos.y = cy + dist * Math.sin(angle)
}

// 每个 tag 的星图坐标（基于 tag id 哈希，含碰撞避免，位置固定不会跳动）
const tagPositions = computed(() => {
  const n = tags.value.length
  if (n === 0) return []
  const cx = centerX.value
  const cy = centerY.value
  const maxR = planetRadius.value
  const innerR = maxR * 0.3
  const outerR = maxR * 0.88
  const minDist = 96  // 标签星球直径(56) + 轨道(90) 的一半 ≈ 足够间距

  // 初始随机位置
  const positions = tags.value.map(tag => {
    const key = String(tag.id ?? tag.name)
    const angle = (simpleHash(key, 42) % 1000) / 1000 * 2 * Math.PI
    const dist = innerR + (simpleHash(key, 77) % 1000) / 1000 * (outerR - innerR)
    return {
      tagId: tag.id,
      x: cx + dist * Math.cos(angle),
      y: cy + dist * Math.sin(angle)
    }
  })

  if (n <= 1) return positions

  // 迭代斥力：推开重叠的节点
  const iterations = 400
  const repulsion = 0.6
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = positions[i].x - positions[j].x
        const dy = positions[i].y - positions[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < minDist && dist > 0.01) {
          const force = ((minDist - dist) / minDist) * repulsion * 0.5
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force
          positions[i].x += fx
          positions[i].y += fy
          positions[j].x -= fx
          positions[j].y -= fy
          clampToRing(positions[i], cx, cy, innerR, outerR)
          clampToRing(positions[j], cx, cy, innerR, outerR)
        }
      }
    }
  }

  return positions
})

// 计算连线
const connectionLines = computed(() => {
  const positions = tagPositions.value
  const n = positions.length
  if (n === 0) return []
  
  const cx = centerX.value
  const cy = centerY.value
  const lines = []

  // 每个标签连线到中心
  positions.forEach((pos) => {
    const tag = tags.value.find(t => t.id === pos.tagId)
    lines.push({
      x1: cx, y1: cy,
      x2: pos.x, y2: pos.y,
      color: tag?.color || '#6366f1'
    })
  })

  return lines
})

// 计算行星位置
const getPlanetStyle = (index) => {
  const pos = tagPositions.value[index]
  if (!pos) return { display: 'none' }
  return {
    left: pos.x + 'px',
    top: pos.y + 'px',
    transform: 'translate(-50%, -50%)'
  }
}

// 加载标签
const loadTags = async () => {
  loading.value = true
  try {
    const res = await api.getArticleTags()
    if (res.success && res.data) {
      tags.value = res.data
    }
  } catch (error) {
    console.error('获取标签失败:', error)
  } finally {
    loading.value = false
  }
}

// 选中标签
const selectTag = (tag) => {
  selectedTag.value = selectedTag.value?.id === tag.id ? null : tag
}

// 取消选中
const deselectTag = () => {
  selectedTag.value = null
}

// 打开添加弹窗
const openAddDialog = () => {
  editingTag.value = null
  formData.name = ''
  formData.color = '#6366f1'
  showFormModal.value = true
}

// 编辑标签
const editTag = (tag) => {
  editingTag.value = tag
  formData.name = tag.name
  formData.color = tag.color || '#6366f1'
  showFormModal.value = true
}

// 关闭弹窗
const closeForm = () => {
  showFormModal.value = false
  editingTag.value = null
}

// 提交表单
const handleSubmit = async () => {
  if (!formData.name.trim()) return
  try {
    const id = editingTag.value ? editingTag.value.id : ''
    const res = await api.insertArticleTag(id, formData.name.trim(), formData.color)
    if (res.success) {
      showToast(editingTag.value ? '标签已更新' : '标签创建成功')
      await loadTags()
      closeForm()
    } else {
      showToast(res.message || '操作失败', 'error')
    }
  } catch (error) {
    console.error('操作标签失败:', error)
    showToast('操作失败', 'error')
  }
}

// 确认删除
const confirmDeleteTag = (tag) => {
  tagToDelete.value = tag
  showDeleteModal.value = true
}

// 删除标签
const deleteTag = async () => {
  try {
    const res = await api.deleteArticleTag(tagToDelete.value.id)
    if (res.success) {
      showToast('标签已删除')
      if (selectedTag.value?.id === tagToDelete.value.id) {
        selectedTag.value = null
      }
      await loadTags()
    } else {
      showToast(res.message || '删除失败', 'error')
    }
  } catch (error) {
    console.error('删除标签失败:', error)
    showToast('删除失败', 'error')
  }
  showDeleteModal.value = false
  tagToDelete.value = null
}

onMounted(async () => {
  await loadTags()
  await nextTick()
  updateMapSize()
  window.addEventListener('resize', updateMapSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateMapSize)
})
</script>

<style scoped>
.tag-management {
  --admin-bg-primary: #0f0f23;
  --admin-bg-card: #1a1a2e;
  --admin-border-color: #2d2d44;
  --admin-text-primary: #e4e4e7;
  --admin-text-secondary: #a1a1aa;
  --admin-accent-primary: #6366f1;
  --admin-hover-bg: rgba(99, 102, 241, 0.15);
  max-width: 1400px;
}

.content-header {
  margin-bottom: 24px;
}

.header-left h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--admin-text-primary);
  margin-bottom: 4px;
}

.header-left p {
  color: var(--admin-text-secondary);
  font-size: 14px;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 0;
  color: var(--admin-text-secondary);
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(99, 102, 241, 0.1);
  border-top-color: var(--admin-accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 星图容器 */
.star-map-container {
  background: var(--admin-bg-card);
  border: 1px solid var(--admin-border-color);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 24px;
  overflow: hidden;
}

.star-map {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  max-width: 600px;
  max-height: 600px;
  margin: 0 auto;
  background: radial-gradient(ellipse at center, rgba(99, 102, 241, 0.05) 0%, transparent 70%);
}

/* 连线 SVG */
.connections-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* 中心节点 */
.center-node {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  z-index: 10;
  transition: transform 0.3s;
}

.center-node:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.center-pulse {
  position: absolute;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.15);
  animation: pulse-ring 2s ease-out infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.8); opacity: 0; }
}

.center-core {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 0 24px rgba(99, 102, 241, 0.4);
  z-index: 1;
}

.center-label {
  font-size: 13px;
  color: var(--admin-text-secondary);
  font-weight: 500;
}

/* 标签星球 */
.tag-planet {
  position: absolute;
  cursor: pointer;
  z-index: 5;
  transition: transform 0.3s, filter 0.3s;
}

.tag-planet:hover {
  z-index: 15;
  transform: translate(-50%, -50%) scale(1.15) !important;
}

.tag-planet.selected {
  z-index: 20;
  transform: translate(-50%, -50%) scale(1.2) !important;
}

.planet-orbit {
  position: absolute;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.06);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: orbit-rotate 12s linear infinite;
}

@keyframes orbit-rotate {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.planet-body {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2);
  transition: box-shadow 0.3s;
}

.tag-planet.selected .planet-body {
  box-shadow: 0 0 30px currentColor;
}

.planet-name {
  font-size: 11px;
  font-weight: 600;
  color: white;
  text-align: center;
  line-height: 1.2;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

/* 行星操作按钮 */
.planet-actions {
  position: absolute;
  top: -8px;
  right: -8px;
  display: flex;
  gap: 4px;
  z-index: 25;
}

.action-mini {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--admin-bg-card);
  border: 1px solid var(--admin-border-color);
  color: var(--admin-text-secondary);
}

.action-mini.edit:hover {
  background: var(--admin-accent-primary);
  color: white;
  border-color: var(--admin-accent-primary);
}

.action-mini.delete:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

/* 空状态 */
.empty-state {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--admin-text-secondary);
}

.empty-state svg {
  opacity: 0.4;
}

/* 底部标签列表 */
.tag-list-bar {
  background: var(--admin-bg-card);
  border: 1px solid var(--admin-border-color);
  border-radius: 12px;
  padding: 20px 24px;
}

.list-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--admin-text-primary);
  margin-bottom: 12px;
}

.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-chip {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.tag-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.no-tag-text {
  color: var(--admin-text-secondary);
  font-size: 14px;
}

/* 按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background: var(--admin-accent-primary);
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
  background: transparent;
  border: 1px solid var(--admin-border-color);
  color: var(--admin-text-primary);
}

.btn-secondary:hover {
  background: var(--admin-hover-bg);
  border-color: var(--admin-accent-primary);
  color: var(--admin-accent-primary);
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  opacity: 0.9;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--admin-bg-card);
  border: 1px solid var(--admin-border-color);
  border-radius: 16px;
  padding: 32px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--admin-text-primary);
  margin-bottom: 12px;
}

.modal p {
  color: var(--admin-text-secondary);
  margin-bottom: 24px;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.form-modal {
  background: var(--admin-bg-card);
  border: 1px solid var(--admin-border-color);
  border-radius: 16px;
  padding: 28px;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  position: relative;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--admin-text-primary);
  margin: 0 0 24px 0;
}

.modal-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--admin-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
}

.modal-close-btn:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.modal-close-btn svg {
  flex-shrink: 0;
}

.form-modal .form-group {
  margin-bottom: 20px;
}

.form-modal .form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--admin-text-primary);
  margin-bottom: 8px;
}

.form-modal .form-group input[type="text"] {
  width: 100%;
  padding: 10px 14px;
  background: var(--admin-bg-primary);
  border: 1px solid var(--admin-border-color);
  border-radius: 8px;
  color: var(--admin-text-primary);
  font-size: 14px;
  box-sizing: border-box;
}

.form-modal .form-group input:focus {
  outline: none;
  border-color: var(--admin-accent-primary);
}

.color-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.color-picker {
  width: 40px;
  height: 40px;
  padding: 2px;
  background: var(--admin-bg-primary);
  border: 1px solid var(--admin-border-color);
  border-radius: 8px;
  cursor: pointer;
}

.color-picker::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-picker::-webkit-color-swatch {
  border: none;
  border-radius: 6px;
}

.preset-color {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.preset-color:hover {
  transform: scale(1.15);
}

.preset-color.active {
  border-color: white;
  box-shadow: 0 0 8px currentColor;
  transform: scale(1.1);
}

.form-preview {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--admin-bg-primary);
  border-radius: 8px;
  text-align: center;
}

.preview-tag {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid transparent;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--admin-border-color);
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
  z-index: 2000;
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
</style>
