<template>
  <AdminLayout>
    <div class="notes-page">
      <!-- 页面头部 -->
      <div class="content-header">
        <div>
          <h1>我的笔记</h1>
          <p>维护你的笔记列表</p>
        </div>
        <button class="btn-add" @click="openAddDialog">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          新增笔记
        </button>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && notes.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        <p>暂无笔记</p>
        <span>点击「新增笔记」创建第一条笔记</span>
      </div>

      <!-- 笔记列表（卡片） -->
      <div v-if="!loading && notes.length > 0" class="note-list">
        <div
          v-for="note in notes"
          :key="note.id"
          class="note-card"
          :title="`进入「${note.name || '未命名'}」的章节页面`"
          @click="goToChapter(note)"
        >
          <!-- 发布状态（左上角） -->
          <span
            class="note-status-flag"
            :class="{ published: note.statusValue === 1 }"
          >
            <span class="status-dot"></span>
            {{ note.statusValue === 1 ? '已发布' : '未发布' }}
          </span>

          <!-- 更多操作（三点菜单） -->
          <div class="card-menu" @click.stop>
            <button
              class="btn-more"
              :class="{ active: menuOpenId === note.id }"
              @click="toggleMenu(note.id)"
              title="更多操作"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
            </button>
            <div v-if="menuOpenId === note.id" class="card-menu-dropdown">
                <button class="card-menu-item" @click="closeMenu(); toggleStatus(note)">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {{ note.statusValue === 1 ? '取消发布' : '发布' }}
              </button>
              <button
                v-if="note.statusValue !== 1"
                class="card-menu-item"
                @click="closeMenu(); openEditDialog(note)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                编辑
              </button>
              <button
                v-if="note.statusValue !== 1"
                class="card-menu-item danger"
                @click="closeMenu(); handleDelete(note)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                删除
              </button>
            </div>
          </div>

          <!-- 卡片中央：标题 -->
          <div class="cover-center">
            <h3 class="cover-title">{{ note.name || '未命名' }}</h3>
          </div>

          <!-- 卡片摘要 -->
          <p v-if="note.preface" class="cover-preface">{{ note.preface }}</p>

          <!-- 进度条 -->
          <div class="cover-progress">
            <div class="progress-track">
              <div
                class="progress-fill"
                :style="{ width: clampProcess(note.process) + '%' }"
              ></div>
            </div>
            <span class="progress-text">{{ clampProcess(note.process) }}%</span>
          </div>

          <!-- 卡片底部 -->
          <div class="cover-foot">
            <div class="cover-meta">
              <span v-if="note.createTime" class="cover-meta-item">创建 {{ note.createTime }}</span>
              <span v-if="note.updateTime" class="cover-meta-item">修改 {{ note.updateTime }}</span>
            </div>
            <span v-if="note.author" class="cover-author">{{ note.author }} </span>
          </div>
        </div>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="empty-state">
        <p>加载中...</p>
      </div>
    </div>

    <!-- 表单弹窗 -->
    <div v-if="dialog.visible" class="modal-mask" @click.self="closeDialog">
      <div class="modal-wrap">
        <div class="modal-header">
          <h3>{{ dialog.mode === 'edit' ? '编辑笔记' : '新增笔记' }}</h3>
          <button class="modal-close" @click="closeDialog">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">名称 <span class="required">*</span></label>
            <input v-model="formData.name" class="form-input" type="text" placeholder="请输入笔记名称" maxlength="100" />
          </div>
          <div class="form-group">
            <label class="form-label">作者</label>
            <input v-model="formData.author" class="form-input" type="text" placeholder="请输入作者" maxlength="50" />
          </div>
          <div class="form-group">
            <label class="form-label">序言</label>
            <textarea v-model="formData.preface" class="form-textarea" placeholder="请输入序言" rows="5" maxlength="500"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">发布状态</label>
            <div class="status-radio-group">
              <label class="status-radio">
                <input v-model="formData.statusValue" type="radio" :value="0" />
                <span class="radio-dot"></span>
                未发布
              </label>
              <label class="status-radio">
                <input v-model="formData.statusValue" type="radio" :value="1" />
                <span class="radio-dot"></span>
                已发布
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeDialog">取消</button>
          <button class="btn-save" :disabled="saving" @click="handleSave">
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="deleteDialog.visible" class="modal-mask" @click.self="closeDeleteDialog">
      <div class="modal-wrap confirm-modal">
        <div class="modal-header">
          <h3>删除笔记</h3>
          <button class="modal-close" @click="closeDeleteDialog">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body confirm-body">
          <div class="confirm-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <p class="confirm-text">确定要删除笔记「{{ deleteDialog.note?.name }}」吗？</p>
          <p class="confirm-sub">删除后无法恢复，请谨慎操作。</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeDeleteDialog">取消</button>
          <button class="btn-save btn-danger" @click="confirmDelete">确认删除</button>
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
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from './AdminLayout.vue'
import api from '../../api/article.js'

const router = useRouter()

