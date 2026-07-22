<template>
  <div class="blog-home">
    <!-- 背景粒子效果 -->
    <div class="bg-grid"></div>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>

    <!-- 导航栏 -->
    <Navbar activeMenu="首页" @navigate="handleNavigate" />

    <!-- Hero 区域 -->
    <section class="hero">
      <div class="container">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          欢迎~
        </div>

        <h1 class="hero-title">
          <span class="hero-sub" aria-label="深出浅入 · 不断学习">
            <span class="char" style="--i:0">深</span><span class="char" style="--i:1">出</span><span class="char" style="--i:2">浅</span><span class="char" style="--i:3">入</span>
            <span class="char char-sep" style="--i:4">·</span>
            <span class="char" style="--i:5">不</span><span class="char" style="--i:6">断</span><span class="char" style="--i:7">学</span><span class="char" style="--i:8">习</span>
          </span>
          <span class="hero-main" aria-label="无限进步">无限进步</span>
        </h1>
        <!-- <p class="hero-desc">
          分享前沿技术、编程技巧与实战经验。<br>
          用代码改变世界，用文字传递价值。
        </p> -->
        <div class="hero-actions">
          <button class="btn btn-primary" @click="goToArticles">
            <span>开始阅读</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
          <a href="https://github.com/minping" target="_blank" class="btn btn-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
            </svg>
            <span>GitHub</span>
          </a>
          <a href="https://blog.csdn.net/mekings13?type=blog" target="_blank" class="btn btn-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 4.5a9.5 9.5 0 0 1 0 15A7.5 7.5 0 0 1 6 16"/>
            </svg>
            <span>CSDN</span>
          </a>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-value">{{ stats.articleCount }}</span>
            <span class="stat-label">文章</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ formattedViewCount }}</span>
            <span class="stat-label">浏览</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ formattedLikeCount }}</span>
            <span class="stat-label">点赞</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.days }}</span>
            <span class="stat-label">Days</span>
          </div>
        </div>
      </div>
    </section>


    <!-- 最新文章 -->
    <section v-if="articles.length > 0" class="articles">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">最新文章</h2>
          <a href="#" class="section-more" @click.prevent="goToArticles">
            查看全部
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
        </div>

        <div class="articles-grid">
          <article 
            v-for="article in displayArticles" 
            :key="article.id" 
            class="article-card glow-border" 
            :class="{ 'placeholder': article.placeholder }"
            @click="!article.placeholder && goToArticle(article)"
          >
            <div class="article-image" :style="{ background: article.gradient || getTagGradient(article.tag) }">
              <span class="article-tag-large">{{ article.tag }}</span>
              <span class="article-cover-title">{{ article.title }}</span>
            </div>
            <div class="article-content">
              <p class="article-desc">{{ article.desc || '' }}</p>
              <div class="article-meta">
                <span class="article-date">{{ article.date || '' }}</span>
                <span class="article-read">推荐 {{ article.readTime || 0 }} 分钟阅读</span>
              </div>
              <!-- <h3 class="article-title">{{ article.title }}</h3> -->
              <div class="article-footer">
                <span class="article-views">
                 浏览: {{ article.views || 0 }} 
                </span>
                <a href="#" class="article-link" @click.prevent="goToArticle(article)">
                  阅读全文
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- 开放 API 模块 -->
    <section class="api-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
            </svg>
            开放 API
          </h2>
          <a href="#" class="section-more-inline" @click.prevent="goToApis">
            查看更多
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
        </div>
        <div class="api-grid">
          <div 
            v-for="api in openApis" 
            :key="api.id" 
            class="api-card"
            @click="goToApiDetail(api)"
          >
            <div class="api-card-row">
              <div class="api-tags">
                <span v-for="t in api.tags" :key="t.value" class="api-tag" :style="{ background: t.color + '55', color: '#fff' }">
                  {{ t.text }}
                </span>
                <span v-if="!api.isFree" class="api-tag paid-tag">
                  付费
                </span>
              </div>
              <span class="api-desc">{{ api.description }}</span>
              <span class="api-name">{{ api.name }}</span>
              <div class="api-stats">
                <span class="api-stat" data-tip="累计 API 调用次数">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                  {{ api.stats.calls }}
                </span>
                <span class="api-stat" data-tip="请求成功比例">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {{ api.stats.successRate }}%
                </span>
                <span class="api-stat" data-tip="平均响应时间">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {{ api.responseTime }}ms
                </span>
                <span class="api-stat" data-tip="用户点赞数">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {{ api.stats.likes }}
                </span>
              </div>
              <span class="api-method" :style="{ background: methodColors[api.method] }">
                {{ api.method }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>


    <!-- 技术标签星图 -->
    <section class="tags">
      <div class="container">
        <h2 class="section-title">技术标签</h2>
        <div class="star-map-wrapper">
          <canvas ref="starCanvas" class="star-canvas"></canvas>
          <div class="star-nodes">
            <div
              v-for="tag in tags"
              :key="tag.id"
              class="star-node"
              :class="{ active: hoveredTag?.id === tag.id }"
              :style="{
                '--x': tag._x + '%',
                '--y': tag._y + '%',
                '--node-color': tag.color,
                '--size': tag._size + 'px',
                animationDelay: tag._delay + 's'
              }"
              @mouseenter="showTagTooltip(tag)"
              @mouseleave="hideTagTooltip"
            >
              <span class="node-name">{{ tag.name }}</span>
              <span class="node-glow" :style="{ background: tag.color }"></span>
              <!-- 小弹框 -->
              <div v-if="hoveredTag?.id === tag.id" class="tag-tooltip" :style="{ '--tip-color': tag.color }">
                <div class="tip-arrow"></div>
                <div class="tip-row">
                  <span class="tip-val">{{ tag.articleCount ?? '-' }}</span>
                  <span class="tip-lbl">文章</span>
                </div>
                <div class="tip-row">
                  <span class="tip-val">{{ tag.viewCount ?? '-' }}</span>
                  <span class="tip-lbl">浏览</span>
                </div>
                <div class="tip-row">
                  <span class="tip-val">{{ tag.likeCount ?? '-' }}</span>
                  <span class="tip-lbl">点赞</span>
                </div>
              </div>
            </div>
            <div v-if="tags.length === 0 && !loading" class="empty-tags">
              暂无标签
            </div>
          </div>
        </div>
      </div>


    </section>

    <!-- 页脚 -->
    <Footer />

    <!-- 回到顶部按钮 -->
    <button 
      class="back-to-top" 
      :class="{ visible: showBackTop }" 
      @click="scrollToTop"
      title="回到顶部"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="19" x2="12" y2="5"/>
        <polyline points="5 12 12 5 19 12"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api/article'
