<template>
  <div class="mind-map" :class="{ bare: bare }">
    <!-- 顶栏：标题 + 工具栏（bare 模式下隐藏） -->
    <header v-if="!bare" class="mm-header">
      <div class="mm-brand">
        <div class="mm-logo"></div>
        <div class="mm-brand-text">
          <h1>{{ rootTitle }}</h1>
          <p>从左至右树形思维导图</p>
        </div>
      </div>
      <div class="mm-toolbar">
        <button type="button" class="mm-btn" @click="setAllCollapsed(false)">展开全部</button>
        <button type="button" class="mm-btn" @click="setAllCollapsed(true)">折叠全部</button>
        <button type="button" class="mm-btn" @click="fitView">适应视图</button>
        <span class="mm-zoom-label">{{ zoomLabel }}</span>
        <button type="button" class="mm-btn mm-btn-primary" @click="resetView">重置</button>
      </div>
    </header>

    <p v-if="loading" class="mm-tip">数据加载中…</p>
    <p v-else-if="loadError" class="mm-tip">{{ loadError }}</p>

    <!-- 画布区域：滚轮缩放 / 拖拽平移 / 点击节点折叠展开 -->
    <div
      v-else
      ref="viewportRef"
      class="mm-viewport"
      :class="{ dragging: dragging }"
      :style="bare ? { height: Math.max(layout.height + 80, 320) + 'px' } : undefined"
    >
      <div class="mm-stage" :style="stageStyle">
        <svg
          class="mm-links"
          xmlns="http://www.w3.org/2000/svg"
          :width="layout.width"
          :height="layout.height"
        >
          <path
            v-for="link in links"
            :key="link.id"
            :d="link.d"
            :stroke="link.color"
            :stroke-width="link.width"
            :stroke-opacity="link.opacity"
            fill="none"
            stroke-linecap="round"
          />
        </svg>
        <div class="mm-nodes">
          <div
            v-for="item in visibleNodes"
            :key="item.node.id"
            class="mm-node"
            :class="[item.kind, { collapsed: item.node.collapsed && item.node.children.length }]"
            :style="{
              left: item.x + 'px',
              top: item.y + 'px',
              width: item.w + 'px',
              height: item.h + 'px',
              background: item.background
            }"
            :title="item.node.children.length ? (item.node.collapsed ? '点击展开：' : '点击折叠：') + item.node.title : ''"
            @click.stop="toggleNode(item.node)"
          >
            <span v-if="item.kind === 'root'" class="mm-dot"></span>
            <span class="mm-label">{{ item.lines.join('\n') }}</span>
            <span v-if="item.kind === 'branch'" class="mm-count">{{ item.node.children.length }}</span>
            <span v-if="item.kind === 'leaf'" class="mm-bar" :style="{ background: item.color }"></span>
          </div>
        </div>
      </div>
      <div v-if="!bare" class="mm-hint">滚轮缩放 · 拖拽平移 · 点击分支节点折叠 / 展开</div>
      <div v-if="!bare" class="mm-stat">{{ statText }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import api from '../api/article.js'

// bare 模式：只渲染中间的思维图画布（无顶栏工具栏、无背景、无角落提示），
// 高度铺满父容器，用于嵌入页面（如知识库页面）
const props = defineProps({
  bare: { type: Boolean, default: false }
})
const bare = computed(() => props.bare)

// 【假数据开关】true=使用内置假数据预览；false=走真实接口 /index/mindmap/queryMindMap
const USE_MOCK_MINDMAP = false
const MOCK_MINDMAP_DATA = {
  title: '前端开发知识地图',
  children: [
    { title: 'HTML 基础', children: ['语义化标签', '表单与校验', '多媒体与嵌入', 'SEO 优化', '无障碍访问'] },
    { title: 'CSS 样式', children: ['盒模型与布局', 'Flex 弹性布局', 'Grid 网格布局', '响应式与媒体查询', '动画与过渡', '预处理器 Sass / Less', 'Tailwind 原子化'] },
    { title: 'JavaScript', children: ['基础语法与 ES6+', 'DOM 与 BOM', '异步 Promise / async', '事件循环 Event Loop', '模块化 ESM / CJS', '原型与作用域'] },
    { title: 'TypeScript', children: ['基础类型系统', '接口与泛型', '类型推断与守卫', '声明文件 d.ts'] },
    { title: '框架与库', children: ['Vue 3 组合式 API', 'React Hooks', '状态管理 Pinia / Redux', '路由 Vue Router', 'UI 组件库 Element / Antd'] },
    { title: '工程化', children: ['构建工具 Vite / Webpack', '包管理 npm / pnpm', '代码规范 ESLint / Prettier', 'Git 与协作流程', 'CI / CD 自动化', 'Monorepo 架构'] },
    { title: '性能优化', children: ['首屏与加载优化', '渲染与重排重绘', '资源懒加载', '缓存策略', '打包体积与 Tree Shaking', '监控与性能分析'] },
    { title: '网络与安全', children: ['HTTP / HTTPS 协议', '跨域 CORS', '浏览器缓存', 'XSS 与 CSRF 防护'] },
    { title: '调试与测试', children: ['浏览器 DevTools', '单元测试 Vitest / Jest', '组件测试', 'E2E 测试 Playwright'] },
    { title: '部署与运维', children: ['静态站点托管', 'CDN 加速', '域名与 HTTPS 配置', '日志与错误追踪'] }
  ]
}

/* ---------------- 布局常量（与原 HTML 一致） ---------------- */
const COLORS = ['#f76707', '#1c7ed6', '#f59f00', '#2f9e44', '#7048e8', '#0ca678', '#e64980', '#1098ad', '#9c36b5', '#495057']
const GAP_X = 68, GAP_Y = 12
const LGAP_X = 62, LGAP_Y = 10
const MIN_H = { root: 62, branch: 46, leaf: 34 }
const MIN_W = { root: 220, branch: 160, leaf: 130 }
const MAX_TEXT = { root: 200, branch: 130, leaf: 150 }
const LINE_H = { root: 26, branch: 21, leaf: 20 }
const V_PAD = 16
const PAD = { root: 48, branch: 84, leaf: 42 }
const FONT = {
  root: '700 18px "Microsoft YaHei", "PingFang SC", sans-serif',
  branch: '700 14px "Microsoft YaHei", "PingFang SC", sans-serif',
  leaf: '13px "Microsoft YaHei", "PingFang SC", sans-serif'
}

/* ---------------- 文本测量与换行 ---------------- */
const mctx = document.createElement('canvas').getContext('2d')

const kindOf = (depth) => (depth === 0 ? 'root' : depth === 1 ? 'branch' : 'leaf')

function textWidth(text, key) {
  mctx.font = FONT[key]
  return mctx.measureText(text).width
}

// 分词：连续 ASCII 词保持完整，CJK 每个字符独立成词
function tokenize(text) {
  const tokens = []
  const re = /[A-Za-z0-9+#./'’_-]+|\s+|[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]|[^\s]/g
  let m
  while ((m = re.exec(text)) !== null) tokens.push(m[0])
  return tokens
}

// 按最大宽度折行，返回 { lines, width }
function wrapText(text, key, maxWidth) {
  mctx.font = FONT[key]
  const tokens = tokenize(text)
  const lines = []
  let cur = ''
  const push = () => { if (cur) { lines.push(cur); cur = '' } }
  for (const t of tokens) {
    if (/^\s+$/.test(t)) { cur += ' '; continue }
    if (!cur) { cur = t; continue }
    if (textWidth(cur + t, key) <= maxWidth) { cur += t } else {
      if (textWidth(t, key) > maxWidth) {
        push()
        let chunk = ''
        for (const ch of t) {
          if (chunk && textWidth(chunk + ch, key) > maxWidth) { lines.push(chunk); chunk = ch } else chunk += ch
        }
        cur = chunk
      } else {
        push()
        cur = t
      }
    }
  }
  push()
  if (!lines.length) lines.push(text)
  const width = Math.max(...lines.map((l) => textWidth(l, key)))
  return { lines, width }
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amt))
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt))
  const b = Math.max(0, Math.min(255, (n & 255) + amt))
  return `rgb(${r},${g},${b})`
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

