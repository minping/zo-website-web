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
              <img :src="aboutInfo.avatar" :alt="aboutInfo.name" />
            </div>
            <span class="status-dot"></span>
          </div>
          <div class="about-info">
            <h1 class="about-name">{{ aboutInfo.name }}</h1>
              <p class="about-title">{{ aboutInfo.title }}</p>
              <p v-if="aboutInfo.workTime" class="about-work-time">工作年限：{{ aboutInfo.workTime }}</p>
              <p class="about-bio">{{ aboutInfo.bio }}</p>
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
          <div class="skill-category" v-for="category in aboutSkillCategories" :key="category.name"
               :style="{ '--cat-accent': category.accent, '--cat-bg': category.bg }">
            <div class="skill-category-header">
              <span class="skill-category-icon">
                <!-- 前端图标 -->
                <svg v-if="category.icon === 'frontend'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/>
                </svg>
                <!-- 后端图标 -->
                <svg v-else-if="category.icon === 'backend'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
                </svg>
                <!-- DevOps图标 -->
                <svg v-else-if="category.icon === 'devops'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                </svg>
                <!-- 工具图标 -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M2 12h2"/><path d="M20 12h2"/>
                </svg>
              </span>
              <h3 class="skill-category-name">{{ category.name }}</h3>
              <span class="skill-category-count">{{ category.skills.length }}</span>
            </div>
            <div class="skill-items">
              <span class="skill-item" v-for="skill in category.skills" :key="skill">
                <span class="skill-dot"></span>
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
          <div class="timeline-item" v-for="(item, index) in aboutTimeline" :key="index">
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
        <p class="project-disclaimer">以下均为公司非保密项目，项目名称、图标等信息均为对外开放网站获得，不涉及不透露公司保密信息、甲方敏感信息</p>
        <div class="projects-list">
          <div class="project-item" v-for="(project, index) in visibleProjects" :key="index">
            <div class="project-timeline">
              <span class="project-period">{{ project.startDate }} ~ {{ project.endDate }}</span>
            </div>
            <div class="project-image-col">
              <img v-if="project.image" :src="project.image" :alt="project.name" class="project-thumb" />
              <div v-else class="project-thumb-placeholder" :style="{ background: getGradient(index) }">
                <span class="project-thumb-initial">{{ project.name[0] }}</span>
              </div>
            </div>
            <div class="project-detail">
              <h3 class="project-name">{{ project.name }}</h3>
              <span class="project-role">{{ project.role }}</span>
              <div class="project-meta" v-if="project.acceptance || project.userBase">
                <span v-if="project.acceptance" class="project-meta-item acceptance">
                  <span class="meta-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                  </span>
                  <span class="meta-label">验收情况</span>
                  <span class="meta-value" :class="{ accepted: project.acceptance.includes('已验收') }">{{ project.acceptance }}</span>
                </span>
                <span v-if="project.userBase" class="project-meta-item users">
                  <span class="meta-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16c0-2.2-1.8-4-4-4s-4 1.8-4 4"/><circle cx="12" cy="9" r="3"/></svg>
                  </span>
                  <span class="meta-label">用户基数</span>
                  <span class="meta-value">{{ project.userBase }}</span>
                </span>
              </div>
              <p class="project-desc" v-html="formatDescription(project.description)"></p>
              <div class="project-tags" v-if="project.tags && project.tags.length">
                <span class="project-tag" v-for="tag in project.tags" :key="tag">{{ tag }}</span>
              </div>
            </div>

          </div>
        </div>
        <button v-if="projects.length > 2" class="projects-expand-btn" @click="showAllProjects = !showAllProjects">
          {{ showAllProjects ? '收起' : '展开更多' }}
          <svg class="expand-arrow" :class="{ expanded: showAllProjects }" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
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
            <div class="self-project-icon" v-if="project.icon">
              <img v-if="isImageUrl(project.icon)" :src="project.icon" :alt="project.name" class="self-project-icon-img" />
              <span v-else>{{ project.icon }}</span>
            </div>
            <div class="self-project-icon fallback" v-else>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
              </svg>
            </div>
            <h3 class="self-project-name">{{ project.name }}</h3>
            <p class="self-project-desc" v-html="formatDescription(project.description)"></p>
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
          <a v-if="aboutInfo.email" :href="'mailto:' + aboutInfo.email" class="contact-card">
            <div class="contact-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <span class="contact-label">邮箱</span>
            <span class="contact-value">{{ aboutInfo.email }}</span>
          </a>
          <div class="contact-card clickable" @click="showWechatQR = true">
            <div class="contact-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <span class="contact-label">微信</span>
            <span class="contact-value">扫码添加</span>
          </div>
          <a v-if="aboutInfo.github" :href="aboutInfo.github" target="_blank" class="contact-card">
            <div class="contact-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
              </svg>
            </div>
            <span class="contact-label">GitHub</span>
            <span class="contact-value">{{ aboutInfo.github.replace('https://github.com/', '@') }}</span>
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
import { ref, computed, onMounted } from 'vue'
import { api } from '../api/article'