import { methodColors, getHomeApis } from '../api/modules'
import Navbar from './Navbar.vue'
import Footer from './Footer.vue'

const router = useRouter()

const articles = ref([])
const openApis = ref([])
const showBackTop = ref(false)
const loading = ref(true)
const tags = ref([])
const starCanvas = ref(null)
const hoveredTag = ref(null)
const stats = ref({
  articleCount: 0,
  likeCount: 0,
  viewCount: 0,
  days: 0
})

const goToArticle = (article) => {
  router.push(`/article/${article.id}`)
}

const goToArticles = () => {
  router.push('/articles')
}

const handleNavigate = (path) => {
  router.push(path)
}

const goToApis = () => {
  router.push('/api')
}

const goToApiDetail = (api) => {
  router.push(`/api/${api.id}`)
}

// 获取技术标签及统计数据
const fetchTags = async () => {
  try {
    const res = await api.getAllTagStatics()
    if (res.success && res.data.length > 0) {
      // 随机散布：完全随机位置，模拟星图效果
      const margin = 8
      const rangeX = 100 - margin * 2
      const rangeY = 100 - margin * 2

      // 生成随机位置，并做简单碰撞检测防止严重重叠
      const usedPositions = []

      const hasOverlap = (x, y, size) => {
        const minDist = size * 1.2
        for (const pos of usedPositions) {
          const dx = (x - pos.x) * 100
          const dy = (y - pos.y) * 100
          if (Math.sqrt(dx * dx + dy * dy) < minDist + pos.size * 0.8) {
            return true
          }
        }
        return false
      }

      tags.value = res.data.map((tag) => {
        const size = 44 + Math.random() * 32
        let x, y
        let tries = 0
        const maxTries = 30

        do {
          x = margin + Math.random() * rangeX
          y = margin + Math.random() * rangeY
          tries++
        } while (tries < maxTries && hasOverlap(x, y, size))

        usedPositions.push({ x, y, size })

        return {
          ...tag,
          _x: x,
          _y: y,
          _size: size,
          _delay: Math.random() * 4
        }
      })
    } else if (res.success) {
      tags.value = []
    }
  } catch (error) {
    console.error('获取标签失败:', error)
  }
}

