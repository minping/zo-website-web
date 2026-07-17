<template>
  <div class="about-page" :class="{ 'resume-mode': isResumeMode }">
    <!-- 背景效果 -->
    <div v-if="!isResumeMode" class="bg-grid"></div>
    <div v-if="!isResumeMode" class="bg-glow bg-glow-1"></div>
    <div v-if="!isResumeMode" class="bg-glow bg-glow-2"></div>

    <!-- 导航栏 -->
    <Navbar v-if="!isResumeMode" activeMenu="关于" @navigate="handleNavigate" />

    <!-- 简历模式切换按钮 -->
    <button class="resume-toggle" :class="{ active: isResumeMode }" @click="isResumeMode = !isResumeMode" :title="isResumeMode ? '返回普通模式' : '切换简历模式'">
      <svg v-if="!isResumeMode" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>

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
    <section v-if="!isResumeMode" class="stats-section">
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

    <!-- 项目经历 -->
    <section class="projects-section">
      <div class="container">
        <h2 class="section-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          项目经历
        </h2>
        <div class="projects-list">
          <div class="project-item" v-for="(project, index) in projects" :key="index">
            <div class="project-timeline">
              <span class="project-period">{{ project.startDate }} ~ {{ project.endDate || '至今' }}</span>
            </div>
            <div class="project-detail">
              <h3 class="project-name">{{ project.name }}</h3>
              <span class="project-role">{{ project.role }}</span>
              <p class="project-desc">{{ project.description }}</p>
              <div class="project-tags" v-if="project.tags && project.tags.length">
                <span class="project-tag" v-for="tag in project.tags" :key="tag">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 自研项目 -->
    <section class="self-projects-section">
      <div class="container">
        <h2 class="section-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 18 22 12 16 6"/>
            <polyline points="8 6 2 12 8 18"/>
          </svg>
          自研项目
        </h2>
        <div class="self-projects-grid">
          <div class="self-project-card" v-for="(project, index) in selfProjects" :key="index">
            <div class="self-project-icon" v-if="project.icon">{{ project.icon }}</div>
            <div class="self-project-icon fallback" v-else>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
              </svg>
            </div>
            <h3 class="self-project-name">{{ project.name }}</h3>
            <p class="self-project-desc">{{ project.description }}</p>
            <div class="self-project-tags" v-if="project.tags && project.tags.length">
              <span class="self-project-tag" v-for="tag in project.tags" :key="tag">{{ tag }}</span>
            </div>
            <div class="self-project-links">
              <a v-if="project.demoUrl" :href="project.demoUrl" target="_blank" class="self-project-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                在线演示
              </a>
              <a v-if="project.githubUrl" :href="project.githubUrl" target="_blank" class="self-project-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
                源代码
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 联系方式 -->
    <section v-if="!isResumeMode" class="contact-section">
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
    <Footer v-if="!isResumeMode" />

    <!-- 微信二维码弹窗 -->
    <div v-if="!isResumeMode && showWechatQR" class="qr-modal-overlay" @click.self="showWechatQR = false">
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
const isResumeMode = ref(false)

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

const projects = [
  {
    name: 'Zo 博客系统',
    role: '全栈开发',
    startDate: '2024-03',
    endDate: '',
    description: '基于 Vue 3 + Spring Boot 构建的个人技术博客平台，支持文章管理、API 开放、标签星图等功能。',
    tags: ['Vue 3', 'Spring Boot', 'PostgreSQL', 'MyBatis Plus']
  },
  {
    name: '企业内部管理系统',
    role: '后端开发',
    startDate: '2023-06',
    endDate: '2024-02',
    description: '参与企业级后台管理系统开发，负责权限管理模块、数据报表模块的设计与实现。',
    tags: ['Spring Cloud', 'Redis', 'MySQL', 'RabbitMQ']
  },
  {
    name: '电商数据分析平台',
    role: '前端开发',
    startDate: '2022-09',
    endDate: '2023-05',
    description: '负责数据可视化大屏的前端开发，使用 ECharts 实现实时数据展示与交互。',
    tags: ['React', 'ECharts', 'TypeScript', 'Ant Design']
  }
]

