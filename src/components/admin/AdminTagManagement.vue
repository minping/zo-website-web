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

<style scoped src="./AdminTagManagement.css"></style>