const showWechatQR = ref(false)
const isResumeMode = ref(false)
const loading = ref(false)

// 格式化描述文本：转换换行 + 高亮 **标记**
const formatDescription = (text) => {
  if (!text) return ''
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const withBreaks = escaped.replace(/\n/g, '<br>')
  const withHighlights = withBreaks.replace(/\*\*(.+?)\*\*/g, '<strong class="highlight">$1</strong>')
  return withHighlights
}

// 博主基础信息
const aboutInfo = ref({
  name: '',
  title: '',
  bio: '',
  avatar: '',
  github: '',
  email: '',
  workTime: ''
})

const aboutSkillCategories = ref([])
const aboutTimeline = ref([])

const projects = ref([])
const showAllProjects = ref(false)
const visibleProjects = computed(() => showAllProjects.value ? projects.value : projects.value.slice(0, 2))

const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
]

const getGradient = (index) => gradients[index % gradients.length]

const selfProjects = ref([])

const toArray = (val) => {
  if (!val) return []
  if (Array.isArray(val)) return val
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean)
  return []
}

const isImageUrl = (val) => {
  if (!val || typeof val !== 'string') return false
  return /^https?:\/\//.test(val) || /\.(png|jpg|jpeg|gif|svg|webp)(\?.*)?$/i.test(val)
}

const loadAboutMe = async () => {
  loading.value = true
  try {
    const res = await api.getAboutMe()
    if (res.success && res.data) {
      const d = res.data
      // 基础信息
      if (d.info) {
        aboutInfo.value = {
          name: d.info.name || '',
          title: d.info.post || '',
          bio: d.info.self || '',
          avatar: d.info.avatar || '',
          github: d.info.github || '',
          email: d.info.email || '',
          workTime: d.info.work_time || ''
        }
        // 技术栈 - 分类配置
        const categoryConfig = {
          '前端': { icon: 'frontend', accent: '#3b82f6', bg: 'rgba(59,130,246,0.06)' },
          '后端': { icon: 'backend', accent: '#10b981', bg: 'rgba(16,185,129,0.06)' },
          'DevOps': { icon: 'devops', accent: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },
          '工具': { icon: 'tools', accent: '#8b5cf6', bg: 'rgba(139,92,246,0.06)' }
        }
        aboutSkillCategories.value = [
          { name: '前端', skills: toArray(d.info.frontend) },
          { name: '后端', skills: toArray(d.info.backend) },
          { name: 'DevOps', skills: toArray(d.info.devops) },
          { name: '工具', skills: toArray(d.info.tools) }
        ].map(cat => ({
          ...cat,
          icon: categoryConfig[cat.name]?.icon || 'tools',
          accent: categoryConfig[cat.name]?.accent || '#8b5cf6',
          bg: categoryConfig[cat.name]?.bg || 'rgba(139,92,246,0.06)'
        })).filter(cat => cat.skills.length > 0)
      }
      // 历程
      if (d.processList && d.processList.length > 0) {
        aboutTimeline.value = d.processList.map(item => ({
          year: item.time || '',
          event: item.event || ''
        }))
      }
      // 项目经历
      if (d.projectList && d.projectList.length > 0) {
        projects.value = [...d.projectList].reverse().map(item => ({
          id: item.id,
          name: item.name,
          role: item.role,
          description: item.description,
          tags: toArray(item.tech || item.tags),
          image: item.image || '',
          startDate: item.start_time || '',
          endDate: item.end_time || '',
          acceptance: item.finish_status || '',
          userBase: item.user_num || '',
        }))
      }
      // 自研项目
      if (d.productList && d.productList.length > 0) {
        selfProjects.value = d.productList.map(item => ({
          id: item.id,
          name: item.name,
          icon: item.img || '',
          description: item.description,
          demoUrl: item.play_url || '',
          githubUrl: item.github_url || '',
          tags: toArray(item.tags)
        }))
      }
    }
  } catch (err) {
    console.error('加载关于信息失败:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAboutMe()
})

const handleNavigate = (menu) => {
  console.log('Navigate to:', menu)
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
  margin: 0 0 8px;
}

.about-work-time {
  font-size: 0.9rem;
  color: var(--text-secondary);
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
  gap: 20px;
}

.skill-category {
  padding: 24px;
  background: var(--cat-bg, var(--bg-secondary));
  border: 1px solid var(--border-color);
  border-radius: 16px;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.skill-category::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--cat-accent);
  border-radius: 16px 16px 0 0;
  opacity: 0;
  transition: opacity 0.35s ease;
}

.skill-category:hover {
  border-color: var(--cat-accent, var(--accent-primary));
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
}

