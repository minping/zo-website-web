<template>
  <AdminLayout>
    <div class="article-management">
      <header class="content-header">
        <div class="header-left">
          <h1>文章管理</h1>
          <p>管理所有文章内容</p>
        </div>
      </header>

      <div class="menu-cards">
        <div class="menu-card" @click="$router.push('/admin/drafts')">
          <div class="card-icon draft-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
          <div class="card-info">
            <h3>草稿箱</h3>
            <p>编写和编辑文章草稿</p>
          </div>
          <svg class="card-arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>

        <div class="menu-card" @click="$router.push('/admin/published')">
          <div class="card-icon published-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div class="card-info">
            <h3>已发布</h3>
            <p>查看和管理已发布的文章</p>
          </div>
          <svg class="card-arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>

        <div class="menu-card" @click="$router.push('/admin/editor')">
          <div class="card-icon new-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
          <div class="card-info">
            <h3>新建文章</h3>
            <p>创建一篇新文章</p>
          </div>
          <svg class="card-arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from './AdminLayout.vue'
</script>

<style scoped>
.article-management {
  --admin-bg-primary: #0f0f23;
  --admin-bg-card: #1a1a2e;
  --admin-border-color: #2d2d44;
  --admin-text-primary: #e4e4e7;
  --admin-text-secondary: #a1a1aa;
  --admin-accent-primary: #6366f1;
  
  max-width: 900px;
}

.content-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 40px;
}

.header-left h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--admin-text-primary);
  margin-bottom: 4px;
}

.header-left p {
  color: var(--admin-text-secondary);
  font-size: 14px;
}

.menu-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.menu-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px 28px;
  background: var(--admin-bg-card);
  border: 1px solid var(--admin-border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.menu-card:hover {
  border-color: var(--admin-accent-primary);
  background: rgba(99, 102, 241, 0.08);
  transform: translateX(4px);
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.draft-icon {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.published-icon {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.new-icon {
  background: rgba(99, 102, 241, 0.15);
  color: var(--admin-accent-primary);
}

.card-info {
  flex: 1;
}

.card-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--admin-text-primary);
  margin-bottom: 4px;
}

.card-info p {
  font-size: 13px;
  color: var(--admin-text-secondary);
}

.card-arrow {
  color: var(--admin-text-secondary);
  flex-shrink: 0;
  transition: transform 0.3s;
}

.menu-card:hover .card-arrow {
  transform: translateX(4px);
  color: var(--admin-accent-primary);
}
</style>