// 获取站点统计数据
const fetchStats = async () => {
  try {
    const res = await api.getSiteStats()
    if (res.success) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 格式化浏览量显示
const formattedViewCount = computed(() => {
  const count = stats.value.viewCount
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K'
  }
  return count.toString()
})

// 格式化点赞数显示
const formattedLikeCount = computed(() => {
  const count = stats.value.likeCount
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K'
  }
  return count.toString()
})

// 获取文章列表
const fetchArticles = async () => {
  try {
    loading.value = true
    const res = await api.getArticles()
    if (res.success) {
      articles.value = res.data
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 确保显示 8 个槽位（2行4列）
const displayArticles = computed(() => {
  if (articles.value.length === 0) return []
  const result = [...articles.value]
  // 补齐到 8 个
  while (result.length < 8) {
    result.push({ id: `placeholder-${result.length}`, placeholder: true })
  }
  return result.slice(0, 8)
})

const handleScroll = () => {
  showBackTop.value = window.scrollY > 400
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 星图背景动画
let starAnimationId = null
let bgStars = []

const initStarCanvas = () => {
  const canvas = starCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  
  const resizeCanvas = () => {
    const rect = canvas.parentElement.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = rect.width + 'px'
    canvas.style.height = rect.height + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  // 生成背景星星
  const w = () => canvas.width / dpr
  const h = () => canvas.height / dpr
  bgStars = []
  for (let i = 0; i < 80; i++) {
    bgStars.push({
      x: Math.random() * w(),
      y: Math.random() * h(),
      r: Math.random() * 1.8,
      twinkle: Math.random() * Math.PI * 2,
      speed: 0.01 + Math.random() * 0.03
    })
  }

  const animate = () => {
    ctx.clearRect(0, 0, w(), h())
    bgStars.forEach(star => {
      star.twinkle += star.speed
      const alpha = 0.3 + Math.sin(star.twinkle) * 0.3
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(99, 102, 241, ${alpha})`
      ctx.fill()
    })
    starAnimationId = requestAnimationFrame(animate)
  }
  animate()
}

const destroyStarCanvas = () => {
  if (starAnimationId) {
    cancelAnimationFrame(starAnimationId)
    starAnimationId = null
  }
}

// 触碰显示小弹框
const showTagTooltip = (tag) => {
  hoveredTag.value = tag
}

// 离开隐藏
const hideTagTooltip = () => {
  hoveredTag.value = null
}

onMounted(async () => {
  fetchArticles()
  fetchStats()
  fetchApis()
  await fetchTags()
  await nextTick()
  initStarCanvas()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  destroyStarCanvas()
})

// 获取 API 列表
const fetchApis = async () => {
  try {
    const res = await getHomeApis()
    if (res.success) {
      openApis.value = res.data
    }
  } catch (error) {
    console.error('获取 API 列表失败:', error)
  }
}

// 根据标签获取渐变色
const tagGradients = {
  'Vue': 'linear-gradient(135deg, #42b983 0%, #35495e 100%)',
  'React': 'linear-gradient(135deg, #61dafb 0%, #20232a 100%)',
  'TypeScript': 'linear-gradient(135deg, #3178c6 0%, #235a97 100%)',
  'Node.js': 'linear-gradient(135deg, #339933 0%, #1e4d1e 100%)',
  'Python': 'linear-gradient(135deg, #3776ab 0%, #ffd43b 100%)',
  'Go': 'linear-gradient(135deg, #00add8 0%, #5dc9e2 100%)',
  'Rust': 'linear-gradient(135deg, #dea584 0%, #8b4000 100%)',
  'Java': 'linear-gradient(135deg, #f89820 0%, #5382a1 100%)',
  'JavaScript': 'linear-gradient(135deg, #f7df1e 0%, #d4b800 100%)',
  'CSS': 'linear-gradient(135deg, #264de4 0%, #2965f1 100%)',
  'HTML': 'linear-gradient(135deg, #e34f26 0%, #f16529 100%)',
  'Docker': 'linear-gradient(135deg, #2496ed 0%, #1b63a8 100%)',
  'Kubernetes': 'linear-gradient(135deg, #326ce5 0%, #1e3a6e 100%)',
  'DevOps': 'linear-gradient(135deg, #fc6d26 0%, #0db14b 100%)',
  'MongoDB': 'linear-gradient(135deg, #47a248 0%, #00684a 100%)',
  'PostgreSQL': 'linear-gradient(135deg, #336791 0%, #1e3f5f 100%)',
  'Redis': 'linear-gradient(135deg, #dc382d 0%, #8b1a1a 100%)',
  'AWS': 'linear-gradient(135deg, #ff9900 0%, #cd7f00 100%)',
  'Azure': 'linear-gradient(135deg, #0078d4 0%, #004c8c 100%)',
  'GCP': 'linear-gradient(135deg, #4285f4 0%, #1a73e8 100%)'
}

const getTagGradient = (tag) => {
  if (!tag) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  if (tagGradients[tag]) {
    return tagGradients[tag]
  }
  // 为未知标签生成一个随机渐变
  const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const hue1 = hash % 360
  const hue2 = (hue1 + 40) % 360
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 50%) 0%, hsl(${hue2}, 70%, 40%) 100%)`
}
</script>

<style scoped>
.blog-home {
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
  animation: glowDrift1 12s ease-in-out infinite;
}

.bg-glow-2 {
  bottom: -200px;
  left: -200px;
  background: var(--accent-secondary);
  animation: glowDrift2 14s ease-in-out infinite;
}

@keyframes glowDrift1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(-40px, 30px) scale(1.05); }
  50% { transform: translate(-20px, -20px) scale(0.95); }
  75% { transform: translate(30px, 10px) scale(1.03); }
}

@keyframes glowDrift2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(40px, -30px) scale(0.95); }
  50% { transform: translate(20px, 20px) scale(1.05); }
  75% { transform: translate(-30px, -10px) scale(1.02); }
}

/* Hero 区域 */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding-top: 72px;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 100px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 24px;
  animation: badgeSlideIn 0.8s cubic-bezier(0.22, 0.61, 0.36, 1) both;
  animation-delay: 0.2s;
}

@keyframes badgeSlideIn {
  from {
    opacity: 0;
    transform: translateY(-16px);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: dotPulse 2s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { 
    opacity: 1; 
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
  }
  50% { 
    opacity: 0.6; 
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
}

/* ===== 文字动画 ===== */

.hero-title {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: clamp(2rem, 5vw, 3.6rem);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 32px;
  letter-spacing: 0.04em;
  animation: titleFloat 6s ease-in-out infinite;
}

@keyframes titleFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

/* 副标题：逐字淡入 */
.hero-sub {
  font-size: 0.5em;
  font-weight: 500;
  color: var(--text-secondary);
  letter-spacing: 0.12em;
  opacity: 0.75;
  display: inline-block;
}

.hero-sub .char {
  display: inline-block;
  opacity: 0;
  filter: blur(6px);
  animation: charReveal 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
  animation-delay: calc(0.3s + var(--i) * 0.06s);
}

.hero-sub .char-sep {
  margin: 0 0.15em;
  color: var(--accent-primary);
  font-weight: 400;
}

/* 主标题：逐字输入 + 流光 */
.hero-main {
  font-size: 1.15em;
  letter-spacing: 0.08em;
  position: relative;
  display: inline-block;
  background: linear-gradient(
    135deg,
    var(--gradient-start) 0%,
    var(--gradient-end) 40%,
    #a78bfa 60%,
    var(--gradient-start) 100%
  );
  background-size: 300% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmerFlow 6s ease-in-out infinite;
}


@keyframes charReveal {
  to {
    opacity: 1;
    filter: blur(0);
  }
}

@keyframes shimmerFlow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* 打字光标 */
.hero-cursor {
  display: inline-block;
  margin-left: 4px;
  font-weight: 300;
  color: var(--accent-primary);
  animation: cursorBlink 1s step-end infinite;
  vertical-align: baseline;
}

@keyframes cursorBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.hero-desc {
  font-size: 1.125rem;
  color: var(--text-secondary);
  max-width: 500px;
  line-height: 1.8;
  margin-bottom: 40px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 64px;
}

.hero-actions > * {
  opacity: 0;
  animation: btnSlideUp 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
}

.hero-actions > *:nth-child(1) { animation-delay: 1.1s; }
.hero-actions > *:nth-child(2) { animation-delay: 1.2s; }
.hero-actions > *:nth-child(3) { animation-delay: 1.3s; }

@keyframes btnSlideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
  color: white;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
  position: relative;
  overflow: hidden;
}

.btn-primary::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--gradient-start), #a78bfa, var(--gradient-end));
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: -1;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.5), 0 0 60px rgba(99, 102, 241, 0.15);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  border-color: var(--accent-primary);
  background: var(--accent-glow);
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 32px;
}

.hero-stats > * {
  opacity: 0;
  animation: statFadeIn 0.6s ease forwards;
}

.hero-stats > *:nth-child(1) { animation-delay: 1.35s; }
.hero-stats > *:nth-child(2) { animation-delay: 1.4s; }
.hero-stats > *:nth-child(3) { animation-delay: 1.5s; }
.hero-stats > *:nth-child(4) { animation-delay: 1.55s; }
.hero-stats > *:nth-child(5) { animation-delay: 1.65s; }
.hero-stats > *:nth-child(6) { animation-delay: 1.7s; }
.hero-stats > *:nth-child(7) { animation-delay: 1.8s; }

@keyframes statFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--border-color);
}

