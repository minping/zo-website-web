<template>
  <header class="navbar">
    <div class="container navbar-content">
      <div class="logo" @click="goHome">
        <span class="logo-icon">&lt;Zo&gt;</span>
        <span class="logo-text">Zode</span>
      </div>
      <nav class="nav-links">
        <a 
          v-for="link in navLinks" 
          :key="link.name"
          href="#" 
          class="nav-link"
          :class="{ active: activeMenu === link.name }"
          @click.prevent="handleNavClick(link)"
        >
          {{ link.label }}
        </a>
      </nav>
      <div class="nav-right">
        <!--
          登录入口（暂无用户信息接口，登录态取自本地假数据）：
          未登录 → 登录按钮；已登录 → 头像 + 下拉菜单。
          跳转必须用 router-link，不能用 <a href="/admin/login">：
          1. href 是相对域名根的绝对路径，会绕过 vue-router 和 router base，
             直接跳到 http://host/admin/login，把 /website 上下文前缀吞掉；
          2. router-link 会自动拼上 vite base（/website/），同时不触发整页刷新。
        -->
        <template v-if="currentUser">
          <div ref="userMenuRef" class="user-menu-wrap">
            <button class="avatar-btn" :title="currentUser.username" @click="toggleUserMenu">
              <img v-if="currentUser.avatar && !avatarBroken" :src="currentUser.avatar" :alt="currentUser.username" class="avatar-img" @error="avatarBroken = true" />
              <span v-else class="avatar-text">{{ avatarText }}</span>
            </button>

            <transition name="user-fade">
              <div v-if="userMenuOpen" class="user-dropdown">
                <div class="user-dropdown-head">
                  <!-- 登录接口返回的 user.avatar（头像图片地址）；加载失败时退回首字母 -->
                  <img v-if="currentUser.avatar && !avatarBroken" :src="currentUser.avatar" :alt="currentUser.username" class="user-dropdown-avatar" @error="avatarBroken = true" />
                  <span v-else class="user-dropdown-avatar avatar-fallback">{{ avatarText }}</span>
                  <div class="user-dropdown-meta">
                    <span class="user-dropdown-name">{{ currentUser.username }}</span>
                    <span v-if="currentUser.phone" class="user-dropdown-sub">{{ currentUser.phone }}</span>
                  </div>
                </div>
                <router-link to="/admin/dashboard" target="_blank" class="user-dropdown-item" @click="closeUserMenu">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  进入后台
                </router-link>
                <button type="button" class="user-dropdown-item is-danger" :disabled="loggingOut" @click="handleLogout">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <path d="M16 17l5-5-5-5"/>
                    <path d="M21 12H9"/>
                  </svg>
                  {{ loggingOut ? '退出中…' : '退出登录' }}
                </button>
              </div>
            </transition>
          </div>
        </template>

        <button v-else type="button" class="login-btn" title="登录" @click="openLoginModal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <path d="M10 17l5-5-5-5"/>
            <path d="M15 12H3"/>
          </svg>
          <span class="login-btn-text">登录</span>
        </button>
        <button class="theme-toggle" @click="toggleTheme" :title="themeTitle">
          <!-- 深色 → 太阳 -->
          <svg v-if="theme === 'dark'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <!-- 亮色 → 月亮 -->
          <svg v-else-if="theme === 'light'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <!-- 复古 → 沙漏 -->
          <svg v-else-if="theme === 'retro'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2h12v6l-4 4 4 4v6H6v-6l4-4-4-4V2z"/>
            <path d="M6 2h12"/>
            <path d="M6 22h12"/>
            <line x1="10" y1="12" x2="14" y2="12"/>
          </svg>
          <!-- 赛博朋克 → 芯片 -->
          <svg v-else-if="theme === 'cyberpunk'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
            <line x1="9" y1="2" x2="9" y2="4"/>
            <line x1="15" y1="2" x2="15" y2="4"/>
            <line x1="9" y1="20" x2="9" y2="22"/>
            <line x1="15" y1="20" x2="15" y2="22"/>
            <line x1="20" y1="9" x2="22" y2="9"/>
            <line x1="20" y1="14" x2="22" y2="14"/>
            <line x1="2" y1="9" x2="4" y2="9"/>
            <line x1="2" y1="14" x2="4" y2="14"/>
            <rect x="9" y="9" width="6" height="6"/>
            <line x1="12" y1="9" x2="12" y2="15"/>
            <line x1="9" y1="12" x2="15" y2="12"/>
          </svg>
          <!-- 森林清新 → 叶子 -->
          <svg v-else-if="theme === 'forest'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z"/>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
          </svg>
          <!-- 夏日天空蓝 → 太阳 -->
          <svg v-else-if="theme === 'summer'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2"/>
            <path d="M12 20v2"/>
            <path d="m4.93 4.93 1.41 1.41"/>
            <path d="m17.66 17.66 1.41 1.41"/>
            <path d="M2 12h2"/>
            <path d="M20 12h2"/>
            <path d="m6.34 17.66-1.41 1.41"/>
            <path d="m19.07 4.93-1.41 1.41"/>
          </svg>
          <!-- 粉系少女 → 带表情的涂鸦爱心（呼应壁纸里的小熊/兔子涂鸦） -->
          <svg v-else-if="theme === 'pink'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19.8 5.2a4.7 4.7 0 0 0-6.7 0L12 6.3l-1.1-1.1a4.7 4.7 0 1 0-6.7 6.7l1.1 1.1L12 19.8l6.7-6.7 1.1-1.1a4.7 4.7 0 0 0 0-6.7z"/>
            <circle cx="9.6" cy="11.2" r="0.9" fill="currentColor" stroke="none"/>
            <circle cx="14.4" cy="11.2" r="0.9" fill="currentColor" stroke="none"/>
            <path d="M10.5 13.9c.8.8 2.2.8 3 0"/>
          </svg>
          <!-- 云墨 → 墨滴 -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
            <path d="M19 11a7 7 0 1 1-14 0"/>
          </svg>
        </button>
      </div>
    </div>
  </header>

  <!-- 登录弹窗：复用登录页的卡片（embedded 模式只显示中间卡片） -->
  <Teleport to="body">
    <transition name="login-modal-fade">
      <div v-if="loginModalOpen" class="login-modal-overlay" @click.self="closeLoginModal">
        <div class="login-modal" role="dialog" aria-modal="true" aria-label="登录">
          <AdminLogin embedded @close="closeLoginModal" @success="onLoginSuccess" />
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import AdminLogin from './admin/AdminLogin.vue'
import { api } from '../api/article'

