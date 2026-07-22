<template>
  <div class="milkdown-editor">
    <div class="editor-toolbar">
      <!-- 视图模式切换：分屏 → 纯编辑 → 纯预览 -->
      <button type="button" @click="toggleViewMode" :title="viewModeLabel" class="mode-btn">
        <svg v-if="viewMode === 'split'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
        <svg v-else-if="viewMode === 'edit'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        {{ viewModeLabel }}
      </button>
      <span class="toolbar-divider"></span>
      <button type="button" @click="insertMd('**', '**')" title="加粗" :disabled="viewMode === 'preview'"><strong>B</strong></button>
      <button type="button" @click="insertMd('*', '*')" title="斜体" :disabled="viewMode === 'preview'"><em>I</em></button>
      <button type="button" @click="insertMd('~~', '~~')" title="删除线" :disabled="viewMode === 'preview'"><s>S</s></button>
      <span class="toolbar-divider"></span>
      <button type="button" @click="insertMd('# ', '')" title="标题1" :disabled="viewMode === 'preview'">H1</button>
      <button type="button" @click="insertMd('## ', '')" title="标题2" :disabled="viewMode === 'preview'">H2</button>
      <button type="button" @click="insertMd('### ', '')" title="标题3" :disabled="viewMode === 'preview'">H3</button>
      <span class="toolbar-divider"></span>
      <button type="button" @click="insertMd('`', '`')" title="行内代码" :disabled="viewMode === 'preview'"><code>&lt;/&gt;</code></button>
      <button type="button" @click="insertCodeBlock" title="代码块" :disabled="viewMode === 'preview'">```</button>
      <span class="toolbar-divider"></span>
      <button type="button" @click="insertMd('- ', '')" title="无序列表" :disabled="viewMode === 'preview'">•</button>
      <button type="button" @click="insertMd('1. ', '')" title="有序列表" :disabled="viewMode === 'preview'">1.</button>
      <button type="button" @click="insertMd('> ', '')" title="引用" :disabled="viewMode === 'preview'">"</button>
      <span class="toolbar-divider"></span>
      <button type="button" @click="insertMd('[', '](url)')" title="链接" :disabled="viewMode === 'preview'">[L]</button>
      <button type="button" @click="insertMd('![alt](', ')')" title="图片" :disabled="viewMode === 'preview'">[I]</button>
      <button type="button" @click="insertMd('\n---\n', '')" title="分割线" :disabled="viewMode === 'preview'">—</button>
      <span class="toolbar-divider"></span>
      <button type="button" @click="insertMd('\n- [ ] ', '')" title="任务列表" :disabled="viewMode === 'preview'">☐</button>
    </div>
    <!-- 分屏模式：Markdown 源码 + 实时预览 -->
    <div v-if="viewMode === 'split'" class="split-pane">
      <textarea
        ref="textareaRef"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        @scroll="syncPreviewScroll"
        class="md-textarea split-textarea"
        placeholder="输入文章内容，支持 Markdown 格式..."
        @keydown="handleKeydown"
        @paste="handlePaste"
      ></textarea>
      <div ref="previewRef" class="md-preview split-preview" v-html="renderedHtml"></div>
    </div>
    <!-- 纯编辑模式 -->
    <textarea
      v-else-if="viewMode === 'edit'"
      ref="textareaRef"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="md-textarea"
      placeholder="输入文章内容，支持 Markdown 格式..."
      @keydown="handleKeydown"
      @paste="handlePaste"
    ></textarea>
    <!-- 纯预览模式 -->
    <div v-else class="md-preview" v-html="renderedHtml"></div>
    <div class="editor-hint">
      支持 Markdown 语法 | Ctrl+B 加粗 | Ctrl+I 斜体 | Ctrl+K 链接 | 粘贴图片自动上传
      <span v-if="uploading" class="uploading-indicator">⏳ 图片上传中...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'
import { api } from '../../api/article.js'

// 配置 marked：GFM、换行、图片与链接自定义渲染
marked.use({
  gfm: true,
  breaks: true,
  renderer: {
    image(token) {
      const href = token.href || ''
      const text = token.text || ''
      const title = token.title || ''
      return `<img src="${href}" alt="${text}" title="${title}" loading="lazy" />`
    },
    link(token) {
      const href = token.href || ''
      const text = token.text || ''
      const title = token.title || ''
      return `<a href="${href}" title="${title}" target="_blank" rel="noopener noreferrer">${text}</a>`
    }
  }
})

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])

const textareaRef = ref(null)
const previewRef = ref(null)
const uploading = ref(false)

// 视图模式：split（分屏实时预览）| edit（纯编辑）| preview（纯预览）
const viewMode = ref('split')
const viewModes = ['split', 'edit', 'preview']
const viewModeLabels = { split: '分屏', edit: '编辑', preview: '预览' }

const viewModeLabel = computed(() => viewModeLabels[viewMode.value])

const toggleViewMode = () => {
  const idx = viewModes.indexOf(viewMode.value)
  viewMode.value = viewModes[(idx + 1) % viewModes.length]
}

const renderedHtml = computed(() => {
  if (!props.modelValue) return '<p style="color: #666;">暂无内容</p>'
  return marked.parse(props.modelValue)
})

// 分屏时同步源编辑区与预览区的滚动比例
const syncPreviewScroll = () => {
  if (viewMode.value !== 'split') return
  const textarea = textareaRef.value
  const preview = previewRef.value
  if (!textarea || !preview) return

  const ratio = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight)
  if (isNaN(ratio)) return
  preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight)
}

// 插入 Markdown 语法
const insertMd = (before, after) => {
  const textarea = textareaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = props.modelValue
  const selectedText = text.substring(start, end)

  const newText = text.substring(0, start) + before + selectedText + after + text.substring(end)
  const newCursorPos = selectedText ? start + before.length + selectedText.length + after.length : start + before.length

  textarea.value = newText
  textarea.dispatchEvent(new Event('input', { bubbles: true }))
  
  // 设置光标位置
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(newCursorPos, newCursorPos)
  }, 0)
}

// 插入代码块
const insertCodeBlock = () => {
  const textarea = textareaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = props.modelValue
  const selectedText = text.substring(start, end)

  const codeBlock = `\n\`\`\`javascript\n${selectedText || '// your code here'}\n\`\`\`\n`
  const newText = text.substring(0, start) + codeBlock + text.substring(end)

  textarea.value = newText
  textarea.dispatchEvent(new Event('input', { bubbles: true }))
  
  setTimeout(() => {
    textarea.focus()
    const newPos = start + 15
    textarea.setSelectionRange(newPos, newPos)
  }, 0)
}