/* ---------------- 数据加载 ---------------- */
const loading = ref(true)
const loadError = ref('')
const root = ref(null) // 树根（纯对象，collapsed 变化后通过 layoutTick 触发重排）
const layoutTick = ref(0)

let uid = 0
const buildTree = (data) => {
  const rootNode = {
    id: 'n' + (++uid),
    title: data.title,
    depth: 0,
    color: '#1f2d5a',
    children: [],
    collapsed: false
  }
  const walk = (list, parent, depth) => {
    (list || []).forEach((item) => {
      // 一级分支按顺序取色，深层继承父级颜色
      const color = depth === 1 ? COLORS[parent.children.length % COLORS.length] : parent.color
      const node = {
        id: 'n' + (++uid),
        title: typeof item === 'string' ? item : item.title,
        depth,
        color,
        children: [],
        collapsed: false
      }
      parent.children.push(node)
      if (typeof item !== 'string' && item.children) walk(item.children, node, depth + 1)
    })
  }
  walk(data.children, rootNode, 1)
  return rootNode
}

const loadMindMap = async () => {
  loading.value = true
  loadError.value = ''
  let data = null
  try {
    if (USE_MOCK_MINDMAP) {
      data = MOCK_MINDMAP_DATA
    } else {
      const res = await api.queryMindMap()
      const ok = !!(res && (res.success === true || res.code === 200 || res.code === 0))
      // queryThinkingData 返回 data 为根节点数组（通常一个根），取第一个作为根节点
      // 节点结构 { id, pid, title, children }，buildTree 只用 title / children，其余字段忽略
      let raw = ok ? res.data : null
      if (Array.isArray(raw)) raw = raw[0]
      data = raw
    }
  } catch (e) {
    console.warn('思维导图数据加载失败', e)
  }
  loading.value = false
  if (!data || !data.title) {
    loadError.value = '思维导图数据加载失败'
    return
  }
  uid = 0
  root.value = buildTree(data)
  await nextTick()
  bindEvents()
  fitView()
}

