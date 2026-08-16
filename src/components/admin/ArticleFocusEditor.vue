<template>
  <div class="focus-editor">
    <header class="focus-toolbar">
      <div class="focus-toolbar-left">
        <button class="focus-btn" @click="exitFocus" title="退出专注模式（Esc）">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          退出
        </button>
        <span class="focus-title">{{ articleTitle || '专注编辑' }}</span>
      </div>
      <div class="focus-toolbar-right">
        <span class="focus-save-state" :class="{ saved: savedFlash, error: saveError }">
          {{ saveStateText }}
        </span>
        <button class="focus-btn focus-save" @click="save" :disabled="saving || loading">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          {{ saving ? '保存中...' : '保存' }}
        </button>
      </div>
    </header>

    <main class="focus-main">
      <div v-if="loading" class="focus-state">
        <span class="focus-spinner"></span>
        <p>正在加载文章内容...</p>
      </div>
      <div v-else-if="loadError" class="focus-state">
        <p>{{ loadError }}</p>
        <button class="focus-btn focus-save" @click="exitFocus">关闭窗口</button>
      </div>
      <MilkdownEditor v-else v-model="content" />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../../api/article'
import MilkdownEditor from './MilkdownEditor.vue'

const route = useRoute()

// 状态
const articleId = ref(route.query.id || '')
const articleTitle = ref('')
const content = ref('')
const articleData = ref(null)
const loading = ref(true)
const loadError = ref('')
const saving = ref(false)
const savedFlash = ref(false)
const saveError = ref('')

const saveStateText = computed(() => {
  if (saving.value) return '保存中...'
  if (saveError.value) return '自动保存失败'
  if (savedFlash.value) return '已保存'
  return ''
})

// 自动保存：内容变化后防抖 10 秒保存一次
let autoSaveTimer = null
const AUTO_SAVE_DELAY = 10000

watch(content, () => {
  if (!articleData.value || loading.value) return
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(() => save(true), AUTO_SAVE_DELAY)
})

// 加载文章
const loadArticle = async () => {
  if (!articleId.value) {
    loadError.value = '缺少文章 ID，无法加载'
    loading.value = false
    return
  }
  try {
    const res = await api.getArticleById(articleId.value)
    if (res.success && res.data) {
      articleData.value = res.data
      articleTitle.value = res.data.title || ''
      content.value = res.data.content || ''
      document.title = `${articleTitle.value || '专注编辑'} - 专注模式`
    } else {
      loadError.value = res.message || '文章加载失败'
    }
  } catch (error) {
    console.error('专注模式加载文章失败:', error)
    loadError.value = '文章加载失败'
  } finally {
    loading.value = false
  }
}

// 保存文章，成功后通知原窗口同步内容；silent=true 为自动保存（失败不弹窗，仅显示状态）
const save = async (silent = false) => {
  if (saving.value || !articleData.value) return
  saving.value = true
  saveError.value = ''
  try {
    const d = articleData.value
    const articleDataToSave = {
      id: d.id,
      title: d.title,
      desc: d.desc,
      content: content.value,
      author: d.author,
      tagValue: d.tagValue,
      tagText: d.tagText,
      gradient: d.gradient,
      status: d.status,
      readTime: d.readTime,
      files: d.files || ''
    }
    const res = await api.updateArticle(articleDataToSave)
    if (res.success) {
      savedFlash.value = true
      setTimeout(() => { savedFlash.value = false }, 2000)
      // 通知原编辑器窗口同步内容
      if (window.opener) {
        window.opener.postMessage(
          { type: 'FOCUS_SAVED', content: content.value },
          window.location.origin
        )
      }
    } else {
      const msg = res.message || '保存失败'
      if (silent) {
        saveError.value = msg
        console.error('专注模式自动保存失败:', msg)
      } else {
        alert(msg)
      }
    }
  } catch (error) {
    console.error('专注模式保存失败:', error)
    if (silent) {
      saveError.value = '自动保存失败，请手动保存'
    } else {
      alert('保存失败，请检查网络后重试')
    }
  } finally {
    saving.value = false
  }
}

// 退出专注模式
const exitFocus = () => {
  if (window.opener) {
    window.close()
  } else if (window.history.length > 1) {
    window.history.back()
  } else {
    window.location.href = '/admin/drafts'
  }
}

// 快捷键：Ctrl+S 保存 / Esc 退出
const handleKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    save()
  } else if (e.key === 'Escape') {
    exitFocus()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  loadArticle()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
})
</script>

<style src="./ArticleFocusEditor.css"></style>
