<template>
  <div class="milkdown-editor">
    <div class="editor-toolbar">
      <button type="button" @click="preview = !preview" :class="{ active: preview }" title="预览">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        {{ preview ? '编辑' : '预览' }}
      </button>
      <span class="toolbar-divider"></span>
      <button type="button" @click="insertMd('**', '**')" title="加粗" :disabled="preview"><strong>B</strong></button>
      <button type="button" @click="insertMd('*', '*')" title="斜体" :disabled="preview"><em>I</em></button>
      <button type="button" @click="insertMd('~~', '~~')" title="删除线" :disabled="preview"><s>S</s></button>
      <span class="toolbar-divider"></span>
      <button type="button" @click="insertMd('# ', '')" title="标题1" :disabled="preview">H1</button>
      <button type="button" @click="insertMd('## ', '')" title="标题2" :disabled="preview">H2</button>
      <button type="button" @click="insertMd('### ', '')" title="标题3" :disabled="preview">H3</button>
      <span class="toolbar-divider"></span>
      <button type="button" @click="insertMd('`', '`')" title="行内代码" :disabled="preview"><code>&lt;/&gt;</code></button>
      <button type="button" @click="insertCodeBlock" title="代码块" :disabled="preview">```</button>
      <span class="toolbar-divider"></span>
      <button type="button" @click="insertMd('- ', '')" title="无序列表" :disabled="preview">•</button>
      <button type="button" @click="insertMd('1. ', '')" title="有序列表" :disabled="preview">1.</button>
      <button type="button" @click="insertMd('> ', '')" title="引用" :disabled="preview">"</button>
      <span class="toolbar-divider"></span>
      <button type="button" @click="insertMd('[', '](url)')" title="链接" :disabled="preview">[L]</button>
      <button type="button" @click="insertMd('![alt](', ')')" title="图片" :disabled="preview">[I]</button>
      <button type="button" @click="insertMd('\n---\n', '')" title="分割线" :disabled="preview">—</button>
      <span class="toolbar-divider"></span>
      <button type="button" @click="insertMd('\n- [ ] ', '')" title="任务列表" :disabled="preview">☐</button>
    </div>
    <textarea
      v-if="!preview"
      ref="textareaRef"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="md-textarea"
      placeholder="输入文章内容，支持 Markdown 格式..."
      @keydown="handleKeydown"
    ></textarea>
    <div v-else class="md-preview" v-html="renderedHtml"></div>
    <div class="editor-hint">支持 Markdown 语法 | Ctrl+B 加粗 | Ctrl+I 斜体 | Ctrl+K 链接</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])

const textareaRef = ref(null)
const preview = ref(false)

const renderedHtml = computed(() => {
  if (!props.modelValue) return '<p style="color: #666;">暂无内容</p>'
  return marked.parse(props.modelValue)
})

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
</script>

<style scoped>
.milkdown-editor {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid var(--border-color);
}

.editor-toolbar button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 28px;
  padding: 0 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #b0b0b0;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.editor-toolbar button:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.2);
}

.editor-toolbar button:active {
  background: rgba(255, 255, 255, 0.15);
}

.editor-toolbar button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.editor-toolbar button code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  margin: 4px 4px;
}

.md-textarea {
  width: 100%;
  min-height: 400px;
  padding: 16px;
  background: transparent;
  border: none;
  color: #e6e6e6;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.7;
  resize: vertical;
  tab-size: 2;
}

.md-textarea:focus {
  outline: none;
}

.md-textarea::placeholder {
  color: #666;
}

/* 预览模式 */
.md-preview {
  min-height: 400px;
  padding: 24px;
  color: #e6e6e6;
  font-size: 14px;
  line-height: 1.8;
  overflow-y: auto;
}

.md-preview :deep(h1) { font-size: 1.8rem; margin: 24px 0 16px; color: #fff; }
.md-preview :deep(h2) { font-size: 1.5rem; margin: 20px 0 12px; color: #fff; }
.md-preview :deep(h3) { font-size: 1.25rem; margin: 16px 0 10px; color: #fff; }
.md-preview :deep(p) { margin-bottom: 16px; }
.md-preview :deep(code) { 
  background: rgba(255,255,255,0.1); 
  padding: 2px 6px; 
  border-radius: 4px; 
  font-family: 'JetBrains Mono', monospace; 
  font-size: 13px; 
}
.md-preview :deep(pre) { 
  background: rgba(0,0,0,0.3); 
  padding: 16px; 
  border-radius: 8px; 
  overflow-x: auto; 
  margin-bottom: 16px;
}
.md-preview :deep(pre code) { 
  background: transparent; 
  padding: 0; 
}
.md-preview :deep(blockquote) { 
  border-left: 3px solid var(--accent-primary, #22c55e); 
  padding-left: 16px; 
  color: #999; 
  margin: 16px 0; 
}
.md-preview :deep(ul), .md-preview :deep(ol) { 
  padding-left: 24px; 
  margin-bottom: 16px; 
}
.md-preview :deep(li) { 
  margin-bottom: 8px; 
}
.md-preview :deep(img) { 
  max-width: 100%; 
  border-radius: 8px; 
}
.md-preview :deep(a) { 
  color: var(--accent-primary, #22c55e); 
}
.md-preview :deep(table) { 
  border-collapse: collapse; 
  width: 100%; 
  margin-bottom: 16px; 
}
.md-preview :deep(th), .md-preview :deep(td) { 
  border: 1px solid rgba(255,255,255,0.15); 
  padding: 8px 12px; 
  text-align: left; 
}
.md-preview :deep(th) { 
  background: rgba(255,255,255,0.05); 
}

.editor-toolbar button.active {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
}

.editor-hint {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid var(--border-color);
  color: #666;
  font-size: 12px;
}
</style>