/* ---------------- 布局（computed 内只读树、写本地 Map，避免副作用） ---------------- */
const layout = computed(() => {
  layoutTick.value // 注册依赖：折叠/展开后重新计算
  const map = new Map()
  if (!root.value) return { map, width: 0, height: 0 }

  // 1. 测量：每个节点尺寸 + 每层最大宽度（整棵树都参与，与折叠状态无关，保证列位置稳定）
  const maxW = []
  ;(function measure(n) {
    const key = kindOf(n.depth)
    const wrapped = wrapText(n.title, key, MAX_TEXT[key])
    const w = Math.max(MIN_W[key], Math.ceil(wrapped.width) + PAD[key])
    const h = Math.max(MIN_H[key], wrapped.lines.length * LINE_H[key] + V_PAD)
    map.set(n.id, { lines: wrapped.lines, w, h })
    maxW[n.depth] = Math.max(maxW[n.depth] || 0, w)
    n.children.forEach(measure)
  })(root.value)

  // 2. 定列：每层的 x 坐标
  const xAt = []
  let acc = 0
  maxW.forEach((w, d) => { xAt[d] = acc; acc += w + (d === 1 ? LGAP_X : GAP_X) })

  // 3. 定位：叶子按游标纵向排布，父节点居中于可见子节点
  let cursor = 0
  ;(function place(n) {
    const g = map.get(n.id)
    g.x = xAt[n.depth]
    const kids = (!n.collapsed && n.children.length) ? n.children : []
    if (!kids.length) {
      g.y = cursor
      cursor += g.h + (n.depth === 2 ? LGAP_Y : GAP_Y)
    } else {
      kids.forEach(place)
      const first = map.get(kids[0].id)
      const last = map.get(kids[kids.length - 1].id)
      g.y = ((first.y + first.h / 2) + (last.y + last.h / 2)) / 2 - g.h / 2
    }
  })(root.value)

  return { map, width: Math.max(acc - GAP_X, 0), height: Math.max(cursor - GAP_Y, 0) }
})

/* ---------------- 可见节点与连线 ---------------- */
const visibleNodes = computed(() => {
  const L = layout.value
  const out = []
  if (!root.value) return out
  ;(function draw(n) {
    const g = L.map.get(n.id)
    const kind = kindOf(n.depth)
    out.push({
      node: n,
      x: g.x, y: g.y, w: g.w, h: g.h,
      lines: g.lines,
      kind,
      color: n.color,
      background:
        kind === 'root'
          ? 'linear-gradient(135deg, #3556c9, #1f2d5a)'
          : kind === 'branch'
            ? `linear-gradient(135deg, ${shade(n.color, 12)}, ${shade(n.color, -18)})`
            : '#fff'
    })
    if (!n.collapsed) n.children.forEach(draw)
  })(root.value)
  return out
})

