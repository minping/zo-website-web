<template>
  <div class="article-list-page">
    <!-- 背景效果 -->
    <div class="bg-grid"></div>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>

    <!-- 导航栏 -->
    <Navbar activeMenu="文章" @navigate="handleNavigate" />

    <!-- 页面标题 -->
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">技术文章</h1>
        <p class="page-desc">探索前沿技术，分享实战经验</p>
      </div>
    </section>

    <!-- 文章模块列表 -->
    <section class="article-sections">
      <div class="container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>

        <!-- 空状态 -->
        <div v-else-if="articleGroups.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <p>暂无文章</p>
        </div>

        <!-- 文章分组列表 -->
        <div v-else class="article-groups">
          <div v-for="group in articleGroups" :key="group.tag" class="article-group">
            <div class="group-header">
              <div class="group-title-wrapper">
                <span class="group-tag-dot" :style="{ background: group.tagColor }"></span>
                <h2 class="group-title">{{ group.tag }}</h2>
                <span class="group-count">({{ group.articles.length }})</span>
              </div>
              <div class="group-pagination" v-if="getGroupTotalPages(group) > 1">
                <button 
                  class="page-btn" 
                  :disabled="group.currentPage <= 1"
                  @click="prevPage(group)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                <span class="page-info">{{ group.currentPage }} / {{ getGroupTotalPages(group) }}</span>
                <button 
                  class="page-btn" 
                  :disabled="group.currentPage >= getGroupTotalPages(group)"
                  @click="nextPage(group)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="group-articles">
              <article 
                v-for="article in getGroupArticles(group)" 
                :key="article.id" 
                class="article-card-compact"
                @click="goToArticle(article)"
              >
                <div class="article-image-compact" :style="{ background: article.gradient }">
                  <span class="article-tag-compact">{{ article.tag }}</span>
                </div>
                <div class="article-content-compact">
                  <div class="article-meta-compact">
                    <span class="article-date-compact">{{ article.date }}</span>
                    <span class="article-read-compact">{{ article.readTime }} 分钟</span>
                  </div>
                  <h3 class="article-title-compact">{{ article.title }}</h3>
                  <p class="article-desc-compact">{{ article.desc }}</p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api/article'
import Navbar from './Navbar.vue'
import Footer from './Footer.vue'

const router = useRouter()

const loading = ref(true)
const articleGroups = ref([])
const pageSize = 4

const getGroupTotalPages = (group) => {
  return Math.ceil(group.articles.length / pageSize)
}

const getGroupArticles = (group) => {
  const currentPage = group.currentPage || 1
  const startIndex = (currentPage - 1) * pageSize
  return group.articles.slice(startIndex, startIndex + pageSize)
}

const prevPage = (group) => {
  if (group.currentPage > 1) {
    group.currentPage--
  }
}

const nextPage = (group) => {
  if (group.currentPage < getGroupTotalPages(group)) {
    group.currentPage++
  }
}

const goToArticle = (article) => {
  router.push(`/article/${article.id}`)
}

// 按标签分组文章
const groupArticlesByTag = (articles) => {
  const groups = {}
  articles.forEach(article => {
    if (!groups[article.tag]) {
      groups[article.tag] = {
        tag: article.tag,
        tagColor: article.tagColor,
        articles: [],
        currentPage: 1
      }
    }
    groups[article.tag].articles.push(article)
  })
  return Object.values(groups)
}

// 获取所有文章
const fetchArticles = async () => {
  try {
    loading.value = true
    const res = await api.getArticles()
    if (res.success) {
      articleGroups.value = groupArticlesByTag(res.data)
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
.article-list-page {
  position: relative;
  min-height: 100vh;
}

/* 背景效果 */
.bg-grid {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 0;
}

.bg-glow {
  position: fixed;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.3;
  pointer-events: none;
  z-index: 0;
}

.bg-glow-1 {
  top: -200px;
  right: -200px;
  background: var(--accent-primary);
}

.bg-glow-2 {
  bottom: -200px;
  left: -200px;
  background: var(--accent-secondary);
}

/* 页面标题 */
.page-header {
  padding: 140px 0 60px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: 48px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.page-desc {
  font-size: 18px;
  color: var(--text-secondary);
}

/* 文章区域 */
.article-sections {
  padding: 0 0 80px;
  position: relative;
  z-index: 1;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: var(--text-secondary);
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(59, 130, 246, 0.1);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: var(--text-secondary);
  gap: 16px;
}

.empty-state svg {
  opacity: 0.5;
}

/* 文章分组 */
.article-groups {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.article-group {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  position: relative;
}

/* 移除 ::after */

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 14px;
  border-bottom: 2px solid var(--border-color);
  position: relative;
}

.group-header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 48px;
  height: 2px;
  background: var(--accent-primary);
  border-radius: 1px;
}

.group-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.group-tag-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.group-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.group-count {
  font-size: 14px;
  color: var(--text-secondary);
}

.group-pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: var(--text-secondary);
  min-width: 50px;
  text-align: center;
}

.group-more {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--accent-primary);
  text-decoration: none;
  font-size: 14px;
  transition: opacity 0.3s;
}

.group-more:hover {
  opacity: 0.8;
}

/* 紧凑型文章卡片 */
.group-articles {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* 文章卡片：极简现代风格 */
.article-card-compact {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.article-card-compact:hover {
  transform: translateY(-6px);
  border-color: var(--accent-primary);
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.18);
}

.article-image-compact {
  height: 120px;
  position: relative;
}

.article-tag-compact {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
}

.article-content-compact {
  padding: 16px;
}

.article-meta-compact {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.article-title-compact {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-desc-compact {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 页脚 */
.footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: 40px 0;
  position: relative;
  z-index: 1;
  transition: background 0.3s ease, border-color 0.3s ease;
}

.footer-content {
  text-align: center;
  margin-bottom: 16px;
}

.footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.footer-desc {
  font-size: 14px;
  color: var(--text-secondary);
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.footer-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: var(--accent-primary);
}

.footer-divider {
  color: var(--text-secondary);
}

.footer-copyright {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}

/* 响应式 */
@media (max-width: 1200px) {
  .group-articles {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .group-articles {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 32px;
  }
  
  .group-articles {
    grid-template-columns: 1fr;
  }
}
</style>
