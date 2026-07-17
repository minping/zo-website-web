<template>
  <AdminLayout>
    <div class="my-info-page">
      <header class="content-header">
        <div>
          <h1>我的信息</h1>
          <p>管理个人基本信息</p>
        </div>
      </header>

      <div class="form-card">
        <div class="form-section">
          <h2 class="section-title">基本信息</h2>
          <div class="form-group">
            <label>姓名</label>
            <input v-model="form.name" type="text" class="input" placeholder="请输入姓名" />
          </div>
          <div class="form-group">
            <label>职位</label>
            <input v-model="form.title" type="text" class="input" placeholder="请输入职位" />
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <input v-model="form.email" type="email" class="input" placeholder="请输入邮箱" />
          </div>
          <div class="form-group">
            <label>GitHub</label>
            <input v-model="form.github" type="url" class="input" placeholder="请输入 GitHub 主页地址" />
          </div>
          <div class="form-group">
            <label>个人简介</label>
            <textarea v-model="form.bio" class="input textarea" rows="4" placeholder="请输入个人简介"></textarea>
          </div>
          <div class="form-group">
            <label>头像</label>
            <div class="avatar-upload">
              <div class="avatar-preview" v-if="form.avatar">
                <img :src="form.avatar" alt="头像预览" />
              </div>
              <input v-model="form.avatar" type="url" class="input" placeholder="请输入头像 URL" />
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" @click="handleSave">保存</button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'

const form = ref({
  name: '',
  title: '',
  email: '',
  github: '',
  bio: '',
  avatar: ''
})

onMounted(() => {
  loadMyInfo()
})

const loadMyInfo = () => {
  // TODO: 从后端加载个人信息
}

const handleSave = () => {
  // TODO: 保存到后端
  console.log('保存个人信息:', form.value)
}
</script>

<style scoped>
.my-info-page {
  max-width: 720px;
}

.content-header {
  margin-bottom: 24px;
}

.content-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--admin-text-primary);
  margin: 0 0 4px 0;
}

.content-header p {
  color: var(--admin-text-secondary);
  font-size: 14px;
  margin: 0;
}

.form-card {
  background: var(--admin-bg-card);
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  padding: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--admin-text-primary);
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--admin-border);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--admin-text-primary);
  margin-bottom: 6px;
}

.input {
  width: 100%;
  padding: 10px 14px;
  background: var(--admin-bg-input);
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  color: var(--admin-text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.input:focus {
  border-color: #6366f1;
}

.textarea {
  resize: vertical;
  min-height: 100px;
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--admin-border);
  flex-shrink: 0;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--admin-border);
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #6366f1;
  color: #fff;
}

.btn-primary:hover {
  background: #4f46e5;
}
</style>
