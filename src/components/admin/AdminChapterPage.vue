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
              <span class="toc-index">00</span>
              <span class="toc-name">序言</span>
              <span class="toc-dot"></span>
            </li>
            <li
              v-for="(chapter, index) in book.chapters"
              :key="chapter.id"
              class="toc-item"
              :class="{ active: currentIndex === index }"
              @click="selectChapter(index)"
              @dblclick="openEditDialog(index)"
              title="双击编辑章节"
            >
              <span class="toc-index">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="toc-name">{{ chapter.title }}</span>
              <span class="toc-dot"></span>
              <button
                class="toc-delete"
                title="删除章节"
                @click.stop="handleDeleteChapter(index)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
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
                <span class="editor-chapter-label">第 {{ currentIndex + 1 }} 章</span>
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
              </div>
            </div>
            <div class="editor-body">
              <MilkdownEditor v-model="chapterContent" />
            </div>
            <div class="editor-footer">
              <span>第 {{ currentIndex + 1 }} / {{ book.chapters.length }} 章</span>
              <span v-if="dirty" class="editor-dirty-hint">有未保存的修改</span>
            </div>
          </div>
        </transition>
      </main>
    </div>

    <!-- 新建/编辑章节弹窗 -->
    <div v-if="dialogVisible" class="modal-overlay" @click.self="closeAddDialog">
      <div class="modal">
        <h3>{{ dialogMode === 'edit' ? '编辑章节' : '新建章节' }}</h3>
        <p>{{ dialogMode === 'edit' ? '修改章节标题与排序' : '维护章节标题与排序' }}</p>
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

    <!-- 提示 -->
    <transition name="toast-fade">
      <div v-if="toast.show" class="chapter-toast" :class="toast.type">{{ toast.message }}</div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
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

// 章节弹窗（新建/编辑）
const dialogVisible = ref(false)
const dialogMode = ref('add') // 'add' | 'edit'
const editingChapterId = ref(null)
const chapterForm = ref({ title: '', orders: 0 })

const openAddDialog = () => {
  dialogMode.value = 'add'
  editingChapterId.value = null
  chapterForm.value = { title: '', orders: 0 }
  dialogVisible.value = true
}

const openEditDialog = (index) => {
  const chapter = book.value.chapters[index]
  if (!chapter) return
  dialogMode.value = 'edit'
  editingChapterId.value = chapter.id
  chapterForm.value = { title: chapter.title || '', orders: Number(chapter.orders ?? 0) }
  dialogVisible.value = true
}

const closeAddDialog = () => {
  dialogVisible.value = false
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
          title,
          orders: Number(chapterForm.value.orders) || 0,
          // 编辑时保留原内容，避免被清空
          content: (book.value.chapters.find((c) => c.id === editingChapterId.value) || {}).content || ''
        }
      : {
          noteId,
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
        const idx = book.value.chapters.findIndex((c) => c.id === targetId)
        if (idx !== -1) {
          currentIndex.value = idx
          loadChapterContent()
        }
      }
      dialogVisible.value = false
      showToast(isEdit ? '章节已更新' : '章节已创建')
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