const links = computed(() => {
  const L = layout.value
  const paths = []
  if (!root.value) return paths
  ;(function walk(n) {
    if (n.collapsed || !n.children.length) return
    n.children.forEach((c) => {
      const g = L.map.get(n.id)
      const cg = L.map.get(c.id)
      const sx = g.x + g.w, sy = g.y + g.h / 2
      const ex = cg.x, ey = cg.y + cg.h / 2
      const d = ex - sx
      paths.push({
        id: c.id,
        d: `M ${sx} ${sy} C ${sx + d * 0.5} ${sy}, ${ex - d * 0.5} ${ey}, ${ex} ${ey}`,
        color: c.color,
        width: c.depth === 1 ? 2.6 : 1.7,
        opacity: c.depth === 1 ? 0.85 : 0.5
      })
      walk(c)
    })
  })(root.value)
  return paths
})

const statText = computed(() => {
  let total = 0, shown = 0
  ;(function walk(n, visible) {
    total++
    if (visible) shown++
    n.children.forEach((c) => walk(c, visible && !n.collapsed))
  })(root.value || { children: [] }, true)
  return `共 ${total} 个节点 · 当前显示 ${shown} 个`
})

const rootTitle = computed(() => (root.value ? root.value.title : '思维导图'))

/* ---------------- 节点交互 ---------------- */
const toggleNode = (node) => {
  if (!node || !node.children.length) return
  node.collapsed = !node.collapsed
  layoutTick.value++
}

const eachNode = (n, fn) => {
  fn(n)
  n.children.forEach((c) => eachNode(c, fn))
}

const setAllCollapsed = (v) => {
  if (!root.value) return
  eachNode(root.value, (n) => {
    if (n.depth > 0 && n.children.length) n.collapsed = v
  })
  layoutTick.value++
  nextTick(fitView)
}

const resetView = () => setAllCollapsed(false)

/* ---------------- 视图变换：缩放 + 平移 ---------------- */
const viewportRef = ref(null)
const dragging = ref(false)
const view = reactive({ scale: 1, tx: 0, ty: 0 })
let drag = null
let eventsBound = false

