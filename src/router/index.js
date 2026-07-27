import { createRouter, createWebHistory } from 'vue-router'
import BlogHome from '../components/BlogHome.vue'
import ArticleList from '../components/ArticleList.vue'
import ArticleDetail from '../components/ArticleDetail.vue'
import About from '../components/About.vue'
import ApiPage from '../components/ApiPage.vue'
import ApiDetail from '../components/ApiDetail.vue'
import AdminDashboard from '../components/admin/AdminDashboard.vue'
import AdminDraftList from '../components/admin/AdminDraftList.vue'
import AdminPublishedList from '../components/admin/AdminPublishedList.vue'
import AdminArticleEditor from '../components/admin/AdminArticleEditor.vue'
import AdminApiList from '../components/admin/AdminApiList.vue'
import AdminApiEditor from '../components/admin/AdminApiEditor.vue'
import AdminTagManagement from '../components/admin/AdminTagManagement.vue'
import AdminLogin from '../components/admin/AdminLogin.vue'
import AdminMyInfo from '../components/admin/AdminMyInfo.vue'
import AdminProjectForm from '../components/admin/AdminProjectForm.vue'
import AdminProjects from '../components/admin/AdminProjects.vue'
import AdminSelfProjects from '../components/admin/AdminSelfProjects.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: BlogHome
  },
  {
    path: '/articles',
    name: 'ArticleList',
    component: ArticleList
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: ArticleDetail
  },
  {
    path: '/api',
    name: 'ApiPage',
    component: ApiPage
  },
  {
    path: '/api/:id',
    name: 'ApiDetail',
    component: ApiDetail
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/admin',
    redirect: '/admin/login'
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/drafts',
    name: 'AdminDraftList',
    component: AdminDraftList,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/published',
    name: 'AdminPublishedList',
    component: AdminPublishedList,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/editor',
    name: 'AdminArticleEditor',
    component: AdminArticleEditor,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/apis',
    name: 'AdminApiList',
    component: AdminApiList,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/apis/editor',
    name: 'AdminApiEditor',
    component: AdminApiEditor,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/tags',
    name: 'AdminTagManagement',
    component: AdminTagManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/profile',
    name: 'AdminMyInfo',
    component: AdminMyInfo,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/projects',
    name: 'AdminProjects',
    component: AdminProjects,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/projects/form',
    name: 'AdminProjectForm',
    component: AdminProjectForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/self-projects',
    name: 'AdminSelfProjects',
    component: AdminSelfProjects,
    meta: { requiresAuth: true }
  },
  ]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫：检查登录状态
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('adminToken')

  // 如果路由需要认证
  if (to.meta.requiresAuth) {
    if (!token) {
      // 未登录，跳转到登录页面
      next('/admin/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