// 书籍数据（章节结构，由接口读取）
const book = ref({
  title: '',
  author: '',
  chapters: []
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

const loadChapters = async () => {
  if (!noteId) return
  loading.value = true
  loadError.value = ''
  try {
    const res = await api.getChapterList(noteId)
    const list = res.data || []
    book.value.chapters = list
    // 默认停留在「序言」章节
    currentIndex.value = -1
    loadChapterContent()
  } catch (e) {
    console.error('查询章节列表失败', e)
    loadError.value = '章节加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 当前章节索引：-1 表示「序言」（默认），>= 0 表示 book.chapters 中的真实章节
const currentIndex = ref(-1)

const currentChapter = computed(() => book.value.chapters[currentIndex.value] || { title: '', content: '', orders: 0 })

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
})

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
  savingContent.value = true
  try {
    const res = await api.saveChapter({
      noteId,
      id: chapter.id,
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
  if (index !== -1 && (index < 0 || index >= book.value.chapters.length)) return
  if (dirty.value) {
    const ok = await saveCurrentChapter(true)
    if (!ok) return
  }
  currentIndex.value = index
  loadChapterContent()
}

// 删除章节：调用接口成功后从列表移除并调整当前章节
const deleting = ref(false)

const handleDeleteChapter = async (index) => {
  const chapter = book.value.chapters[index]
  if (!chapter || !chapter.id) return
  if (!confirm(`确定要删除章节「${chapter.title}」吗？删除后不可恢复。`)) return
  if (deleting.value) return
  deleting.value = true
  try {
    const res = await api.deleteChapter(chapter.id)
    if (res.success || res.code === 200 || res.code === 0) {
      book.value.chapters.splice(index, 1)
      if (book.value.chapters.length) {
        if (index < currentIndex.value) currentIndex.value -= 1
        loadChapterContent()
      } else {
        // 章节删除完后回到「序言」
        currentIndex.value = -1
        chapterContent.value = ''
        editingTitle.value = ''
        dirty.value = false
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
onMounted(() => {
  loadNoteInfo()
  loadChapters()
})
</script>

<style src="./common.css"></style>
<style scoped>
.chapter-page {
  min-height: 100vh;
  background: var(--admin-bg-primary);
  padding: 88px 40px 60px;
  position: relative;
}

/* ========== 顶部栏 ========== */
.chapter-topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  background: rgba(248, 249, 251, 0.88);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--admin-border-color);
  z-index: 100;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.back-btn {
  padding: 6px 16px;
  border: 1px solid var(--admin-border-color);
  border-radius: 8px;
  background: transparent;
  color: var(--admin-text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s;
}

.back-btn:hover {
  border-color: var(--admin-accent-primary);
  color: var(--admin-accent-primary);
  background: var(--admin-accent-glow);
}

.topbar-divider {
  width: 1px;
  height: 20px;
  background: var(--admin-border-color);
}

.topbar-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--admin-text-primary);
}

/* 笔记 id 徽章 */
.note-id-badge {
  padding: 6px 16px;
  background: var(--admin-accent-glow);
  border: 1px solid var(--admin-border-color);
  border-radius: 999px;
  color: var(--admin-accent-primary);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

/* ========== 阅读区布局 ========== */
.reader-container {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 28px;
}

/* ========== 左侧目录 ========== */
.toc-panel {
  width: 260px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  background: var(--admin-bg-secondary);
  border: 1px solid var(--admin-border-color);
  border-radius: 14px;
  padding: 22px 16px;
  transition: width 0.3s ease, padding 0.3s ease;
}

/* 折叠状态 */
.toc-panel.collapsed {
  width: 56px;
  padding: 16px 10px;
}

/* 折叠/展开按钮 */
.toc-toggle {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--admin-border-color);
  border-radius: 8px;
  background: transparent;
  color: var(--admin-text-muted);
  cursor: pointer;
  transition: all 0.25s;
  z-index: 2;
}

.toc-toggle:hover {
  border-color: var(--admin-accent-primary);
  color: var(--admin-accent-primary);
  background: var(--admin-accent-glow);
}

.toc-panel.collapsed .toc-toggle {
  top: 50%;
  right: auto;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 折叠状态的竖排「目录」提示 */
.toc-collapsed-hint {
  writing-mode: vertical-rl;
  letter-spacing: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--admin-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 160px;
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;
}

.toc-collapsed-hint:hover {
  color: var(--admin-accent-primary);
}

.toc-book {
  padding: 4px 8px 18px;
  border-bottom: 1px solid var(--admin-border-color);
  margin-bottom: 16px;
}

.toc-book-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--admin-text-primary);
  margin: 0;
  line-height: 1.3;
}

.toc-book-author {
  font-size: 12px;
  color: var(--admin-text-muted);
  margin: 3px 0 0;
}

.toc-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 8px;
  margin-bottom: 10px;
}

.toc-title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 3px;
  color: var(--admin-text-muted);
}

.add-chapter-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px dashed var(--admin-border-color);
  border-radius: 8px;
  background: transparent;
  color: var(--admin-text-muted);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.25s;
  white-space: nowrap;
}

.add-chapter-btn:hover {
  border-color: var(--admin-accent-primary);
  color: var(--admin-accent-primary);
  background: var(--admin-accent-glow);
}

.toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toc-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 34px 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.toc-delete {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--admin-text-muted);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, color 0.2s, background 0.2s;
}

.toc-item:hover .toc-delete {
  opacity: 1;
}

.toc-delete:hover {
  color: #e11d48;
  background: rgba(225, 29, 72, 0.12);
}

/* hover 时圆点让位于删除按钮 */
.toc-item:hover .toc-dot {
  opacity: 0;
}

.toc-item:hover {
  background: var(--admin-hover-bg);
}

.toc-item.active {
  background: var(--admin-accent-glow);
}

.toc-index {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--admin-text-muted);
  font-family: 'Consolas', monospace;
  flex-shrink: 0;
}