// 快捷键处理
const handleKeydown = (e) => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'b') {
      e.preventDefault()
      insertMd('**', '**')
    } else if (e.key === 'i') {
      e.preventDefault()
      insertMd('*', '*')
    } else if (e.key === 'k') {
      e.preventDefault()
      insertMd('[', '](url)')
    }
  }
}

// 粘贴图片处理
const handlePaste = async (e) => {
  const items = e.clipboardData?.items
  if (!items) return

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault()
      const file = item.getAsFile()
      if (!file) continue

      const textarea = textareaRef.value
      if (!textarea) return

      const start = textarea.selectionStart
      const text = props.modelValue
      const placeholder = `![上传中...]()`
      const newText = text.substring(0, start) + placeholder + text.substring(start)

      textarea.value = newText
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
      uploading.value = true

      try {
        const res = await api.uploadImage(file)
        if (res.success && res.data) {
          const url = res.data.url || res.data.filePath || ''
          const alt = file.name || 'image'
          const mdImage = `![${alt}](${url})`
          // 替换占位符
          const replacedText = newText.replace(placeholder, mdImage)
          textarea.value = replacedText
          textarea.dispatchEvent(new Event('input', { bubbles: true }))
          const cursorPos = start + mdImage.length
          setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(cursorPos, cursorPos)
          }, 0)
        } else {
          // 上传失败，移除占位符
          const clearedText = newText.replace(placeholder, '')
          textarea.value = clearedText
          textarea.dispatchEvent(new Event('input', { bubbles: true }))
          alert(res.message || '图片上传失败')
        }
      } catch (err) {
        // 上传异常，移除占位符
        const clearedText = newText.replace(placeholder, '')
        textarea.value = clearedText
        textarea.dispatchEvent(new Event('input', { bubbles: true }))
        console.error('图片上传异常:', err)
        alert('图片上传失败，请检查网络')
      } finally {
        uploading.value = false
      }
      break
    }
  }
}
</script>

<style src="./MilkdownEditor.css"></style>