const selfProjects = [
  {
    name: 'Zo 开放 API',
    icon: '🔌',
    description: '面向开发者提供免费开放 API 接口，涵盖各类实用数据服务。',
    tags: ['Vue 3', 'Spring Boot', 'RESTful'],
    demoUrl: '#',
    githubUrl: 'https://github.com/minping'
  },
  {
    name: '星图可视化',
    icon: '✨',
    description: '技术标签知识星图，3D 可视化展示技术栈关联关系。',
    tags: ['D3.js', 'Canvas', 'Vue Composition API'],
    githubUrl: 'https://github.com/minping'
  },
  {
    name: 'Markdown 编辑器',
    icon: '📝',
    description: '基于 Milkdown 的所见即所得 Markdown 编辑器，支持实时预览。',
    tags: ['Milkdown', 'ProseMirror', 'Vue 3'],
    githubUrl: 'https://github.com/minping'
  }
]
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

/* 项目经历 */
.projects-section {
  padding: 0 0 80px;
  position: relative;
  z-index: 1;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.project-item {
  display: flex;
  gap: 28px;
  padding: 20px 0 24px;
  border-left: 2px solid var(--border-color);
  padding-left: 28px;
  position: relative;
}

.project-item:last-child {
  border-left-color: transparent;
}

.project-item::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 24px;
  width: 10px;
  height: 10px;
  background: var(--accent-primary);
  border-radius: 50%;
}

.project-timeline {
  flex-shrink: 0;
  width: 120px;
  padding-top: 2px;
}

.project-period {
  font-size: 13px;
  color: var(--accent-primary);
  font-weight: 500;
}

.project-detail {
  flex: 1;
}

.project-name {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.project-role {
  font-size: 13px;
  color: var(--accent-primary);
  display: block;
  margin-bottom: 8px;
}

.project-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 0 12px 0;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.project-tag {
  padding: 3px 10px;
  background: var(--accent-glow);
  color: var(--accent-primary);
  border-radius: 100px;
  font-size: 12px;
}

/* 自研项目 */
.self-projects-section {
  padding: 0 0 80px;
  position: relative;
  z-index: 1;
}

.self-projects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.self-project-card {
  padding: 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.self-project-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-primary);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.self-project-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--accent-glow);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
  font-size: 22px;
  margin-bottom: 14px;
}

.self-project-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.self-project-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 14px 0;
  flex: 1;
}

.self-project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}

.self-project-tag {
  padding: 3px 10px;
  background: var(--accent-glow);
  color: var(--accent-primary);
  border-radius: 100px;
  font-size: 12px;
}

.self-project-links {
  display: flex;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.self-project-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.3s;
}

.self-project-link:hover {
  color: var(--accent-primary);
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
  
  .self-projects-grid {
    grid-template-columns: repeat(2, 1fr);
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
  
  .project-item {
    flex-direction: column;
    gap: 6px;
  }
  
  .project-timeline {
    width: auto;
  }
  
  .self-projects-grid {
    grid-template-columns: 1fr;
  }
}

/* ========== 简历模式 ========== */
.resume-mode {
  --resume-bg: #ffffff;
  --resume-text: #1a1a2e;
  --resume-text-secondary: #4a4a6a;
  --resume-accent: #4f46e5;
  --resume-border: #e2e8f0;
  --resume-light-bg: #f8fafc;
}

.resume-mode .bg-grid,
.resume-mode .bg-glow {
  display: none;
}

/* 简历模式 - 整体容器 */
.resume-mode {
  background: #f0f2f5;
  min-height: 100vh;
  padding: 40px 0;
}

.resume-mode .container {
  max-width: 820px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 简历纸张效果 */
.resume-mode .about-hero,
.resume-mode .skills-section,
.resume-mode .timeline-section,
.resume-mode .projects-section,
.resume-mode .self-projects-section {
  background: var(--resume-bg);
  margin-bottom: 0;
  padding: 0;
}

.resume-mode .about-hero {
  padding: 48px 48px 0;
  border-radius: 12px 12px 0 0;
}

.resume-mode .skills-section {
  padding: 36px 48px;
  border-bottom: 1px solid var(--resume-border);
}

.resume-mode .timeline-section {
  padding: 36px 48px;
  border-bottom: 1px solid var(--resume-border);
}

.resume-mode .projects-section {
  padding: 36px 48px;
  border-bottom: 1px solid var(--resume-border);
}

.resume-mode .self-projects-section {
  padding: 36px 48px 48px;
  border-radius: 0 0 12px 12px;
}

/* 简历模式 - 头部个人信息 */
.resume-mode .about-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 32px;
  padding: 0 0 32px;
  background: transparent;
  border: none;
  border-bottom: 2px solid var(--resume-accent);
  border-radius: 0;
}

.resume-mode .avatar-ring {
  width: 90px;
  height: 90px;
  padding: 0;
  background: transparent;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--resume-border);
}