.toc-name {
  font-size: 14px;
  color: var(--admin-text-secondary);
  transition: color 0.2s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toc-item.active .toc-index {
  color: var(--admin-accent-primary);
}

.toc-item.active .toc-name {
  color: var(--admin-accent-primary);
  font-weight: 600;
}

.toc-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--admin-accent-primary);
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.2s;
}

.toc-item.active .toc-dot {
  opacity: 1;
}

/* ========== 右侧书本页 ========== */
.book-wrap {
  flex: 1;
  min-width: 0;
}

.book-page {
  position: relative;
  background-color: var(--admin-bg-card);
  border: 1px solid var(--admin-border-color);
  border-radius: 14px;
  min-height: 72vh;
  padding: 56px 64px 40px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 18px 44px -20px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

/* ========== 序言页 ========== */
.preface-page {
  padding: 48px 64px 40px;
  overflow-y: auto;
}

.preface-header {
  padding-bottom: 18px;
  border-bottom: 1px solid var(--admin-border-color);
  margin-bottom: 24px;
}

.preface-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--admin-accent-primary);
  text-transform: uppercase;
}

.preface-title {
  margin: 8px 0 0;
  font-size: 26px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--admin-text-primary);
}

.preface-content {
  font-size: 15px;
  line-height: 1.85;
  color: var(--admin-text-primary);
  word-break: break-word;
}

/* 序言 markdown 渲染样式 */
.preface-content h1,
.preface-content h2,
.preface-content h3,
.preface-content h4 {
  margin: 1.2em 0 0.6em;
  line-height: 1.4;
  color: var(--admin-text-primary);
}

.preface-content h1 {
  font-size: 24px;
}

.preface-content h2 {
  font-size: 20px;
}

.preface-content h3 {
  font-size: 17px;
}

.preface-content h4 {
  font-size: 15px;
}

.preface-content p {
  margin: 0.8em 0;
}

.preface-content ul,
.preface-content ol {
  margin: 0.8em 0;
  padding-left: 1.6em;
}

.preface-content blockquote {
  margin: 1em 0;
  padding: 6px 16px;
  border-left: 3px solid var(--admin-accent-primary);
  background: var(--admin-accent-glow);
  color: var(--admin-text-secondary);
  border-radius: 0 8px 8px 0;
}

.preface-content code {
  padding: 2px 6px;
  border-radius: 5px;
  background: var(--admin-bg-input);
  color: var(--admin-accent-primary);
  font-size: 13px;
  font-family: 'Consolas', 'Courier New', monospace;
}

.preface-content pre {
  margin: 1em 0;
  padding: 14px 16px;
  border-radius: 10px;
  background: var(--admin-bg-input);
  border: 1px solid var(--admin-border-color);
  overflow-x: auto;
}

.preface-content pre code {
  padding: 0;
  background: transparent;
  color: var(--admin-text-primary);
}

.preface-content img {
  max-width: 100%;
  border-radius: 10px;
}

.preface-content a {
  color: var(--admin-accent-primary);
  text-decoration: none;
}

.preface-content a:hover {
  text-decoration: underline;
}

.preface-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  font-size: 14px;
}

.preface-content th,
.preface-content td {
  padding: 8px 12px;
  border: 1px solid var(--admin-border-color);
  text-align: left;
}

.preface-content th {
  background: var(--admin-bg-secondary);
  font-weight: 600;
}

.preface-content hr {
  border: none;
  border-top: 1px solid var(--admin-border-color);
  margin: 1.6em 0;
}

.preface-empty {
  margin: 0;
  padding: 24px 0;
  text-align: center;
  color: var(--admin-text-muted);
  font-size: 14px;
}

/* ========== 章节内容编辑器 ========== */
.chapter-editor {
  padding: 0;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 14px 20px;
  border-bottom: 1px solid var(--admin-border-color);
  background: var(--admin-bg-secondary);
}

.editor-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.editor-chapter-label {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--admin-accent-primary);
  text-transform: uppercase;
}

.editor-title-input {
  flex: 1;
  min-width: 120px;
  padding: 7px 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--admin-text-primary);
  font-size: 16px;
  font-weight: 600;
  transition: all 0.25s;
}

.editor-title-input:hover {
  border-color: var(--admin-border-color);
}