const props = defineProps({
  activeMenu: {
    type: String,
    default: '首页'
  }
})

const emit = defineEmits(['navigate'])

const router = useRouter()
const { theme, toggleTheme } = useTheme()

// ========== 登录态 ==========
// 想直接查看「已登录」效果：把 MOCK_USER 改成 { username: 'Zode', avatar: '' } 即可
const MOCK_USER = null

const currentUser = ref(MOCK_USER)
const userMenuOpen = ref(false)
const userMenuRef = ref(null)
// 头像图片加载失败标记：置真后退回首字母占位（登录/退出/刷新时重置）
const avatarBroken = ref(false)

// 登录接口返回的 user 会写入 adminUser，这里解析出导航栏需要的三项
// 后端字段名未定，做多字段兼容
const loadCurrentUser = () => {
  avatarBroken.value = false
  if (MOCK_USER) {
    currentUser.value = MOCK_USER
    return
  }
  try {
    const raw = localStorage.getItem('adminUser')
    const user = raw ? JSON.parse(raw) : null
    if (user && typeof user === 'object') {
      // 显示名以后端返回的 name 字段为准，其余键名做兼容兜底
      const name = user.name || ''
      if (name) {
        currentUser.value = {
          username: user.name || '',
          phone: user.phone || '',
          avatar: user.avatar || ''
        }
        return
      }
    }
    currentUser.value = null
  } catch (e) {
    currentUser.value = null
  }
}

// 没有头像图片时取用户名首字符占位
const avatarText = computed(() => {
  const name = currentUser.value && currentUser.value.username
  return name ? name.trim().charAt(0).toUpperCase() : 'U'
})

const closeUserMenu = () => {
  userMenuOpen.value = false
}

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

