<template>
  <div class="about-page">
    <!-- 背景效果 -->
    <div class="bg-grid"></div>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>

    <!-- 导航栏 -->
    <Navbar activeMenu="关于" @navigate="handleNavigate" />

    <!-- 关于博主 -->
    <section class="about-hero">
      <div class="container">
        <div class="about-card">
          <div class="about-avatar">
            <div class="avatar-ring">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=zode" alt="Zode" />
            </div>
            <span class="status-dot"></span>
          </div>
          <div class="about-info">
            <h1 class="about-name">Zode</h1>
            <p class="about-title">全栈开发工程师 / 技术博主</p>
            <p class="about-bio">
              热爱技术，专注于 Web 开发领域。喜欢探索新技术，分享编程心得。
              相信代码改变世界，用技术创造价值。
            </p>
            <div class="about-tags">
              <span class="tag" v-for="skill in skills" :key="skill">{{ skill }}</span>
            </div>
            <div class="about-links">
              <a href="https://github.com/minping" target="_blank" class="social-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
                GitHub
              </a>
              <a href="#" class="social-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
                微博
              </a>
              <button class="social-link" @click="showWechatQR = true">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                微信
              </button>
              <a href="mailto:1974463992@qq.com" class="social-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                邮箱
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 数据统计 -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card clickable" @click="goToArticles">
            <div class="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <span class="stat-value">{{ stats.articles }}</span>
            <span class="stat-label">原创文章</span>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
              </svg>
            </div>
            <span class="stat-value">{{ stats.apis }}</span>
            <span class="stat-label">开放 API</span>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span class="stat-value">{{ stats.visitors }}</span>
            <span class="stat-label">访问用户</span>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <span class="stat-value">{{ stats.days }}</span>
            <span class="stat-label">运营天数</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 技术栈 -->
    <section class="skills-section">
      <div class="container">
        <h2 class="section-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2"/>
            <polyline points="2 17 12 22 22 17"/>
            <polyline points="2 12 12 17 22 12"/>
          </svg>
          技术栈
        </h2>
        <div class="skills-grid">
          <div class="skill-category" v-for="category in skillCategories" :key="category.name">
            <h3 class="skill-category-name">{{ category.name }}</h3>
            <div class="skill-items">
              <span class="skill-item" v-for="skill in category.skills" :key="skill">
                {{ skill }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 时间线 -->
    <section class="timeline-section">
      <div class="container">
        <h2 class="section-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          历程
        </h2>
        <div class="timeline">
          <div class="timeline-item" v-for="(item, index) in timeline" :key="index">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <span class="timeline-year">{{ item.year }}</span>
              <p class="timeline-text">{{ item.event }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 联系方式 -->
    <section class="contact-section">
      <div class="container">
        <h2 class="section-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          联系我
        </h2>
        <div class="contact-cards">
          <a href="mailto:1974463992@qq.com" class="contact-card">
            <div class="contact-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <span class="contact-label">邮箱</span>
            <span class="contact-value">1974463992@qq.com</span>
          </a>
          <div class="contact-card clickable" @click="showWechatQR = true">
            <div class="contact-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <span class="contact-label">微信</span>
            <span class="contact-value">Mek </span>
          </div>
          <a href="https://github.com/minping" target="_blank" class="contact-card">
            <div class="contact-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
              </svg>
            </div>
            <span class="contact-label">GitHub</span>
            <span class="contact-value">@minping</span>
          </a>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <Footer />

    <!-- 微信二维码弹窗 -->
    <div v-if="showWechatQR" class="qr-modal-overlay" @click.self="showWechatQR = false">
      <div class="qr-modal">
        <div class="qr-modal-header">
          <h3>扫码添加微信</h3>
          <button class="qr-close-btn" @click="showWechatQR = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="qr-modal-body">
          <img src="/images/wechat.png" alt="微信二维码" class="qr-image" />
          <p class="qr-tip">打开微信扫一扫</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from './Navbar.vue'
import Footer from './Footer.vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()
const showWechatQR = ref(false)

const skills = ['Vue.js', 'React', 'Node.js', 'Python', 'Go', 'Docker']

const stats = {
  articles: 48,
  apis: 8,
  visitors: '10K+',
  days: 365
}

const skillCategories = [
  {
    name: '前端',
    skills: ['Vue.js', 'React', 'TypeScript', 'Tailwind CSS', 'Vite']
  },
  {
    name: '后端',
    skills: ['Node.js', 'Python', 'Go', 'PostgreSQL', 'Redis']
  },
  {
    name: 'DevOps',
    skills: ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Nginx']
  },
  {
    name: '工具',
    skills: ['Git', 'GitHub Actions', 'VS Code', 'Figma', 'Postman']
  }
]

const timeline = [
  { year: '2024', event: '开始写博客，分享技术文章' },
  { year: '2023', event: '创建开放 API 平台' },
  { year: '2022', event: '从传统行业转型到互联网' },
  { year: '2020', event: '学习编程，开始开发 Web 应用' }
]

const handleNavigate = (menu) => {
  console.log('Navigate to:', menu)
}

const goToArticles = () => {
  router.push('/articles')
}
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  position: relative;
}

/* 背景效果 */
.bg-grid {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
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
  opacity: 0.15;
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

/* 关于博主 */
.about-hero {
  padding: 140px 0 80px;
  position: relative;
  z-index: 1;
}

.about-card {
  display: flex;
  gap: 48px;
  padding: 40px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  align-items: center;
}

.about-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-ring {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  padding: 4px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
}

.avatar-ring img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--bg-primary);
}

