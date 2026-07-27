<template>
  <AdminLayout>
    <div class="projects-page">
      <header class="content-header">
        <div>
          <h1>项目经历</h1>
          <p>管理工作经历与项目经验</p>
        </div>
        <button class="btn btn-primary" @click="openAddDialog">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          添加经历
        </button>
      </header>

      <!-- 空状态 -->
      <div v-if="projects.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
        <p>暂无项目经历</p>
        <span>点击上方按钮添加你的项目经验</span>
      </div>

      <!-- 项目列表 -->
      <div v-else class="project-list">
        <div v-for="(project, index) in projects" :key="project.id || index" class="project-card" @click="openEditDialog(project)">
          <!-- 封面缩略图 -->
          <div class="card-thumb" v-if="project.image">
            <img :src="project.image" :alt="project.name" />
          </div>
          <div class="card-body">
            <div class="project-header">
              <h3>{{ project.name }}</h3>
              <span class="project-period">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {{ project.startDate }} ~ {{ project.endDate }}
              </span>
            </div>
            <div class="project-role-badge">{{ project.role }}</div>
            <p class="project-desc">{{ project.description }}</p>
            <div class="card-footer">
              <div class="card-left">
                <div class="project-meta" v-if="project.acceptance || project.userBase">
                  <span v-if="project.acceptance" class="meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    验收：{{ project.acceptance }}
                  </span>
                  <span v-if="project.userBase" class="meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    用户：{{ project.userBase }}
                  </span>
                </div>
                <div class="project-tags" v-if="project.tags && project.tags.length">
                  <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>
              </div>
              <div class="card-right">
                <span class="card-edit-hint">点击编辑</span>
                <button class="btn-delete-icon" @click.stop="handleDelete(index)" title="删除">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Toast 提示 -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </Transition>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from './AdminLayout.vue'
import api from '../../api/article.js'

const router = useRouter()

// Toast
const toast = ref({ show: false, message: '', type: 'success' })
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 2500)
}

const projects = ref([])

onMounted(() => {
  loadProjects()
})

const loadProjects = async () => {
  try {
    const res = await api.getProjectList()
    // 兼容多种响应格式
    if (res.success || res.code === 200 || res.code === 0) {
      projects.value = res.data || []
    } else if (res.data) {
      projects.value = res.data
    }
    console.log('项目列表:', res, projects.value)
  } catch (e) {
    console.error('加载项目列表失败:', e)
    showToast('加载项目列表失败', 'error')
  }
}

const openAddDialog = () => {
  router.push('/admin/projects/form')
}

const openEditDialog = (project) => {
  router.push(`/admin/projects/form?id=${project.id}`)
}

const handleDelete = (index) => {
  if (confirm('确定要删除这条项目经历吗？')) {
    projects.value.splice(index, 1)
    // TODO: 同步到后端
  }
}
</script>

<style scoped src="./AdminProjects.css"></style>