// 点击空白处收起菜单
const onDocumentClick = (e) => {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target)) {
    userMenuOpen.value = false
  }
}

// ========== 登录弹窗 ==========
const loginModalOpen = ref(false)

const openLoginModal = () => {
  loginModalOpen.value = true
  userMenuOpen.value = false
  document.body.style.overflow = 'hidden'
}

const closeLoginModal = () => {
  loginModalOpen.value = false
  document.body.style.overflow = ''
}

// 登录成功：刷新登录态（换成头像）并关掉弹窗
const onLoginSuccess = () => {
  loadCurrentUser()
  closeLoginModal()
}

// Esc 关闭
const onKeydown = (e) => {
  if (e.key === 'Escape' && loginModalOpen.value) {
    closeLoginModal()
  }
}

// ========== 登出（POST /user/login/userLogout，无 data） ==========
// 无论接口成功、返回失败还是请求异常，都清除本地登录信息
const loggingOut = ref(false)

const clearLocalAuth = () => {
  localStorage.removeItem('authorization_token')
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminUser')
  currentUser.value = null
  userMenuOpen.value = false
}

const handleLogout = async () => {
  if (loggingOut.value) return
  loggingOut.value = true
  try {
    await api.userLogout()
  } catch (e) {
    // 接口失败也不影响本地登出
    console.error('登出请求失败（本地登录信息已清除）', e)
  } finally {
    clearLocalAuth()
    loggingOut.value = false
  }
}

// 会话失效（任一接口返回 state=2940）：刷新登录态并弹出登录弹窗
// 并发请求同时失效时 openLoginModal 内有开关判断，不会重复弹
const onSessionExpired = () => {
  loadCurrentUser()
  if (!loginModalOpen.value) {
    openLoginModal()
  }
}

onMounted(() => {
  loadCurrentUser()
  // 多标签页：其它标签登录/退出后同步
  window.addEventListener('storage', loadCurrentUser)
  // 同标签页：从登录页返回后刷新登录态
  window.addEventListener('focus', loadCurrentUser)
  // 会话失效：任意接口返回 2940 时清登录态并弹登录窗
  window.addEventListener('session-expired', onSessionExpired)
  window.addEventListener('keydown', onKeydown)
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  window.removeEventListener('storage', loadCurrentUser)
  window.removeEventListener('focus', loadCurrentUser)
  window.removeEventListener('session-expired', onSessionExpired)
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('click', onDocumentClick)
  // 兜底：组件卸载时不残留滚动锁定
  document.body.style.overflow = ''
})

const themeTitle = computed(() => {
  if (theme.value === 'dark') return '切换到亮色主题'
  if (theme.value === 'light') return '切换到复古主题'
  if (theme.value === 'retro') return '切换到赛博朋克主题'
  if (theme.value === 'cyberpunk') return '切换到森林清新主题'
  if (theme.value === 'forest') return '切换到夏日天空蓝主题'
  if (theme.value === 'summer') return '切换到云墨主题'
  if (theme.value === 'ink') return '切换到粉系少女主题'
  return '切换到深色主题'
})

const navLinks = [
  { name: '首页', path: '/', label: '首页' },
  { name: '文章', path: '/articles', label: '文章' },
  { name: '笔记', path: '/notes', label: '笔记' },
  { name: '摇一摇', path: '/random-study', label: '摇一摇' },
  { name: '学习域', path: '/study-domain', label: '学习域' },
  { name: '知识库', path: '/knowledge', label: '知识库' },
  // { name: '接口', path: '/apis', label: '接口' },
  { name: '关于', path: '/about', label: '关于' }
]

const goHome = () => {
  router.push('/')
}

const handleNavClick = (link) => {
  emit('navigate', link.name)
  router.push(link.path)
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 64px;
  background: var(--navbar-bg);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  z-index: 100;
  transition: background 0.3s ease, border-color 0.3s ease;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.logo:hover {
  opacity: 0.8;
}

.logo-icon {
  font-size: 20px;
  font-weight: bold;
  color: var(--accent-primary);
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: color 0.3s;
  cursor: pointer;
}

.nav-link:hover {
  color: var(--text-primary);
}

.nav-link.active {
  color: var(--text-primary);
}

.nav-link.active {
  position: relative;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--accent-primary);
  border-radius: 2px;
}