.resume-mode .avatar-ring img {
  background: #f1f5f9;
}

.resume-mode .status-dot {
  bottom: 4px;
  right: 4px;
  width: 14px;
  height: 14px;
  border-color: var(--resume-bg);
}

.resume-mode .about-info {
  flex: 1;
}

.resume-mode .about-name {
  font-size: 1.75rem;
  color: var(--resume-text);
  margin-bottom: 4px;
}

.resume-mode .about-title {
  font-size: 1rem;
  color: var(--resume-accent);
  margin-bottom: 10px;
  font-weight: 500;
}

.resume-mode .about-bio {
  font-size: 14px;
  color: var(--resume-text-secondary);
  line-height: 1.7;
  margin-bottom: 14px;
}

/* 简历模式 - 顶部联系方式（紧凑） */
.resume-mode .about-tags {
  display: none;
}

.resume-mode .about-links {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.resume-mode .social-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0;
  background: none;
  border: none;
  color: var(--resume-text-secondary);
  font-size: 13px;
  cursor: default;
  pointer-events: none; /* 简历模式禁止点击 */
}

.resume-mode .social-link svg {
  width: 15px;
  height: 15px;
  color: var(--resume-accent);
}

.resume-mode .social-link:hover {
  color: var(--resume-text-secondary);
  background: none;
  border: none;
}

/* 简历模式 - 区块标题 */
.resume-mode .section-title {
  font-size: 1.15rem;
  color: var(--resume-text);
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--resume-accent);
  gap: 8px;
}

.resume-mode .section-title svg {
  width: 20px;
  height: 20px;
}

/* 简历模式 - 技术栈 */
.resume-mode .skills-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.resume-mode .skill-category {
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0;
}

.resume-mode .skill-category-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--resume-accent);
  margin-bottom: 8px;
}

.resume-mode .skill-items {
  gap: 6px;
}

.resume-mode .skill-item {
  padding: 2px 0;
  background: none;
  color: var(--resume-text-secondary);
  font-size: 13px;
  border-radius: 0;
  cursor: default;
  position: relative;
  padding-left: 14px;
}

.resume-mode .skill-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--resume-accent);
}

.resume-mode .skill-item:hover {
  background: none;
  color: var(--resume-text);
}

/* 简历模式 - 历程 */
.resume-mode .timeline {
  padding-left: 0;
}

.resume-mode .timeline::before {
  display: none;
}

.resume-mode .timeline-item {
  padding: 0 0 12px;
  border-left: none;
  padding-left: 0;
}

.resume-mode .timeline-marker {
  display: none;
}

.resume-mode .timeline-content {
  display: flex;
  gap: 16px;
  align-items: baseline;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0;
}

.resume-mode .timeline-year {
  font-size: 13px;
  font-weight: 600;
  color: var(--resume-accent);
  min-width: 42px;
  margin-bottom: 0;
}

.resume-mode .timeline-text {
  font-size: 14px;
  color: var(--resume-text-secondary);
  line-height: 1.5;
}

/* 简历模式 - 项目经历 */
.resume-mode .projects-list {
  gap: 0;
}

.resume-mode .project-item {
  padding: 0 0 20px;
  border-left: none;
  padding-left: 0;
  display: block;
  position: relative;
}

.resume-mode .project-item:last-child {
  padding-bottom: 0;
}

