<template>
  <div class="chapter-page">
    <!-- 顶部栏 -->
    <header class="chapter-topbar">
      <div class="topbar-left">
        <button class="back-btn" @click="goBack">返回</button>
        <span class="topbar-divider"></span>
        <span class="topbar-title">章节预览</span>
      </div>
      <span v-if="noteId" class="note-id-badge">
        {{ noteName || `笔记 #${noteId}` }}
      </span>
    </header>

    <!-- 阅读区：左侧目录 + 右侧书本页 -->
    <div class="reader-container">
      <!-- 左侧章节目录 -->
      <aside class="toc-panel" :class="{ collapsed: tocCollapsed }">
        <!-- 折叠/展开切换按钮 -->
        <button
          class="toc-toggle"
          :title="tocCollapsed ? '展开目录' : '收起目录'"
          @click="tocCollapsed = !tocCollapsed"
        >
          <template v-if="tocCollapsed">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </template>
          <template v-else>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </template>
        </button>

        <!-- 展开状态：完整目录 -->
        <template v-if="!tocCollapsed">
          <div class="toc-book">
            <div class="toc-book-info">
              <h2 class="toc-book-title">{{ noteName || book.title || '未命名笔记' }}</h2>
              <p class="toc-book-author">{{ noteAuthor || book.author || '未知作者' }} 著</p>
            </div>
          </div>

          <div class="toc-title-row">
            <span class="toc-title">目录</span>
            <button class="add-chapter-btn" title="新建章节" @click="openAddDialog">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              新建章节
            </button>
          </div>

          <ul class="toc-list">
            <!-- 序言：默认章节，展示笔记详情接口的 preface -->
            <li
              class="toc-item"
              :class="{ active: currentIndex === -1 }"
              @click="selectChapter(-1)"
              title="序言"
            >
              <span class="toc-name">序言</span>
              <span class="toc-dot"></span>
            </li>
            <li
              v-for="(chapter, index) in flatChapters"
              :key="chapter.id"
              class="toc-item"
              :class="['toc-level-' + chapter.level, { active: currentIndex === index }]"
              @click="selectChapter(index)"
              @dblclick="openEditDialog(index)"
              @contextmenu.prevent.stop="openChapterMenu($event, index)"
              title="双击编辑，右键更多操作"
            >
              <span class="toc-index">{{ chapter.label }}</span>
              <span class="toc-name">{{ chapter.title }}</span>
              <span class="toc-dot"></span>
            </li>
          </ul>
          <p v-if="loading" class="toc-empty">章节加载中…</p>
          <p v-else-if="!book.chapters.length" class="toc-empty">
            暂无章节，点击上方「新建章节」创建
          </p>
        </template>

        <!-- 折叠状态：竖排目录提示，点击展开 -->
        <div v-else class="toc-collapsed-hint" @click="tocCollapsed = false">
          目录
        </div> 
      </aside>

      <!-- 右侧书本页面 -->
      <main class="book-wrap">
        <transition name="book-fade" mode="out-in">
          <!-- 加载中 -->
          <div v-if="loading" class="book-page book-page-state" :key="'loading'">
            <div class="loading-state">
              <div class="loading-spinner"></div>
              <span>章节加载中…</span>
            </div>
          </div>

          <!-- 加载失败 -->
          <div v-else-if="loadError" class="book-page book-page-state" :key="'error'">
            <div class="empty-state">
              <p>{{ loadError }}</p>
              <button class="btn btn-secondary btn-sm" @click="loadChapters">重新加载</button>
            </div>
          </div>

          <!-- 序言：展示笔记详情接口的 preface -->
          <div v-else-if="noteId && currentIndex === -1" class="book-page preface-page" :key="'preface'">
            <div class="preface-header">
              <span class="preface-label">序言</span>
              <h2 class="preface-title">{{ noteName || '未命名笔记' }}</h2>
            </div>
            <div class="preface-content" v-html="renderedPreface"></div>
            <p v-if="!notePreface" class="preface-empty">暂无序言内容</p>
          </div>

          <!-- 缺少笔记参数（直接从地址栏进入） -->
          <div v-else-if="!noteId" class="book-page book-page-state" :key="'empty'">
            <div class="empty-state">
              <p>缺少笔记参数</p>
              <span>请从笔记列表进入本章节页面</span>
            </div>
          </div>

          <!-- 章节内容编辑器（markdown） -->
          <div v-else class="book-page chapter-editor" :key="currentIndex">
            <div class="editor-header">
              <div class="editor-heading">
                <span class="editor-chapter-label">{{ currentChapter.label ? '第 ' + currentChapter.label + ' 章' : '' }}</span>
                <input
                  class="editor-title-input"
                  v-model="editingTitle"
                  type="text"
                  placeholder="请输入章节标题"
                />
              </div>
              <div class="editor-actions">
                <button
                  class="editor-nav-btn"
                  :disabled="currentIndex === 0"
                  @click="selectChapter(currentIndex - 1)"
                >上一章</button>
                <button
                  class="editor-nav-btn"
                  :disabled="currentIndex === book.chapters.length - 1"
                  @click="selectChapter(currentIndex + 1)"
                >下一章</button>
                <button
                  class="editor-save-btn"
                  :disabled="savingContent || !dirty"
                  @click="saveCurrentChapter"
                >{{ savingContent ? '保存中…' : (dirty ? '保存本章' : '已保存') }}</button>
                <template v-if="Number(currentChapter.complete) === 1">
                  <span class="editor-completed-badge">✓ 已完成</span>
                </template>
                <template v-else>
                  <button
                    class="editor-complete-btn"
                    :disabled="completing"
                    @click="handleCompleteChapter"
                  >{{ completing ? '完成中…' : '完成章节' }}</button>
                </template>
              </div>
            </div>
            <div class="editor-body">
              <MilkdownEditor v-model="chapterContent" />
            </div>
            <div class="editor-footer">
              <span>第 {{ currentChapter.label }} / 共 {{ flatChapters.length }} 章</span>
              <span v-if="dirty" class="editor-dirty-hint">有未保存的修改</span>
            </div>
          </div>
        </transition>
      </main>
    </div>

    <!-- 新建/编辑章节弹窗 -->
    <div v-if="dialogVisible" class="modal-overlay">
      <div class="modal">
        <h3>{{ dialogMode === 'edit' ? '编辑章节' : dialogMode === 'child' ? '新建小节' : '新建章节' }}</h3>
        <p>{{ dialogMode === 'edit' ? '修改章节标题与排序' : dialogMode === 'child' ? `在「${chapterForm.pidTitle}」下新建小节` : '维护章节标题与排序' }}</p>
        <div class="form-group">
          <label>标题</label>
          <input v-model="chapterForm.title" class="input" type="text" placeholder="请输入章节标题" />
        </div>
        <div class="form-group">
          <label>排序</label>
          <input v-model.number="chapterForm.orders" class="input" type="number" min="0" placeholder="数值越小越靠前" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary dialog-cancel" :disabled="saving" @click="closeAddDialog">取消</button>
          <button class="btn btn-primary dialog-confirm" :disabled="saving" @click="handleSaveChapter">{{ saving ? '保存中…' : '确定' }}</button>
        </div>
      </div>
    </div>

    <!-- 完成章节确认弹窗 -->
    <div v-if="completeConfirmVisible" class="modal-overlay" @click.self="closeCompleteConfirm">
      <div class="modal complete-modal">
        <h3>确认完成章节</h3>
        <p>确定将当前笔记标记为「已完成」吗？完成后将展示「✓ 已完成」标记。</p>
        <div class="modal-actions">
          <button class="btn btn-secondary complete-cancel" :disabled="completing" @click="closeCompleteConfirm">取消</button>
          <button class="btn complete-confirm" :disabled="completing" @click="confirmCompleteChapter">
            {{ completing ? '完成中…' : '确认完成' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 删除章节确认弹窗 -->
    <div v-if="deleteConfirmVisible" class="modal-overlay" @click.self="closeDeleteConfirm">
      <div class="modal delete-modal">
        <h3>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          删除章节
        </h3>
        <p>确定要删除章节「{{ deleteChapterTitle }}」吗？删除后不可恢复。</p>
        <div class="modal-actions">
          <button class="btn btn-secondary delete-cancel" :disabled="deleting" @click="closeDeleteConfirm">取消</button>
          <button class="btn delete-confirm" :disabled="deleting" @click="confirmDeleteChapter">
            {{ deleting ? '删除中…' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 章节右键菜单：编辑 / 删除 -->
    <transition name="ctx-fade">
      <div
        v-if="contextMenu.visible"
        class="chapter-ctx-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      >
        <button class="ctx-item" @click="ctxAddChild">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          新建小节
        </button>
        <button class="ctx-item" @click="ctxEdit">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
          编辑
        </button>
        <button class="ctx-item danger" @click="ctxDelete">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          删除
        </button>
      </div>
    </transition>

    <!-- 提示 -->
    <transition name="toast-fade">
      <div v-if="toast.show" class="chapter-toast" :class="toast.type">{{ toast.message }}</div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import api from '../../api/article.js'
import MilkdownEditor from './MilkdownEditor.vue'

const route = useRoute()
const router = useRouter()

// 从查询参数读取笔记 id（名称、作者等信息由详情接口获取）
const noteId = route.query.id || ''
const noteName = ref('')
const noteAuthor = ref('')
// 笔记序言（来自详情接口的 preface 字段，展示在默认的「序言」章节中）
const notePreface = ref('')

// 序言 markdown 渲染结果
const renderedPreface = computed(() =>
  notePreface.value ? marked.parse(notePreface.value) : ''
)

// 目录折叠/展开状态
const tocCollapsed = ref(false)

// 章节弹窗（新建/编辑/新建小节）
const dialogVisible = ref(false)
const dialogMode = ref('add') // 'add' | 'edit' | 'child'
const editingChapterId = ref(null)
const chapterForm = ref({ title: '', orders: 0, pid: null, pidTitle: '' })

const openAddDialog = () => {
  dialogMode.value = 'add'
  editingChapterId.value = null
  chapterForm.value = { title: '', orders: 0, pid: null, pidTitle: '' }
  dialogVisible.value = true
}

const openAddChildDialog = (index) => {
  const chapter = flatChapters.value[index]
  if (!chapter) return
  // 只支持二级目录：二级章节不能再建子级
  if (chapter.level >= 1) {
    showToast('最多支持二级目录', 'error')
    return
  }
  dialogMode.value = 'child'
  editingChapterId.value = null
  chapterForm.value = { title: '', orders: 0, pid: chapter.id, pidTitle: chapter.title || '' }
  dialogVisible.value = true
}

const openEditDialog = (index) => {
  const chapter = flatChapters.value[index]
  if (!chapter) return
  dialogMode.value = 'edit'
  editingChapterId.value = chapter.id
  chapterForm.value = {
    title: chapter.title || '',
    orders: Number(chapter.orders ?? 0),
    pid: chapter.pid || null,
    pidTitle: ''
  }
  dialogVisible.value = true
}

const closeAddDialog = () => {
  dialogVisible.value = false
}

// 章节右键菜单（新建小节 / 编辑 / 删除）
const contextMenu = ref({ visible: false, x: 0, y: 0, index: -1 })

const openChapterMenu = (e, index) => {
  const menuW = 132
  const menuH = 120
  const x = Math.min(e.clientX, window.innerWidth - menuW - 8)
  const y = Math.min(e.clientY, window.innerHeight - menuH - 8)
  contextMenu.value = { visible: true, x: Math.max(8, x), y: Math.max(8, y), index }
}

const closeChapterMenu = () => {
  if (contextMenu.value.visible) contextMenu.value.visible = false
}

const ctxAddChild = () => {
  const idx = contextMenu.value.index
  closeChapterMenu()
  if (idx >= 0) openAddChildDialog(idx)
}

const ctxEdit = () => {
  const idx = contextMenu.value.index
  closeChapterMenu()
  if (idx >= 0) openEditDialog(idx)
}

const ctxDelete = () => {
  const idx = contextMenu.value.index
  closeChapterMenu()
  if (idx >= 0) requestDeleteChapter(idx)
}

// 保存章节（新建/编辑统一）：调用保存接口成功后刷新章节列表
const saving = ref(false)

const handleSaveChapter = async () => {
  const title = chapterForm.value.title.trim()
  if (!title) {
    showToast('请输入章节标题', 'error')
    return
  }
  if (saving.value) return
  saving.value = true
  const isEdit = dialogMode.value === 'edit'
  try {
    const payload = isEdit
      ? {
          noteId,
          id: editingChapterId.value,
          pid: chapterForm.value.pid || null,
          title,
          orders: Number(chapterForm.value.orders) || 0,
          // 编辑时保留原内容，避免被清空
          content: (flatChapters.value.find((c) => c.id === editingChapterId.value) || {}).content || ''
        }
      : {
          noteId,
          pid: chapterForm.value.pid || null,
          title,
          orders: Number(chapterForm.value.orders) || 0,
          content: ''
        }
    const res = await api.saveChapter(payload)
    if (res.success || res.code === 200 || res.code === 0) {
      const rawId = res.data
      const savedId =
        rawId && typeof rawId === 'object' ? rawId.id ?? rawId.chapter_id ?? null : rawId ?? null
      const targetId = savedId ?? (isEdit ? editingChapterId.value : null)
      // 重新拉取章节列表，保证展示后端最新数据（真实 id、排序等）
      await loadChapters()
      if (targetId) {
        const idx = flatChapters.value.findIndex((c) => c.id === targetId)
        if (idx !== -1) {
          currentIndex.value = idx
          loadChapterContent()
        }
      }
      dialogVisible.value = false
      showToast(isEdit ? '章节已更新' : dialogMode.value === 'child' ? '小节已创建' : '章节已创建')
    } else {
      showToast(res.message || res.msg || '保存失败', 'error')
    }
  } catch (e) {
    console.error('保存章节失败', e)
    showToast('保存失败，请稍后重试', 'error')
  } finally {
    saving.value = false
  }
}

// 轻提示
const toast = ref({ show: false, message: '', type: 'success' })
let toastTimer = null
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value.show = false
  }, 2500)
}

// 返回：新标签页直接关闭；直接访问则跳回笔记列表
const goBack = () => {
  if (window.opener && window.close) {
    window.close()
  } else {
    router.push('/admin/notes')
  }
}

// 完成章节：调接口标记章节为完成状态（GET /admin/notes/completeChapter?id=<章节id>）
const completing = ref(false)
const completeConfirmVisible = ref(false)

// 点击「完成章节」按钮：打开二次确认弹窗
const handleCompleteChapter = () => {
  const chapter = currentChapter.value
  if (!chapter || !chapter.id) {
    showToast('请先选择章节', 'error')
    return
  }
  if (completing.value) return
  completeConfirmVisible.value = true
}

const closeCompleteConfirm = () => {
  if (completing.value) return
  completeConfirmVisible.value = false
}

// 弹窗确认后真正执行
const confirmCompleteChapter = async () => {
  const chapter = currentChapter.value
  if (!chapter || !chapter.id) return
  if (completing.value) return
  completing.value = true
  try {
    const res = await api.completeChapter(chapter.id)
    if (res.success || res.code === 200 || res.code === 0) {
      showToast('章节已标记为完成')
      completeConfirmVisible.value = false
      // 本地乐观更新：立即把当前章节标记为已完成（无论接口刷新时序）
      chapter.complete = 1
      // 刷新章节列表（静默刷新，保留当前章节位置）
      loadChapters({ keepCurrent: true, silent: true })
    } else {
      showToast(res.message || res.msg || '操作失败', 'error')
    }
  } catch (e) {
    console.error('完成章节失败', e)
    showToast('操作失败，请稍后重试', 'error')
  } finally {
    completing.value = false
  }
}

// 书籍数据（章节结构，由接口读取）
const book = ref({
  title: '',
  author: '',
  chapters: []
})

// 树形章节拍平为列表：level 表示层级（0 一级 / 1 二级…），label 为展示序号（01 / 1.1）
const flatChapters = computed(() => {
  const result = []
  const walk = (items, level, parentLabel) => {
    items.forEach((item, i) => {
      const label = parentLabel
        ? `${parentLabel}.${i + 1}`
        : String(i + 1).padStart(2, '0')
      result.push({ ...item, level, label })
      if (Array.isArray(item.children) && item.children.length) {
        walk(item.children, level + 1, label)
      }
    })
  }
  walk(book.value.chapters, 0, '')
  return result
})

// 加载状态
const loading = ref(false)
const loadError = ref('')

// 查询笔记详情：获取笔记名称、作者等信息
const loadNoteInfo = async () => {
  if (!noteId) return
  try {
    const res = await api.getNoteDetail(noteId)
    const data = res?.data
    if (data) {
      noteName.value = data.name || ''
      noteAuthor.value = data.author || ''
      notePreface.value = data.preface || ''
    }
  } catch (e) {
    console.error('查询笔记详情失败', e)
  }
}

const loadChapters = async (opts = {}) => {
  const { keepCurrent = false, silent = false } = opts
  if (!noteId) return
  if (!silent) loading.value = true
  loadError.value = ''
  try {
    const res = await api.getChapterList(noteId)
    const list = res.data || []
    book.value.chapters = list
    if (keepCurrent && currentIndex.value >= 0 && currentIndex.value < flatChapters.value.length) {
      // 保留当前章节位置，仅刷新内容
      loadChapterContent()
    } else {
      // 默认停留在「序言」章节
      currentIndex.value = -1
      loadChapterContent()
    }
  } catch (e) {
    console.error('查询章节列表失败', e)
    loadError.value = '章节加载失败，请稍后重试'
  } finally {
    if (!silent) loading.value = false
  }
}

// 当前章节索引：-1 表示「序言」（默认），>= 0 表示 flatChapters 中的真实章节
const currentIndex = ref(-1)

const currentChapter = computed(() =>
  flatChapters.value[currentIndex.value] || { title: '', content: '', orders: 0, level: 0, label: '' }
)

// 当前章节的编辑状态（标题 + markdown 内容）
const chapterContent = ref('')
const editingTitle = ref('')
const savingContent = ref(false)
const dirty = ref(false)

// 将当前章节内容载入编辑器
const loadChapterContent = () => {
  chapterContent.value = currentChapter.value.content || ''
  editingTitle.value = currentChapter.value.title || ''
}

// 内容/标题变化后同步 dirty 标记
watch([chapterContent, editingTitle], () => {
  const cur = currentChapter.value
  dirty.value =
    chapterContent.value !== (cur.content || '') ||
    editingTitle.value !== (cur.title || '')
  if (dirty.value) {
    scheduleAutoSave()
  } else {
    clearAutoSaveTimer()
  }
})

// 自动保存：内容变化 5 秒后自动静默保存
const AUTO_SAVE_DELAY = 5000
let autoSaveTimer = null

const clearAutoSaveTimer = () => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
    autoSaveTimer = null
  }
}