.skill-category:hover::before {
  opacity: 1;
}

.skill-category-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.skill-category-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--cat-accent);
  color: #fff;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.skill-category:hover .skill-category-icon {
  transform: scale(1.05);
}

.skill-category-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
}

.skill-category-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 7px;
  border-radius: 12px;
  background: var(--cat-accent);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
  line-height: 1;
}

.skill-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: var(--bg-tertiary);
  border: 1px solid transparent;
  border-radius: 20px;
  font-size: 13px;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  cursor: default;
  white-space: nowrap;
}

.skill-item:hover {
  background: var(--cat-bg, var(--accent-glow));
  border-color: var(--cat-accent, var(--accent-primary));
  color: var(--cat-accent, var(--accent-primary));
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.skill-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cat-accent);
  flex-shrink: 0;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.skill-item:hover .skill-dot {
  opacity: 1;
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

.project-disclaimer {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin-top: 8px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: var(--bg-page);
  border-left: 3px solid var(--accent-primary);
  border-radius: 0 8px 8px 0;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.projects-expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  margin: 24px 0 0;
  padding: 8px 0;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.projects-expand-btn::before,
.projects-expand-btn::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
  transition: background 0.2s ease;
}

.projects-expand-btn::before {
  margin-right: 14px;
}

.projects-expand-btn::after {
  margin-left: 14px;
}

.projects-expand-btn:hover {
  color: var(--accent-primary);
}

.projects-expand-btn:hover::before,
.projects-expand-btn:hover::after {
  background: var(--accent-primary);
}

.expand-arrow {
  transition: transform 0.25s ease;
}

.expand-arrow.expanded {
  transform: rotate(180deg);
}

.project-item {
  display: flex;
  align-items: flex-start;
  gap: 24px;
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
  transition: all 0.3s ease;
}

.project-item:hover::before {
  box-shadow: 0 0 0 4px var(--accent-glow);
}

.project-timeline {
  flex-shrink: 0;
  width: 110px;
  padding-top: 2px;
}

.project-period {
  font-size: 0.8rem;
  color: var(--accent-primary);
  font-weight: 500;
  white-space: nowrap;
}

.project-detail {
  flex: 1;
  min-width: 0;
}

.project-name {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.project-role {
  font-size: 0.8rem;
  color: var(--accent-primary);
  display: block;
  margin-bottom: 8px;
}

.project-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 14px;
}

.project-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.88rem;
  color: var(--text-secondary);
}

.project-meta-item .meta-icon {
  display: flex;
  flex-shrink: 0;
}

.project-meta-item.acceptance .meta-icon,
.project-meta-item.users .meta-icon {
  color: var(--text-tertiary);
}

.project-meta-item.users .meta-value {
  font-weight: 700;
  color: var(--accent-color, #6366f1);
  background: rgba(99, 102, 241, 0.1);
  padding: 1px 4px;
  border-radius: 3px;
}

.project-meta-item .meta-label {
  color: var(--text-tertiary);
  margin-right: 2px;
}

.project-meta-item .meta-value {
  font-weight: 600;
  color: var(--text-primary);
}

.project-meta-item.acceptance .meta-value {
  color: #3b82f6;
}

.project-meta-item.acceptance .meta-value.accepted {
  color: #059669;
}

.project-desc {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 0 12px 0;
}

.project-desc :deep(.highlight),
.self-project-desc :deep(.highlight) {
  font-weight: 700;
  color: var(--accent-color, #6366f1);
  background: rgba(99, 102, 241, 0.1);
  padding: 1px 4px;
  border-radius: 3px;
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
  font-size: 0.78rem;
  transition: all 0.2s;
}

.project-tag:hover {
  background: var(--accent-primary);
  color: #fff;
}

/* 项目图片 */
.project-image-col {
  flex-shrink: 0;
  width: 180px;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-thumb {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.project-thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-thumb-initial {
  font-size: 2.5rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.5);
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
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
  overflow: hidden;
}

.self-project-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
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
  justify-content: space-between;
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
  
  .about-tags {
    justify-content: center;
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
  
  .contact-cards {
    grid-template-columns: 1fr;
  }
  
  .project-item {
    flex-direction: column;
    gap: 8px;
  }
  
  .project-timeline {
    width: auto;
  }
  
  .project-image-col {
    width: 100%;
    height: 140px;
    align-self: stretch;
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

.resume-mode .projects-expand-btn {
  margin-left: 0;
}

.resume-mode .project-item {
  padding: 0 0 20px;
  border-left: none;
  padding-left: 0;
  display: block;
}

.resume-mode .project-item::before {
  display: none;
}

.resume-mode .project-item:last-child {
  padding-bottom: 0;
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

.resume-mode .project-tag:hover {
  background: none;
  color: var(--resume-text-secondary);
}

.resume-mode .project-image-col {
  display: none;
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