.editor-title-input:focus {
  outline: none;
  border-color: var(--admin-accent-primary);
  background: var(--admin-bg-card);
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.editor-nav-btn {
  padding: 7px 16px;
  border-radius: 8px;
  border: 1px solid var(--admin-border-color);
  background: transparent;
  color: var(--admin-text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s;
}

.editor-nav-btn:hover:not(:disabled) {
  border-color: var(--admin-accent-primary);
  color: var(--admin-accent-primary);
  background: var(--admin-accent-glow);
}

.editor-nav-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.editor-save-btn {
  padding: 7px 18px;
  border-radius: 8px;
  border: 1px solid var(--admin-accent-primary);
  background: var(--admin-accent-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
}

.editor-save-btn:hover:not(:disabled) {
  filter: brightness(1.08);
}

.editor-save-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.editor-body {
  flex: 1;
  padding: 18px 20px 8px;
  min-height: 0;
}

.editor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 20px 14px;
  color: var(--admin-text-muted);
  font-size: 12px;
  letter-spacing: 1px;
  font-family: 'Consolas', monospace;
}

.editor-dirty-hint {
  color: #d97706;
  letter-spacing: 0;
}

/* 章节切换动画 */
.book-fade-enter-active,
.book-fade-leave-active {
  transition: opacity 0.28s ease, transform 0.28s ease;
}

.book-fade-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.book-fade-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}

/* ========== 响应式 ========== */
@media (max-width: 900px) {
  .reader-container {
    flex-direction: column;
  }

  .toc-panel {
    position: static;
    width: 100%;
    max-height: none;
    overflow: visible;
  }

  .toc-list {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .toc-item {
    flex: 0 0 auto;
  }

  /* 窄屏下目录强制展开，折叠样式复位 */
  .toc-panel.collapsed {
    width: 100%;
    padding: 22px 16px;
  }

  .toc-panel.collapsed .toc-toggle {
    top: 12px;
    right: 12px;
    left: auto;
    transform: none;
  }

  .toc-collapsed-hint {
    writing-mode: initial;
    letter-spacing: 0;
    min-height: 0;
  }
}

@media (max-width: 560px) {
  .chapter-page {
    padding: 84px 16px 40px;
  }

  .book-page {
    padding: 40px 28px 28px;
  }

  .book-page.chapter-editor {
    padding: 0;
  }

  .book-page.preface-page {
    padding: 40px 28px 28px;
  }

  .editor-header {
    padding: 12px 14px;
  }

  .editor-body {
    padding: 14px 14px 8px;
  }
}

/* 书本页内的加载/空状态居中 */
.book-page-state {
  align-items: center;
  justify-content: center;
}

/* 目录空提示 */
.toc-empty {
  font-size: 13px;
  color: var(--admin-text-muted);
  text-align: center;
  padding: 18px 8px;
  margin: 0;
}

/* ========== 新建章节弹窗 ========== */
.modal {
  width: 440px;
  max-width: 90vw;
  padding: 28px;
}

/* 弹窗操作按钮精修 */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.modal-actions .dialog-cancel {
  min-width: 92px;
  padding: 10px 24px;
  border-radius: 10px;
  border: 1px solid var(--admin-border-color);
  background: var(--admin-bg-input);
  color: var(--admin-text-secondary);
  font-weight: 500;
  transition: all 0.25s ease;
}

.modal-actions .dialog-cancel:hover:not(:disabled) {
  border-color: var(--admin-accent-primary);
  color: var(--admin-accent-primary);
  background: var(--admin-accent-glow);
}

.modal-actions .dialog-confirm {
  min-width: 108px;
  padding: 10px 26px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, var(--admin-accent-primary), var(--admin-accent-secondary));
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.32);
  color: #fff;
  font-weight: 600;
  letter-spacing: 1px;
  transition: all 0.25s ease;
}

.modal-actions .dialog-confirm:hover:not(:disabled) {
  filter: brightness(1.08);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(99, 102, 241, 0.4);
}

.modal-actions .dialog-confirm:active:not(:disabled) {
  transform: translateY(0);
}

.modal-actions .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* ========== 轻提示 ========== */
.chapter-toast {
  position: fixed;
  top: 76px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1200;
  padding: 10px 22px;
  border-radius: 10px;
  font-size: 14px;
  color: #fff;
  background: #10b981;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}

.chapter-toast.error {
  background: #ef4444;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}
</style>