.resume-mode .project-item::before {
  display: none;
}

.resume-mode .project-timeline {
  width: auto;
  margin-bottom: 4px;
}

.resume-mode .project-period {
  font-size: 13px;
  color: var(--resume-text-secondary);
  font-weight: 400;
}

.resume-mode .project-detail {
  padding: 0;
}

.resume-mode .project-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--resume-text);
  margin-bottom: 2px;
  display: inline;
}

.resume-mode .project-role {
  display: inline;
  font-size: 13px;
  color: var(--resume-accent);
  margin-left: 8px;
}

.resume-mode .project-desc {
  font-size: 13px;
  color: var(--resume-text-secondary);
  line-height: 1.6;
  margin: 6px 0 0;
  padding-left: 14px;
  position: relative;
}

.resume-mode .project-desc::before {
  content: '▸';
  position: absolute;
  left: 0;
  color: var(--resume-accent);
  font-size: 12px;
}

.resume-mode .project-tags {
  margin-top: 8px;
  gap: 12px;
}

.resume-mode .project-tag {
  padding: 0;
  background: none;
  color: var(--resume-text-secondary);
  font-size: 12px;
  border-radius: 0;
}

.resume-mode .project-tag::before {
  content: '#';
  color: var(--resume-accent);
  margin-right: 1px;
}

/* 简历模式 - 自研项目 */
.resume-mode .self-projects-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.resume-mode .self-project-card {
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0;
  display: block;
  transform: none !important;
}

.resume-mode .self-project-card:hover {
  transform: none !important;
  border: none;
  box-shadow: none;
}

.resume-mode .self-project-icon {
  display: none;
}

.resume-mode .self-project-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--resume-text);
  margin-bottom: 2px;
  display: inline;
}

.resume-mode .self-project-desc {
  display: inline;
  font-size: 13px;
  color: var(--resume-text-secondary);
  line-height: 1.6;
}

.resume-mode .self-project-desc::before {
  content: ' — ';
  color: var(--resume-text-secondary);
}

.resume-mode .self-project-tags {
  margin-top: 6px;
  gap: 10px;
}

.resume-mode .self-project-tag {
  padding: 0;
  background: none;
  color: var(--resume-text-secondary);
  font-size: 12px;
  border-radius: 0;
}

.resume-mode .self-project-tag::before {
  content: '#';
  color: var(--resume-accent);
  margin-right: 1px;
}

.resume-mode .self-project-links {
  display: none;
}

/* 简历模式 - 切换按钮 */
.resume-toggle {
  position: fixed;
  top: 20px;
  right: 24px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--bg-secondary, #fff);
  border: 1px solid var(--border-color, #e2e8f0);
  color: var(--text-secondary, #64748b);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: all 0.3s;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.resume-toggle:hover {
  border-color: var(--accent-primary, #4f46e5);
  color: var(--accent-primary, #4f46e5);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}

.resume-toggle.active {
  background: var(--accent-primary, #4f46e5);
  border-color: var(--accent-primary, #4f46e5);
  color: #fff;
}

.resume-toggle.active:hover {
  opacity: 0.9;
}

/* 简历模式 - 响应式 */
@media (max-width: 768px) {
  .resume-mode {
    padding: 16px 0;
  }

  .resume-mode .container {
    padding: 0 12px;
  }

  .resume-mode .about-hero {
    padding: 32px 24px 0;
  }

  .resume-mode .skills-section,
  .resume-mode .timeline-section,
  .resume-mode .projects-section,
  .resume-mode .self-projects-section {
    padding: 24px;
  }

  .resume-mode .about-card {
    flex-direction: row;
    gap: 20px;
  }

  .resume-mode .avatar-ring {
    width: 64px;
    height: 64px;
  }

  .resume-mode .about-name {
    font-size: 1.35rem;
  }

  .resume-mode .about-links {
    gap: 12px;
  }

  .resume-mode .skills-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .resume-mode .resume-toggle {
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
  }
}

@media print {
  .resume-toggle {
    display: none !important;
  }
  
  .resume-mode {
    background: #fff !important;
    padding: 0 !important;
  }
}
</style>