const scheduleAutoSave = () => {
  clearAutoSaveTimer()
  autoSaveTimer = setTimeout(async () => {
    autoSaveTimer = null
    // 到期仍有未保存修改才执行（可能已被手动/切换保存）
    if (dirty.value && !savingContent.value) {
      const ok = await saveCurrentChapter(true)
      if (!ok) scheduleAutoSave()
    }
  }, AUTO_SAVE_DELAY)
}

// 保存当前章节（silent 为 true 时不弹提示，用于切换章节前静默保存）
const saveCurrentChapter = async (silent = false) => {
  const chapter = currentChapter.value
  if (!chapter || !chapter.id) {
    if (!silent) showToast('请先选择章节', 'error')
    return false
  }
  const title = editingTitle.value.trim()
  if (!title) {
    if (!silent) showToast('请输入章节标题', 'error')
    return false
  }
  if (savingContent.value) return false
  // 手动/切换/自动保存前，取消尚在等待的自动保存任务
  clearAutoSaveTimer()
  savingContent.value = true
  try {
    const res = await api.saveChapter({
      noteId,
      id: chapter.id,
      pid: chapter.pid || null,
      title,
      orders: chapter.orders ?? 0,
      content: chapterContent.value
    })
    if (res.success || res.code === 200 || res.code === 0) {
      chapter.title = title
      chapter.content = chapterContent.value
      dirty.value = false
      if (!silent) showToast('章节已保存')
      return true
    }
    if (!silent) showToast(res.message || res.msg || '保存失败', 'error')
    return false
  } catch (e) {
    console.error('保存章节内容失败', e)
    if (!silent) showToast('保存失败，请稍后重试', 'error')
    return false
  } finally {
    savingContent.value = false
  }
}

