<template>
  <div class="random-study-page">
    <!-- 背景效果 -->
    <div class="bg-grid"></div>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>
    <!-- 主题背景装饰 -->
    <BgScenery />

    <!-- 导航栏 -->
    <Navbar activeMenu="摇一摇" @navigate="handleNavigate" />

    <!-- 页面主体 -->
    <main class="page-main">
      <div class="container">
        <header class="page-header">
          <h1 class="page-title">摇一摇</h1>
          <p class="page-desc"> 看一看, 走过路过不要错过</p>
        </header>

        <!-- 摇一摇主区 -->
        <section class="shake-zone">
          <!-- 学习范围：选择某一篇笔记后，只在该笔记范围内随机抽取 -->
          <div class="scope-bar">
            <span class="scope-label">学习范围</span>
            <div class="scope-select-wrap">
              <select
                v-model="selectedNoteId"
                class="scope-select"
                :disabled="notesLoading || rolling"
                :title="selectedNoteName ? `当前范围：${selectedNoteName}` : '当前范围：全部笔记'"
              >
                <option value="">{{ notesLoading ? '笔记加载中…' : '全部笔记（全库随机）' }}</option>
                <option v-for="n in noteOptions" :key="n.id" :value="n.id">{{ n.name }}</option>
              </select>
              <svg class="scope-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
            <button
              v-if="selectedNoteId"
              class="scope-clear"
              type="button"
              title="清除选择，恢复全库随机"
              @click="clearNoteScope"
            >
              清除
            </button>
          </div>

          <!-- 圆形摇一摇按钮：柔和光晕呼吸 + 图标摇摆 -->
          <button
            ref="shakeBtnEl"
            class="shake-btn"
            :class="{ 'shake-rolling': rolling }"
            :disabled="rolling"
            :title="rolling ? '正在随机挑选中…' : '点我随机抽取一篇学习小节'"
            @click="handleShake"
          >
            <span class="shake-aura" aria-hidden="true"></span>
            <span class="shake-btn-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="5"/>
                <circle cx="8" cy="8" r="1.6" fill="currentColor" stroke="none"/>
                <circle cx="16" cy="8" r="1.6" fill="currentColor" stroke="none"/>
                <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/>
                <circle cx="8" cy="16" r="1.6" fill="currentColor" stroke="none"/>
                <circle cx="16" cy="16" r="1.6" fill="currentColor" stroke="none"/>
              </svg>
            </span>
            <span class="shake-btn-main">{{ rolling ? '挑选中…' : '摇一摇' }}</span>
            <span class="shake-btn-sub">{{ rolling ? '正在为你随机挑一篇' : '随机学习一个知识点' }}</span>
          </button>

          <p class="shake-tip">{{ shakeTip }}</p>

          <!-- 抽取失败提示 -->
          <transition name="shake-fade">
            <p v-if="errorText" class="shake-error">{{ errorText }}</p>
          </transition>

          <!-- 随机结果卡片：抽到的小节内容 + 打卡（通用组件 StudyChapterCard） -->
          <transition name="shake-fade">
            <div v-if="result" ref="resultEl">
              <StudyChapterCard :chapter-id="result.id" />
            </div>
          </transition>
        </section>
      </div>
    </main>

    <!-- 回到顶部 -->
    <transition name="fade">
      <button
        v-show="showBackTop"
        class="back-to-top"
        title="回到顶部"
        @click="scrollToTop"
      >
        <span class="back-to-top-icon">↑</span>
      </button>
    </transition>

    <!-- 轻提示 -->
    <transition name="toast-pop">
      <div v-if="toast" class="random-toast">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        {{ toast }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import StudyChapterCard from './StudyChapterCard.vue'
import Navbar from './Navbar.vue'
import BgScenery from './BgScenery.vue'
import api from '../api/article.js'
import { useTheme } from '../composables/useTheme.js'

// 接入网站主题体系（服务端主题 + 全局切换），与其他页面保持一致
useTheme()


// ========== 摇一摇状态 ==========
const rolling = ref(false)
const errorText = ref('')
const result = ref(null)
const resultEl = ref(null)
const toast = ref('')
let toastTimer = null

// ========== 学习范围（笔记下拉框） ==========
// 选项来自 queryNoteListPublished，显示 name，值为 id；选中后 getRandomContent 传 noteId
const noteOptions = ref([])
const notesLoading = ref(false)
const selectedNoteId = ref('')

const selectedNoteName = computed(() => {
  const hit = noteOptions.value.find((n) => n.id === selectedNoteId.value)
  return hit ? hit.name : ''
})

const shakeTip = computed(() => {
  if (rolling.value) return '已抓住命运的节拍…'
  if (selectedNoteName.value) return `只从《${selectedNoteName.value}》中随机抽取一个小节`
  return '点击按钮，随机抽取笔记中的一个小节'
})

// 加载已发布笔记，作为下拉选项
const loadNoteOptions = async () => {
  notesLoading.value = true
  try {
    const res = await api.getPublishedNotes()
    const ok = !!(res && (res.success === true || res.code === 200 || res.code === 0))
    const list = ok && Array.isArray(res.data) ? res.data : []
    noteOptions.value = list
      .map((n) => ({ id: String(n.id ?? ''), name: n.name || '未命名笔记' }))
      .filter((n) => n.id)
    // 之前选中的笔记若已不存在（被下架），自动回到全库随机
    if (selectedNoteId.value && !noteOptions.value.some((n) => n.id === selectedNoteId.value)) {
      selectedNoteId.value = ''
    }
  } catch (e) {
    console.error('加载笔记列表失败', e)
    noteOptions.value = []
  } finally {
    notesLoading.value = false
  }
}

const clearNoteScope = () => {
  selectedNoteId.value = ''
}

const showToast = (msg) => {
  clearTimeout(toastTimer)
  toast.value = msg
  toastTimer = setTimeout(() => {
    toast.value = ''
  }, 2600)
}

// 最短摇动时长，保证"摇晃中"动画有足够存在感
const MIN_ROLL_TIME = 900

const handleShake = async () => {
  if (rolling.value) return
  rolling.value = true
  errorText.value = ''
  const startedAt = Date.now()
  try {
    // 指定了学习范围则只在对应笔记内随机（noteId 为空 = 全库随机）
    const res = await api.getRandomNoteContent(selectedNoteId.value)
    const ok = !!(res && (res.success === true || res.code === 200 || res.code === 0))
    if (!ok) throw new Error(res.message || res.msg || '抽取失败，请稍后重试')
    const data = res.data && typeof res.data === 'object' ? res.data : {}
    // 只需要小节 id：抽不到 id 才提示换一篇（正文由组件按 id 自行加载）
    if (!data.id) {
      throw new Error(selectedNoteName.value
        ? `《${selectedNoteName.value}》暂时没有可学习的小节，换一篇试试吧`
        : '这次抽到的是空内容，再摇一次试试吧')
    }
    // 只保留小节 id：标题 / 正文 / 关注状态由 StudyChapterCard 按 id 自行加载
    result.value = { id: data.id ?? '' }
  } catch (err) {
    console.error('随机抽取失败', err)
    errorText.value = (err && err.message) || '网络开小差了，稍后再试'
    showToast(errorText.value)
  } finally {
    const rest = Math.max(0, MIN_ROLL_TIME - (Date.now() - startedAt))
    await new Promise((resolve) => setTimeout(resolve, rest))
    rolling.value = false
    if (result.value) {
      nextTick(() => {
        if (resultEl.value) resultEl.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }
}


// ========== 回到顶部 ==========
const showBackTop = ref(false)

const onScroll = () => {
  // 页面滚动超过 300px 时显示按钮（兼容 window 与滚动容器）
  const scroller = document.scrollingElement || document.documentElement
  showBackTop.value = scroller.scrollTop > 300
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}



onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  // 拉取已发布笔记，填充“学习范围”下拉框
  loadNoteOptions()
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  clearTimeout(toastTimer)
})
</script>

<style scoped>
.random-study-page {
  position: relative;
  min-height: 100vh;
}

/* ========== 背景效果（与全站一致） ========== */
.bg-grid {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(var(--border-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-color) 1px, transparent 1px);
  background-size: 60px 60px;
  opacity: 0.25;
  pointer-events: none;
  z-index: 0;
}

.bg-glow {
  position: fixed;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.15;
  pointer-events: none;
  z-index: 0;
}

.bg-glow-1 {
  width: 500px;
  height: 500px;
  background: var(--accent-primary);
  top: -100px;
  right: -100px;
}

.bg-glow-2 {
  width: 400px;
  height: 400px;
  background: var(--accent-secondary);
  bottom: -80px;
  left: -80px;
}

/* ========== 页面主体 ========== */
.page-main {
  position: relative;
  z-index: 1;
  padding: 60px 0 100px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 40px 0 12px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  flex-shrink: 0;
}

.page-desc {
  font-size: 15px;
  color: var(--text-muted);
  margin: 0;
}

/* ========== 摇一摇按钮区 ========== */
.shake-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 34px;
}

/* ========== 学习范围选择（笔记下拉框） ========== */
.scope-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 420px;
  margin: 0 auto 30px;
  padding: 7px 10px 7px 16px;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--bg-card);
  box-shadow: 0 2px 12px -6px rgba(0, 0, 0, 0.25);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.scope-bar:hover {
  border-color: var(--accent-glow);
}

