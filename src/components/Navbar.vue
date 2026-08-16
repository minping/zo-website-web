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
        <a href="/admin/login" target="_blank" class="admin-link" title="管理后台">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
        </a>
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
          <!-- 云墨 → 墨滴 -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
            <path d="M19 11a7 7 0 1 1-14 0"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme'

const props = defineProps({
  activeMenu: {
    type: String,
    default: '首页'
  }
})

const emit = defineEmits(['navigate'])

const router = useRouter()
const { theme, toggleTheme } = useTheme()

const themeTitle = computed(() => {
  if (theme.value === 'dark') return '切换到亮色主题'
  if (theme.value === 'light') return '切换到复古主题'
  if (theme.value === 'retro') return '切换到赛博朋克主题'
  if (theme.value === 'cyberpunk') return '切换到森林清新主题'
  if (theme.value === 'forest') return '切换到夏日天空蓝主题'
  if (theme.value === 'summer') return '切换到云墨主题'
  return '切换到深色主题'
})

const navLinks = [
  { name: '首页', path: '/', label: '首页' },
  { name: '接口商城', path: '/api', label: '接口商城' },
  { name: '文章', path: '/articles', label: '文章' },
  { name: '笔记', path: '/notes', label: '笔记' },
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

.admin-link {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  text-decoration: none;
}

.admin-link:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--accent-primary);
}

@media (max-width: 768px) {
  .logo-text {
    display: none;
  }

  .nav-links {
    gap: 16px;
  }
  
  .nav-link {
    font-size: 13px;
  }
}
</style>