// 切换章节：若有未保存修改则先静默保存；index 为 -1 时切换到「序言」
const selectChapter = async (index) => {
  if (index === currentIndex.value) return
  if (index !== -1 && (index < 0 || index >= flatChapters.value.length)) return
  if (dirty.value) {
    const ok = await saveCurrentChapter(true)
    if (!ok) return
  }
  currentIndex.value = index
  loadChapterContent()
}

// 删除章节：先弹自定义确认框，确认后调用接口并从列表移除
const deleting = ref(false)
const deleteConfirmVisible = ref(false)
const deleteTargetIndex = ref(-1)

const deleteChapterTitle = computed(() => {
  const chapter = flatChapters.value[deleteTargetIndex.value]
  return chapter ? chapter.title : ''
})

// 触发删除：打开二次确认弹窗
const requestDeleteChapter = (index) => {
  const chapter = flatChapters.value[index]
  if (!chapter || !chapter.id) return
  deleteTargetIndex.value = index
  deleteConfirmVisible.value = true
}

const closeDeleteConfirm = () => {
  if (deleting.value) return
  deleteConfirmVisible.value = false
  deleteTargetIndex.value = -1
}

const confirmDeleteChapter = async () => {
  const index = deleteTargetIndex.value
  const chapter = flatChapters.value[index]
  if (!chapter || !chapter.id || deleting.value) return
  deleting.value = true
  // 记录被删章节的前一章（用于删除后定位）
  const prevChapterId = flatChapters.value[Math.max(0, index - 1)]?.id || null
  try {
    const res = await api.deleteChapter(chapter.id)
    if (res.success || res.code === 200 || res.code === 0) {
      deleteConfirmVisible.value = false
      deleteTargetIndex.value = -1
      // 重新拉取列表（后端负责父子级结构），并尽量停留在删除位置的前一章
      await loadChapters()
      if (prevChapterId) {
        const idx = flatChapters.value.findIndex((c) => c.id === prevChapterId)
        if (idx !== -1) {
          currentIndex.value = idx
          loadChapterContent()
        }
      }
      showToast('章节已删除')
    } else {
      showToast(res.message || res.msg || '删除失败', 'error')
    }
  } catch (e) {
    console.error('删除章节失败', e)
    showToast('删除失败，请稍后重试', 'error')
  } finally {
    deleting.value = false
  }
}

// 页面加载时先查询笔记详情，再按 noteId 查询章节列表
// 同时监听全局点击 / 滚动，用于关闭章节右键菜单
onMounted(() => {
  document.addEventListener('click', closeChapterMenu)
  document.addEventListener('scroll', closeChapterMenu, true)
  loadNoteInfo()
  loadChapters()
})

onUnmounted(() => {
  document.removeEventListener('click', closeChapterMenu)
  document.removeEventListener('scroll', closeChapterMenu, true)
  // 离开页面时取消待执行的自动保存，避免误存到其他章节
  clearAutoSaveTimer()
})
</script>

<style src="./common.css"></style>
<style src="./AdminChapterPage.css"></style>