.scope-label {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--text-muted);
}

.scope-select-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.scope-select {
  width: 100%;
  padding: 8px 30px 8px 12px;
  border: none;
  border-radius: 999px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  text-overflow: ellipsis;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.scope-select:hover:not(:disabled) {
  background: var(--accent-glow);
}

.scope-select:focus-visible {
  box-shadow: 0 0 0 2px var(--accent-primary);
}

.scope-select:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* 原生下拉选项：跟随主题配色（暗色下避免白底白字） */
.scope-select option {
  background: var(--bg-card);
  color: var(--text-primary);
}

.scope-caret {
  position: absolute;
  right: 10px;
  width: 14px;
  height: 14px;
  color: var(--text-muted);
  pointer-events: none;
}

.scope-select:focus-visible + .scope-caret {
  color: var(--accent-primary);
}

/* 清除选择：回到全库随机 */
.scope-clear {
  flex-shrink: 0;
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.scope-clear:hover {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  background: var(--accent-glow);
}

.shake-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 176px;
  height: 176px;
  padding: 0;
  border: none;
  border-radius: 50%;
  color: #fff;
  background:
    radial-gradient(circle at 32% 26%, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0) 55%),
    linear-gradient(145deg, var(--accent-primary), var(--accent-secondary));
  cursor: pointer;
  overflow: visible;
  animation: btnPulse 2.4s ease-in-out infinite;
  transition: transform 0.25s ease;
}