const stageStyle = computed(() => ({
  width: layout.value.width + 'px',
  height: layout.value.height + 'px',
  transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`
}))

const zoomLabel = computed(() => Math.round(view.scale * 100) + '%')

function fitView() {
  const vp = viewportRef.value
  if (!vp || !layout.value.width) return
  const pad = 70
  const s = clamp(Math.min(
    (vp.clientWidth - pad * 2) / layout.value.width,
    (vp.clientHeight - pad * 2) / layout.value.height,
    1
  ), 0.35, 1)
  view.scale = s
  view.tx = (vp.clientWidth - layout.value.width * s) / 2
  view.ty = (vp.clientHeight - layout.value.height * s) / 2
}

const onWheel = (e) => {
  e.preventDefault()
  const vp = viewportRef.value
  if (!vp) return
  const r = vp.getBoundingClientRect()
  const mx = e.clientX - r.left, my = e.clientY - r.top
  const old = view.scale
  const next = clamp(old * (e.deltaY < 0 ? 1.1 : 1 / 1.1), 0.2, 2.6)
  // 以鼠标位置为中心缩放
  view.tx = mx - (mx - view.tx) * (next / old)
  view.ty = my - (my - view.ty) * (next / old)
  view.scale = next
}

const onStageMousedown = (e) => {
  if (e.target.closest('.mm-node')) return
  drag = { x: e.clientX - view.tx, y: e.clientY - view.ty }
  dragging.value = true
}

const onWindowMousemove = (e) => {
  if (!drag) return
  view.tx = e.clientX - drag.x
  view.ty = e.clientY - drag.y
}

const onWindowMouseup = () => {
  drag = null
  dragging.value = false
}

const bindEvents = () => {
  const vp = viewportRef.value
  if (!vp || eventsBound) return
  eventsBound = true
  vp.addEventListener('wheel', onWheel, { passive: false })
  vp.addEventListener('mousedown', onStageMousedown)
  window.addEventListener('mousemove', onWindowMousemove)
  window.addEventListener('mouseup', onWindowMouseup)
}

const unbindEvents = () => {
  const vp = viewportRef.value
  if (vp && eventsBound) {
    vp.removeEventListener('wheel', onWheel)
    vp.removeEventListener('mousedown', onStageMousedown)
  }
  window.removeEventListener('mousemove', onWindowMousemove)
  window.removeEventListener('mouseup', onWindowMouseup)
  eventsBound = false
}

onMounted(() => {
  loadMindMap()
})

onUnmounted(() => {
  unbindEvents()
})
</script>

<style scoped>
.mind-map {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: "Microsoft YaHei", "PingFang SC", "Segoe UI", Roboto, sans-serif;
  color: #263445;
  background: #f4f7fb;
}

/* bare 模式：透明背景、高度由内容（画布）撑开，不截断任何节点 */
.mind-map.bare {
  height: auto;
  min-height: 0;
  background: transparent;
}

.mind-map.bare .mm-viewport {
  flex: none;
  background: transparent;
  min-height: 0;
}

/* ---------- 顶栏 ---------- */
.mm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 14px 26px;
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 2px 10px rgba(31, 45, 90, 0.04);
  z-index: 10;
}

.mm-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.mm-logo {
  width: 42px;
  height: 42px;
  flex: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #5b7cfa, #1f2d5a);
  box-shadow: 0 6px 14px rgba(31, 45, 90, 0.22);
  display: grid;
  place-items: center;
}

.mm-logo::after {
  content: "";
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 3px solid #fff;
  border-right-color: transparent;
  transform: rotate(-25deg);
}

.mm-brand-text h1 {
  font-size: 19px;
  margin: 0 0 3px;
  letter-spacing: 0.5px;
}

.mm-brand-text p {
  margin: 0;
  font-size: 12px;
  color: #7a8aa0;
}

.mm-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.mm-btn {
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #40516a;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.18s ease;
  font-family: inherit;
  white-space: nowrap;
}

.mm-btn:hover {
  border-color: #9db4e8;
  color: #2b5bd7;
  background: #f4f7ff;
  transform: translateY(-1px);
}

.mm-btn-primary {
  background: linear-gradient(135deg, #4c6ef5, #3454d1);
  border-color: transparent;
  color: #fff;
}

.mm-btn-primary:hover {
  color: #fff;
  box-shadow: 0 6px 16px rgba(52, 84, 209, 0.3);
}

.mm-zoom-label {
  font-size: 12px;
  color: #7a8aa0;
  min-width: 46px;
  text-align: center;
}

/* ---------- 画布 ---------- */
.mm-tip {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  font-size: 13px;
  color: #7a8aa0;
}

.mm-viewport {
  position: relative;
  flex: 1;
  overflow: hidden;
  cursor: grab;
  background-color: #f4f7fb;
  background-image: radial-gradient(#cfd9e8 1px, transparent 1px);
  background-size: 22px 22px;
}

.mm-viewport.dragging {
  cursor: grabbing;
}

.mm-stage {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
}

.mm-links {
  position: absolute;
  top: 0;
  left: 0;
  overflow: visible;
  pointer-events: none;
}

.mm-nodes {
  position: absolute;
  top: 0;
  left: 0;
}

/* ---------- 节点 ---------- */
.mm-node {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 9px;
  border-radius: 10px;
  padding: 8px 15px;
  cursor: pointer;
  user-select: none;
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.mm-node:hover {
  transform: translateY(-2px);
}

.mm-label {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.45;
}

.mm-node.root {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
  box-shadow: 0 10px 26px rgba(31, 45, 90, 0.32);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.mm-node.root .mm-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #7ee7c7;
  box-shadow: 0 0 0 4px rgba(126, 231, 199, 0.25);
  flex: none;
}

.mm-node.root:hover {
  box-shadow: 0 14px 32px rgba(31, 45, 90, 0.42);
}

.mm-node.branch {
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 6px 18px rgba(31, 45, 90, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.mm-node.branch .mm-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  flex: none;
}

.mm-count {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  min-width: 18px;
  text-align: center;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.22);
  padding: 0 5px;
}

.mm-node.branch.collapsed .mm-count {
  background: rgba(255, 255, 255, 0.38);
}

.mm-node.leaf {
  background: #fff;
  color: #3b4a5f;
  font-size: 13px;
  border: 1px solid #e6ebf2;
  box-shadow: 0 3px 10px rgba(31, 45, 90, 0.05);
}

.mm-bar {
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 4px;
  border-radius: 0 3px 3px 0;
}

.mm-node.leaf:hover {
  box-shadow: 0 8px 18px rgba(31, 45, 90, 0.12);
}

/* ---------- 角标提示 ---------- */
.mm-hint {
  position: absolute;
  left: 22px;
  bottom: 18px;
  z-index: 5;
  font-size: 12px;
  color: #92a0b4;
  background: rgba(255, 255, 255, 0.7);
  padding: 7px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  backdrop-filter: blur(4px);
  pointer-events: none;
}

.mm-stat {
  position: absolute;
  right: 22px;
  bottom: 18px;
  z-index: 5;
  font-size: 12px;
  color: #7a8aa0;
  background: rgba(255, 255, 255, 0.7);
  padding: 7px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  pointer-events: none;
}
</style>
