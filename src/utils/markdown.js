import { marked } from 'marked'
import hljs from 'highlight.js'

// 站点统一的 Markdown 渲染配置（与笔记阅读器 NoteReader、摇一摇 RandomStudy 一致）
const renderer = new marked.Renderer()

renderer.heading = function ({ text, depth }) {
  const id = text.toLowerCase().replace(/[^\w一-龥]+/g, '-')
  return `<h${depth} id="${id}">${text}</h${depth}>`
}

renderer.code = function ({ text, lang }) {
  const language = lang || 'text'
  const langLabel = language === 'text' ? '代码' : language.toUpperCase()
  let highlightedCode
  try {
    if (language && language !== 'text' && hljs.getLanguage(language)) {
      highlightedCode = hljs.highlight(text, { language }).value
    } else {
      highlightedCode = hljs.highlightAuto(text).value
    }
  } catch (e) {
    highlightedCode = text
  }
  return `
    <div class="code-block">
      <div class="code-header">
        <span class="code-lang">${langLabel}</span>
      </div>
      <div class="code-body">
        <pre><code class="language-${language} hljs">${highlightedCode}</code></pre>
      </div>
    </div>
  `
}

// ==内容== 高亮语法（Obsidian 风格）：非标准 Markdown，注册行内扩展转成 mark 标签
const highlightMark = {
  name: 'highlightMark',
  level: 'inline',
  start(src) { return src.indexOf('==') },
  tokenizer(src) {
    const match = /^==(?=\S)([\s\S]*?\S)==/.exec(src)
    if (match) {
      return {
        type: 'highlightMark',
        raw: match[0],
        tokens: this.lexer.inlineTokens(match[1])
      }
    }
  },
  renderer(token) {
    return `<mark class="hl-mark">${this.parser.parseInline(token.tokens)}</mark>`
  }
}
marked.use({ extensions: [highlightMark] })

export const renderMarkdown = (text) => (text ? marked.parse(text, { renderer }) : '')