.shake-btn:hover:not(:disabled) {
  transform: scale(1.06);
  animation-play-state: paused;
  box-shadow:
    0 0 0 10px var(--accent-glow),
    0 18px 44px -10px var(--accent-glow);
}

.shake-btn:active:not(:disabled) {
  transform: scale(0.96);
}

.shake-btn:disabled {
  cursor: wait;
}

/* 滚动中的整体摇晃 */
.shake-btn.shake-rolling {
  animation: btnShake 0.55s ease-in-out infinite;
}

/* 呼吸光晕（轮廓光圈 + 底部投影） */
@keyframes btnPulse {
  0%, 100% {
    box-shadow:
      0 0 0 4px var(--accent-glow),
      0 14px 30px -10px var(--accent-glow);
  }
  50% {
    box-shadow:
      0 0 0 14px var(--accent-glow),
      0 20px 46px -10px var(--accent-glow);
  }
}

@keyframes btnShake {
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(-7deg) scale(1.03); }
  40% { transform: rotate(6deg) scale(1.05); }
  60% { transform: rotate(-5deg) scale(1.03); }
  80% { transform: rotate(4deg); }
}

/* 柔和径向光晕（向外扩散呼吸放大） */
.shake-aura {
  position: absolute;
  inset: -30px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--accent-glow) 0%, transparent 66%);
  opacity: 0.6;
  pointer-events: none;
  animation: auraPulse 2.4s ease-in-out infinite;
}

/* 摇动中光晕快速呼吸，替代原旋转光环的反馈 */
.shake-rolling .shake-aura {
  animation-duration: 0.9s;
  opacity: 0.85;
}

@keyframes auraPulse {
  0%, 100% { transform: scale(0.92); opacity: 0.5; }
  50% { transform: scale(1.08); opacity: 0.85; }
}

/* 骰子图标：空闲时偶尔小晃 */
.shake-btn-icon {
  display: inline-flex;
  width: 44px;
  height: 44px;
  pointer-events: none;
  animation: iconWobble 3.6s ease-in-out infinite;
}

.shake-btn-icon svg {
  width: 100%;
  height: 100%;
}

.shake-btn:hover:not(:disabled) .shake-btn-icon {
  animation-duration: 1.6s;
}

.shake-rolling .shake-btn-icon {
  animation: iconShake 0.45s ease-in-out infinite;
}

@keyframes iconWobble {
  0%, 78%, 100% { transform: rotate(0deg); }
  82% { transform: rotate(-9deg); }
  87% { transform: rotate(8deg); }
  92% { transform: rotate(-5deg); }
  97% { transform: rotate(3deg); }
}

@keyframes iconShake {
  0%, 100% { transform: rotate(-15deg) scale(1.06); }
  50% { transform: rotate(15deg) scale(1.1); }
}

.shake-btn-main {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 4px;
  color: #fff;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
  white-space: nowrap;
}

.shake-btn-sub {
  font-size: 11px;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.82);
  white-space: nowrap;
}

.shake-tip {
  margin: 26px 0 0;
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
}

.shake-error {
  margin: 16px 0 0;
  padding: 10px 18px;
  font-size: 13px;
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.35);
  border-radius: 10px;
  text-align: center;
}

/* ========== 随机结果卡片 ========== */
/* ========== 过渡与轻提示 ========== */
.shake-fade-enter-active,
.shake-fade-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.shake-fade-enter-from,
.shake-fade-leave-to {
  opacity: 0;
  transform: translateY(14px);
}

.toast-pop-enter-active,
.toast-pop-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-pop-enter-from,
.toast-pop-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}

.random-toast {
  position: fixed;
  left: 50%;
  bottom: 40px;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  /* 固定定位下 left: 50% 会把可用宽度压成半屏而触发换行；
     用 max-content 按内容撑开（单行），仅在超出屏宽时才收缩 */
  width: max-content;
  max-width: calc(100vw - 32px);
  padding: 10px 18px;
  font-size: 13px;
  color: #fff;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(8px);
  border-radius: 999px;
  box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.4);
  z-index: 100;
}

.random-toast svg {
  width: 15px;
  height: 15px;
  color: var(--accent-primary);
}

.back-to-top {
  position: fixed;
  right: 24px;
  bottom: 32px;
  z-index: 100;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.25s ease;
}

.back-to-top:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.24);
}

.back-to-top:active {
  transform: translateY(0);
}

.back-to-top-icon {
  font-size: 20px;
  line-height: 1;
}

/* ========== 图片查看器 ========== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