.status-dot {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 20px;
  height: 20px;
  background: #10b981;
  border: 4px solid var(--bg-secondary);
  border-radius: 50%;
}

.about-info {
  flex: 1;
}

.about-name {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.about-title {
  font-size: 1rem;
  color: var(--accent-primary);
  margin: 0 0 16px;
}

.about-bio {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.8;
  margin: 0 0 20px;
}

.about-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.tag {
  padding: 6px 14px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  font-size: 13px;
  color: var(--text-secondary);
}

.about-links {
  display: flex;
  gap: 12px;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s;
}

.social-link:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  background: var(--accent-glow);
}

/* 数据统计 */
.stats-section {
  padding: 0 0 80px;
  position: relative;
  z-index: 1;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-primary);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-glow);
  border-radius: 12px;
  color: var(--accent-primary);
  margin-bottom: 16px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 技术栈 */
.skills-section {
  padding: 0 0 80px;
  position: relative;
  z-index: 1;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 32px;
}

.section-title svg {
  color: var(--accent-primary);
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.skill-category {
  padding: 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

.skill-category-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px;
}

.skill-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-item {
  padding: 6px 14px;
  background: var(--bg-tertiary);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  transition: all 0.3s;
  cursor: default;
}

.skill-item:hover {
  background: var(--accent-glow);
  color: var(--accent-primary);
}

/* 时间线 */
.timeline-section {
  padding: 0 0 80px;
  position: relative;
  z-index: 1;
}

.timeline {
  position: relative;
  padding-left: 32px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: var(--border-color);
}

.timeline-item {
  position: relative;
  padding-bottom: 32px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-marker {
  position: absolute;
  left: -32px;
  top: 6px;
  width: 14px;
  height: 14px;
  background: var(--bg-primary);
  border: 3px solid var(--accent-primary);
  border-radius: 50%;
}

.timeline-content {
  padding: 16px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.timeline-year {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-primary);
  display: block;
  margin-bottom: 6px;
}

.timeline-text {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

/* 联系方式 */
.contact-section {
  padding: 0 0 100px;
  position: relative;
  z-index: 1;
}

.contact-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.contact-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.3s;
}

.contact-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-primary);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.contact-card.clickable {
  cursor: pointer;
}

.contact-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-glow);
  border-radius: 14px;
  color: var(--accent-primary);
  margin-bottom: 16px;
}

.contact-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.contact-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 微信二维码弹窗 */
.qr-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.qr-modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  width: 300px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.qr-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.qr-modal-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.qr-close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border: none;
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.qr-close-btn:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.qr-modal-body {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-image {
  width: 200px;
  height: 200px;
  object-fit: contain;
  border-radius: 8px;
  background: white;
  padding: 8px;
}

.qr-tip {
  margin: 16px 0 0;
  font-size: 14px;
  color: var(--text-secondary);
}

/* 响应式 */
@media (max-width: 992px) {
  .about-card {
    flex-direction: column;
    text-align: center;
  }
  
  .about-tags,
  .about-links {
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .skills-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .about-hero {
    padding: 120px 0 60px;
  }
  
  .about-name {
    font-size: 1.5rem;
  }
  
  .avatar-ring {
    width: 120px;
    height: 120px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .contact-cards {
    grid-template-columns: 1fr;
  }
  
  .about-links {
    flex-direction: column;
  }
  
  .social-link {
    justify-content: center;
  }
}
</style>