/* 开放 API 模块 */
.api-section {
  position: relative;
  padding: 100px 0;
  z-index: 1;
}

.api-section .section-header {
  margin-bottom: 32px;
}

.api-section .section-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.api-section .section-title svg {
  color: var(--accent-primary);
}

.api-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.api-card {
  display: flex;
  padding: 12px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.api-card:hover {
  border-color: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.api-card-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 0;
}

.api-method {
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 700;
  color: white;
  border-radius: 4px;
  flex-shrink: 0;
  line-height: 1.4;
}

.api-name {
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
  flex: 1;
  min-width: 0;
}

.api-desc {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  flex-shrink: 0;
}

.api-tags {
  display: flex;
  gap: 5px;
  flex-shrink: 0;
}

.api-tag {
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 10px;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.paid-tag {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.api-stats {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.api-stat {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: help;
  position: relative;
  white-space: nowrap;
}

.api-stat svg {
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.api-stat:hover {
  color: var(--accent-primary);
}

.api-stat:hover::after {
  content: attr(data-tip);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 10px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 11px;
  color: var(--text-primary);
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.api-stat:hover::before {
  content: '';
  position: absolute;
  bottom: calc(100% + 2px);
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: var(--border-color);
  z-index: 10;
}

/* 最新文章 */
.articles {
  position: relative;
  padding: 40px 0 20px;
  z-index: 1;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 48px;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
}

.section-more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.section-more:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  background: var(--accent-glow);
}

.section-more svg {
  transition: transform 0.3s ease;
}

.section-more:hover svg {
  transform: translateX(4px);
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 0;
  color: var(--text-muted);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
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
  gap: 16px;
  padding: 80px 0;
  color: var(--text-muted);
}

.empty-state svg {
  opacity: 0.5;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.article-card {
  background: var(--bg-card);
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.article-card.placeholder {
  visibility: hidden;
  pointer-events: none;
}

.article-image {
  height: 180px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.article-tag-large {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.article-cover-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 16px;
}

.article-content {
  padding: 24px;
}

.article-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.article-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-item svg {
  opacity: 0.7;
}

.article-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 12px;
  line-height: 1.4;
}

.article-desc {
  font-size: 0.875rem;
  color: var(--text-primary);
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-align: left;
}

.article-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.article-author-name {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.article-views {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.article-views svg {
  opacity: 0.6;
}

.article-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--accent-primary);
}

.article-link:hover {
  color: var(--accent-secondary);
}

/* 标签星图 */
.tags {
  position: relative;
  padding: 20px 0 60px;
  z-index: 1;
}

.tags .section-title {
  margin-bottom: 16px;
  text-align: center;
}

.star-map-wrapper {
  position: relative;
  width: 100%;
  height: 380px;
  overflow: visible;
}

.star-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.star-nodes {
  position: relative;
  width: 100%;
  height: 100%;
}

.star-node {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: var(--size);
  height: var(--size);
  margin-left: calc(var(--size) / -2);
  margin-top: calc(var(--size) / -2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s ease;
  animation: nodeFloat 6s ease-in-out infinite;
  z-index: 2;
}

.star-node:hover {
  transform: scale(1.25);
  z-index: 10;
}

.star-node.active {
  transform: scale(1.3);
  z-index: 10;
}

.node-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  opacity: 0.15;
  filter: blur(8px);
  transition: opacity 0.3s ease, filter 0.3s ease;
}

.star-node:hover .node-glow {
  opacity: 0.35;
  filter: blur(16px);
}

.node-name {
  position: relative;
  padding: 8px 18px;
  background: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  transition: all 0.3s ease;
  backdrop-filter: blur(12px);
}

.star-node:hover .node-name {
  border-color: var(--node-color);
  color: var(--node-color);
  box-shadow: 0 0 24px rgba(255, 255, 255, 0.08);
}

@keyframes nodeFloat {
  0%, 100% { transform: translateY(0px); }
  25% { transform: translateY(-8px); }
  50% { transform: translateY(4px); }
  75% { transform: translateY(-6px); }
}

/* 小弹框 */
.tag-tooltip {
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 10px 16px;
  display: flex;
  gap: 14px;
  white-space: nowrap;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
  z-index: 100;
  animation: tooltipIn 0.2s ease;
  pointer-events: none;
}

.tip-arrow {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid var(--border-color);
}

.tip-arrow::after {
  content: '';
  position: absolute;
  top: 1px;
  left: -5px;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid var(--bg-card);
}

.tip-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.tip-val {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
}

.tip-lbl {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

@keyframes tooltipIn {
  from { opacity: 0; transform: translateX(-50%) translateY(4px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* 页脚 */
.footer {
  position: relative;
  padding: 60px 0;
  border-top: 1px solid var(--border-color);
  z-index: 1;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.footer-desc {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.footer-links {
  display: flex;
  gap: 32px;
  margin-bottom: 24px;
}

.footer-link {
  color: var(--text-muted);
  font-size: 0.95rem;
}

.footer-link:hover {
  color: var(--accent-primary);
}

.footer-copy {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.icp-info {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.icp-info a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 0.8rem;
  transition: color 0.3s ease;
}

.icp-info a:hover {
  color: var(--accent-primary);
}

.icp-icon {
  width: 14px;
  height: 14px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .articles-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .articles-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .api-desc {
    display: none;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 1.6rem;
    gap: 6px;
    margin-bottom: 24px;
  }

  .hero-sub {
    font-size: 0.55em;
  }

  .hero-main {
    font-size: 1.2em;
  }

  .hero-actions {
    flex-direction: column;
  }

  .hero-stats {
    gap: 24px;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .articles-grid {
    grid-template-columns: 1fr;
  }

  .api-grid {
    grid-template-columns: 1fr;
  }

  .api-card-row {
    flex-wrap: wrap;
    gap: 6px;
  }

  .api-name {
    max-width: none;
  }

  .api-desc {
    display: none;
  }

  .api-tags {
    order: 1;
  }
  
  .api-section {
    padding: 60px 0;
  }
  
  .api-section .section-title {
    font-size: 1.5rem;
  }
}

.back-to-top {
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 44px;
  height: 44px;
  border: 1px solid var(--border-color);
  border-radius: 50%;
  background: var(--bg-card);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.3s ease;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-to-top:hover {
  color: var(--text-primary);
  border-color: var(--text-muted);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.back-to-top.visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

@media (max-width: 768px) {
  .back-to-top {
    bottom: 24px;
    right: 24px;
    width: 40px;
    height: 40px;
  }
}
</style>