// 进度值处理：process 为 0-100 数字，100 时满格；缺失或非法值按 0 处理
const clampProcess = (v) => {
  const n = Number(v)
  if (Number.isNaN(n)) return 0
  return Math.min(100, Math.max(0, n))
}

// 点击笔记卡片：新标签页打开章节页面，仅携带笔记 id，其余信息由章节页通过详情接口获取
const goToChapter = (note) => {
  const { href } = router.resolve({
    path: '/admin/chapter',
    query: { id: note.id }
  })
  window.open(href, '_blank')
}

// Toast
const toast = ref({ show: false, message: '', type: 'success' })
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 2500)
}

const notes = ref([])
const loading = ref(false)

// 表单弹窗
const dialog = reactive({ visible: false, mode: 'add', loading: false })
const formData = reactive({
  id: null,
  name: '',
  author: '',
  preface: '',
  statusValue: 0
})
const saving = ref(false)

// 更多操作菜单状态
const menuOpenId = ref(null)

const toggleMenu = (id) => {
  menuOpenId.value = menuOpenId.value === id ? null : id
}

const closeMenu = () => {
  menuOpenId.value = null
}

onMounted(() => {
  loadNotes()
  document.addEventListener('click', closeMenu)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeMenu)
})

const loadNotes = async () => {
  loading.value = true
  try {
    const res = await api.getNoteList()
    if (res.success || res.code === 200 || res.code === 0) {
      notes.value = res.data || []
    } else if (res.data) {
      notes.value = res.data
    }
  } catch (e) {
    console.error('加载笔记列表失败:', e)
    showToast('加载笔记列表失败', 'error')
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  formData.id = null
  formData.name = ''
  formData.author = ''
  formData.preface = ''
  formData.statusValue = 0
  dialog.mode = 'add'
  dialog.visible = true
}

const openEditDialog = async (note) => {
  dialog.visible = true
  dialog.mode = 'edit'
  dialog.loading = true
  // 从列表数据即时填充
  formData.id = note.id
  formData.name = note.name || ''
  formData.author = note.author || ''
  formData.preface = note.preface || ''
  formData.statusValue = note.statusValue === 1 ? 1 : 0
  // 再通过详情接口拉取最新数据（返回字段与传入一致）
  try {
    const res = await api.getNoteDetail(note.id)
    if (res.data) {
      formData.id = res.data.id
      formData.name = res.data.name || ''
      formData.author = res.data.author || ''
      formData.preface = res.data.preface || ''
      formData.statusValue = res.data.statusValue === 1 ? 1 : 0
    }
  } catch (e) {
    console.error('加载笔记详情失败:', e)
  } finally {
    dialog.loading = false
  }
}

const closeDialog = () => {
  dialog.visible = false
}

const handleSave = async () => {
  if (!formData.name.trim()) {
    showToast('请输入笔记名称', 'error')
    return
  }
  saving.value = true
  try {
    // 需传 id, name, author, preface, statusValue（0 未发布 / 1 已发布）
    const payload = {
      name: formData.name.trim(),
      author: formData.author.trim(),
      preface: formData.preface.trim(),
      statusValue: formData.statusValue === 1 ? 1 : 0
    }
    if (formData.id) {
      payload.id = formData.id
    }
    const res = await api.saveNote(payload)
    if (res.success || res.code === 200 || res.code === 0) {
      showToast(dialog.mode === 'edit' ? '保存成功' : '新增成功')
      dialog.visible = false
      loadNotes()
    } else {
      showToast(res.message || '保存失败', 'error')
    }
  } catch (e) {
    console.error('保存笔记失败:', e)
    showToast('保存失败', 'error')
  } finally {
    saving.value = false
  }
}

// 切换发布状态（0 未发布 / 1 已发布）
const toggleStatus = async (note) => {
  const target = note.statusValue === 1 ? 0 : 1
  try {
    const res = await api.updateNoteStatus(note.id, target)
    if (res.success || res.code === 200 || res.code === 0) {
      note.statusValue = target
      showToast(target === 1 ? '已发布' : '已设为未发布')
    } else {
      showToast(res.message || '状态更新失败', 'error')
    }
  } catch (e) {
    console.error('更新笔记状态失败:', e)
    showToast('状态更新失败', 'error')
  }
}

// 删除确认弹窗
const deleteDialog = reactive({ visible: false, note: null })

const handleDelete = (note) => {
  deleteDialog.note = note
  deleteDialog.visible = true
}

const closeDeleteDialog = () => {
  deleteDialog.visible = false
  deleteDialog.note = null
}

const confirmDelete = async () => {
  if (!deleteDialog.note) return
  const note = deleteDialog.note
  closeDeleteDialog()
  try {
    await api.deleteNote(note.id)
    showToast('删除成功')
    loadNotes()
  } catch (e) {
    console.error('删除笔记失败:', e)
    showToast('删除失败', 'error')
  }
}
</script>

<style scoped src="./AdminNoteList.css"></style>
