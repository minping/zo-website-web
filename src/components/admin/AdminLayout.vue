<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo" @click="goHome">
          <span class="logo-icon">&lt;/&gt;</span>
          <span class="logo-text">Zode</span>
        </div>
        <span class="admin-badge">管理后台</span>
      </div>

      <nav class="sidebar-nav">
        <div 
          v-for="item in navItems" 
          :key="item.id"
          class="nav-group"
        >
          <a 
            href="#" 
            class="nav-item"
            :class="{ active: isParentActive(item), 'has-children': item.children }"
            @click.prevent="handleNavClick(item)"
          >
            <component :is="item.icon" />
            <span>{{ item.label }}</span>
            <svg v-if="item.children" class="arrow-icon" :class="{ expanded: isExpanded(item) }" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </a>
          <!-- 子菜单 -->
          <div v-if="item.children && isExpanded(item)" class="sub-nav">
            <a 
              v-for="child in item.children" 
              :key="child.id"
              href="#" 
              class="nav-item sub-nav-item"
              :class="{ active: activeNav === child.id }"
              @click.prevent="handleNavClick(child)"
            >
              <component :is="child.icon" />
              <span>{{ child.label }}</span>
            </a>
          </div>
        </div>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" @click="handleLogout">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          退出登录
        </button>
        <button class="back-home" @click="goHome">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          返回前台
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, h, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 根据路由确定当前激活的导航
const getActiveNav = () => {
  const path = route.path
  if (path.includes('/admin/drafts')) {
    return 'drafts'
  }
  if (path.includes('/admin/published')) {
    return 'published'
  }
  if (path.includes('/admin/tags')) {
    return 'tags'
  }
  if (path.includes('/admin/articles') || path.includes('/admin/editor')) {
    return 'articles'
  }
  if (path.includes('/admin/apis')) {
    return 'apis'
  }
  if (path.includes('/admin/dashboard')) {
    return 'dashboard'
  }
  return 'dashboard'
}

const activeNav = ref(getActiveNav())

// 展开状态
const expandedMenus = ref(['articles'])

const isExpanded = (item) => {
  return expandedMenus.value.includes(item.id)
}

const isParentActive = (item) => {
  if (item.children) {
    return item.children.some(child => activeNav.value === child.id)
  }
  return activeNav.value === item.id
}

// 导航图标组件
const DashboardIcon = {
  render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('rect', { x: '3', y: '3', width: '7', height: '9' }),
    h('rect', { x: '14', y: '3', width: '7', height: '5' }),
    h('rect', { x: '14', y: '12', width: '7', height: '9' }),
    h('rect', { x: '3', y: '16', width: '7', height: '5' })
  ])
}

const ArticlesIcon = {
  render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
    h('polyline', { points: '14 2 14 8 20 8' }),
    h('line', { x1: '16', y1: '13', x2: '8', y2: '13' }),
    h('line', { x1: '16', y1: '17', x2: '8', y2: '17' })
  ])
}

const ApisIcon = {
  render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z' })
  ])
}

const DraftsIcon = {
  render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
    h('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })
  ])
}

const PublishedIcon = {
  render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('polyline', { points: '20 6 9 17 4 12' })
  ])
}

const TagIcon = {
  render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z' }),
    h('line', { x1: '7', y1: '7', x2: '7.01', y2: '7' })
  ])
}

const navItems = [
  { id: 'dashboard', label: '仪表盘', icon: DashboardIcon, path: '/admin/dashboard' },
  { 
    id: 'articles', 
    label: '文章管理', 
    icon: ArticlesIcon, 
    path: '/admin/articles',
    children: [
      { id: 'tags', label: '标签管理', icon: TagIcon, path: '/admin/tags' },
      { id: 'drafts', label: '草稿箱', icon: DraftsIcon, path: '/admin/drafts' },
      { id: 'published', label: '已发布', icon: PublishedIcon, path: '/admin/published' }
      
    ]
  },
  { id: 'apis', label: 'API 管理', icon: ApisIcon, path: '/admin/apis' }
]

const handleNavClick = (item) => {
  if (item.children) {
    // 切换展开状态
    const index = expandedMenus.value.indexOf(item.id)
    if (index > -1) {
      expandedMenus.value.splice(index, 1)
    } else {
      expandedMenus.value.push(item.id)
    }
  } else {
    activeNav.value = item.id
    router.push(item.path)
  }
}

const goHome = () => {
  router.push('/')
}

// 监听路由变化
watch(() => route.path, () => {
  activeNav.value = getActiveNav()
  // 自动展开文章管理菜单
  const path = route.path
  if (path.includes('/admin/articles') || path.includes('/admin/drafts') || path.includes('/admin/published') || path.includes('/admin/editor') || path.includes('/admin/tags')) {
    if (!expandedMenus.value.includes('articles')) {
      expandedMenus.value.push('articles')
    }
  }
}, { immediate: true })

const handleLogout = () => {
  // 清除登录状态
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminUser')
  // 跳转到登录页面
  router.push('/admin/login')
}
</script>

<style scoped>
/* 暗色主题变量 */
.admin-layout {
  --admin-bg-primary: #0f0f23;
  --admin-bg-secondary: #1a1a2e;
  --admin-bg-card: #1a1a2e;
  --admin-border-color: #2d2d44;
  --admin-text-primary: #e4e4e7;
  --admin-text-secondary: #a1a1aa;
  --admin-accent-primary: #6366f1;
  --admin-accent-secondary: #8b5cf6;
  --admin-hover-bg: rgba(99, 102, 241, 0.15);
  --admin-active-bg: #6366f1;
  --admin-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  
  display: flex;
  min-height: 100vh;
  background: var(--admin-bg-primary);
}

/* 侧边栏 */
.sidebar {
  width: 260px;
  background: var(--admin-bg-secondary);
  border-right: 1px solid var(--admin-border-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 100;
  box-shadow: var(--admin-shadow);
}

.sidebar-header {
  padding: 24px;
  border-bottom: 1px solid var(--admin-border-color);
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.logo-icon {
  font-size: 20px;
  font-weight: bold;
  color: var(--admin-accent-primary);
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--admin-text-primary);
}

.admin-badge {
  padding: 4px 8px;
  background: var(--admin-accent-primary);
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: var(--admin-text-secondary);
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.nav-item:hover {
  background: var(--admin-hover-bg);
  color: var(--admin-text-primary);
}

.nav-item.active {
  background: var(--admin-active-bg);
  color: white;
}

.nav-item.has-children {
  justify-content: space-between;
}

.arrow-icon {
  transition: transform 0.3s;
}

.arrow-icon.expanded {
  transform: rotate(90deg);
}

.sub-nav {
  margin-left: 20px;
  margin-top: 4px;
}

.sub-nav-item {
  padding: 10px 16px;
  font-size: 13px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--admin-border-color);
}

.back-home {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px solid var(--admin-border-color);
  border-radius: 8px;
  color: var(--admin-text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.back-home:hover {
  background: var(--admin-hover-bg);
  color: var(--admin-text-primary);
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  color: #ef4444;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 8px;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
}

/* 主内容区 */
.main-content {
  flex: 1;
  margin-left: 260px;
  padding: 32px 40px;
  min-height: 100vh;
  background: var(--admin-bg-primary);
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .main-content {
    margin-left: 0;
    padding: 20px;
  }
}
</style>