.theme-toggle {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* -------- 未登录：登录按钮 -------- */
.login-btn {
  height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  transition: all 0.3s;
}

.login-btn svg {
  width: 16px;
  height: 16px;
}

.login-btn:hover {
  /* 主题渐变实心态，与全站按钮语言一致 */
  color: #fff;
  border-color: transparent;
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
  box-shadow: 0 8px 18px -10px var(--accent-primary);
}

/* -------- 已登录：头像 + 下拉菜单 -------- */
.user-menu-wrap {
  position: relative;
}

.avatar-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.avatar-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px -10px var(--accent-primary);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-text {
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 168px;
  padding: 6px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 18px 40px -22px var(--accent-primary), 0 8px 24px -14px rgba(0, 0, 0, 0.4);
  z-index: 100;
}

/* 菜单头部：头像图 + 名字/手机号 */
.user-dropdown-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px 8px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 4px;
}

.user-dropdown-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  flex: none;
}

/* 头像图缺失/加载失败时的首字母占位：与导航栏头像同款渐变底 */
.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
}

.user-dropdown-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.user-dropdown-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-dropdown-sub {
  font-size: 12px;
  color: var(--text-muted);
}

.user-dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 9px 10px;
  font-size: 13.5px;
  font-family: inherit;
  color: var(--text-secondary);
  background: none;
  border: none;
  border-radius: 8px;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease;
}

.user-dropdown-item svg {
  width: 15px;
  height: 15px;
  flex: none;
}

.user-dropdown-item:hover {
  color: var(--accent-primary);
  background: var(--accent-glow);
}

.user-dropdown-item.is-danger:hover {
  color: #f43f5e;
  background: rgba(244, 63, 94, 0.1);
}

/* 登出请求进行中：置灰防重复点击 */
.user-dropdown-item:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* -------- 登录弹窗 -------- */
.login-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(6px);
  overflow-y: auto;
}

.login-modal {
  width: 100%;
  max-width: 420px;
  margin: auto;
}

.login-modal-fade-enter-active,
.login-modal-fade-leave-active {
  transition: opacity 0.22s ease;
}

.login-modal-fade-enter-active .login-modal,
.login-modal-fade-leave-active .login-modal {
  transition: transform 0.22s ease;
}

.login-modal-fade-enter-from,
.login-modal-fade-leave-to {
  opacity: 0;
}

.login-modal-fade-enter-from .login-modal,
.login-modal-fade-leave-to .login-modal {
  transform: translateY(12px) scale(0.98);
}

.user-fade-enter-active,
.user-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.user-fade-enter-from,
.user-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 768px) {
  /* 窄屏只留图标，给菜单腾出横向空间 */
  .login-btn {
    padding: 0 10px;
  }

  .login-btn-text {
    display: none;
  }

  .navbar-content {
    gap: 6px;
  }

  .logo-text {
    display: none;
  }

  /* 导航栏整体只响应左右拖拽：纵向拖拽不再带动导航栏/页面滚动 */
  .navbar {
    touch-action: pan-x pinch-zoom;
    overscroll-behavior: contain;
  }

  /* 菜单占满剩余空间并支持横向滑动，禁止换行 */
  .nav-links {
    flex: 1;
    min-width: 0;
    justify-content: flex-start;
    gap: 2px;
    overflow-x: auto;
    overflow-y: hidden;            /* 关闭纵向滚动容器，避免上下拖拽 */
    touch-action: pan-x pinch-zoom; /* 手势仅允许横向拖拽 */
    overscroll-behavior: contain;  /* 阻止滚动链传到页面 */
    white-space: nowrap;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    mask-image: linear-gradient(to right, transparent 0, #000 12px, #000 calc(100% - 12px), transparent 100%);
    -webkit-mask-image: linear-gradient(to right, transparent 0, #000 12px, #000 calc(100% - 12px), transparent 100%);
  }

  .nav-links::-webkit-scrollbar {
    display: none;
  }

  .nav-link {
    flex: 0 0 auto;
    white-space: nowrap;
    padding: 8px 12px;
    font-size: 14px;
  }
}
</style>
