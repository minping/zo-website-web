<template>
  <header class="navbar">
    <div class="container navbar-content">
      <div class="logo" @click="goHome">
        <span class="logo-icon">&lt;/&gt;</span>
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
        <button class="theme-toggle" @click="toggleTheme" :title="theme === 'dark' ? '切换到亮色主题' : '切换到深色主题'">
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
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
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

const navLinks = [
  { name: '首页', path: '/', label: '首页' },
  { name: '文章', path: '/articles', label: '文章' },
  { name: 'API', path: '/api', label: 'API' },
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
  color: #e2e8f0;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: color 0.3s;
  cursor: pointer;
}

.nav-link:hover,
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
  .nav-links {
    gap: 16px;
  }
  
  .nav-link {
    font-size: 13px;
  }
}
</style>
