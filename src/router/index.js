import { createRouter, createWebHistory } from 'vue-router'
import BlogHome from '../components/BlogHome.vue'
import ArticleList from '../components/ArticleList.vue'
import ArticleDetail from '../components/ArticleDetail.vue'
import About from '../components/About.vue'
import ApiPage from '../components/ApiPage.vue'
import ApiDetail from '../components/ApiDetail.vue'
import AdminDashboard from '../components/admin/AdminDashboard.vue'
import AdminArticleList from '../components/admin/AdminArticleList.vue'
import AdminDraftList from '../components/admin/AdminDraftList.vue'
import AdminPublishedList from '../components/admin/AdminPublishedList.vue'
import AdminArticleEditor from '../components/admin/AdminArticleEditor.vue'
import AdminApiList from '../components/admin/AdminApiList.vue'
import AdminLogin from '../components/admin/AdminLogin.vue'

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
    path: '/admin/articles',
    name: 'AdminArticleList',
    component: AdminArticleList,
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
