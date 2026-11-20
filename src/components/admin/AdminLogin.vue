<template>
  <div class="login-container" :class="{ 'is-embedded': embedded }">
    <!-- 背景效果（与全站主题一致）：弹窗嵌入模式不需要 -->
    <template v-if="!embedded">
      <div class="bg-glow bg-glow-1"></div>
      <div class="bg-glow bg-glow-2"></div>
    </template>

    <div class="login-card">
      <!-- 弹窗模式：右上角关闭 -->
      <button v-if="embedded" type="button" class="login-close" aria-label="关闭" @click="emit('close')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M18 6L6 18"/>
          <path d="M6 6l12 12"/>
        </svg>
      </button>

      <!-- 品牌区 -->
      <div class="login-head">
        <span class="login-badge" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2l8 4v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6l8-4z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
        </span>
        <h1 class="login-title">登录即可创建独属于你的博客内容</h1>
        <p class="login-sub">将博客内容转为可运行代码 提升学习效率</p>
      </div>

      <!-- 登录 / 注册 切换（文字式，非按钮） -->
      <div class="mode-switch">
        <button
          type="button"
          class="mode-text"
          :class="{ 'is-active': isLogin }"
          :aria-selected="isLogin"
          @click="switchMode('login')"
        >
          登录
        </button>
        <button
          type="button"
          class="mode-text"
          :class="{ 'is-active': !isLogin }"
          :aria-selected="!isLogin"
          @click="switchMode('register')"
        >
          注册
        </button>
      </div>

      <!-- ========== 登录 ========== -->
      <form v-if="isLogin" class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名：</label>
          <div class="input-wrap">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <input
              id="username"
              v-model="form.username"
              type="text"
              placeholder="请输入用户名"
              autocomplete="username"
              :disabled="loading"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">密码：</label>
          <div class="input-wrap">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              autocomplete="current-password"
              :disabled="loading"
            />
          </div>
        </div>

        <transition name="shake">
          <div v-if="error" class="login-error">
            <svg class="login-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 8v5"/>
              <path d="M12 16.5v.01"/>
            </svg>
            <span>{{ error }}</span>
          </div>
        </transition>

        <transition name="shake">
          <div v-if="success" class="login-success">
            <svg class="login-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9"/>
              <path d="M8 12.5l2.5 2.5L16 9.5"/>
            </svg>
            <span>{{ success }}</span>
          </div>
        </transition>

        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          <span v-else>登 录</span>
        </button>
      </form>

      <!-- ========== 注册 ========== -->
      <form v-else class="login-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="reg-username">用户名：</label>
          <div class="input-wrap">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <input
              id="reg-username"
              v-model="regForm.username"
              type="text"
              placeholder="请输入用户名"
              autocomplete="username"
              :disabled="loading"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="reg-phone">手机号：</label>
          <div class="input-wrap">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="5" y="2" width="14" height="20" rx="2"/>
              <path d="M11 18.5h2"/>
            </svg>
            <input
              id="reg-phone"
              v-model="regForm.phone"
              type="tel"
              inputmode="numeric"
              maxlength="11"
              placeholder="请输入 11 位手机号"
              autocomplete="tel"
              :disabled="loading"
            />
          </div>
        </div>

        <div class="form-group">
          <label>性别：</label>
          <div class="sex-group">
            <label class="sex-option" :class="{ 'is-active': regForm.sex === SEX_MALE }">
              <input v-model="regForm.sex" type="radio" name="sex" :value="SEX_MALE" :disabled="loading" />
              <svg class="sex-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="10.5" cy="13.5" r="5"/>
                <path d="M14.5 9.5l6-6"/>
                <path d="M17.5 3.5h3v3"/>
              </svg>
              <span>男</span>
            </label>
            <label class="sex-option" :class="{ 'is-active': regForm.sex === SEX_FEMALE }">
              <input v-model="regForm.sex" type="radio" name="sex" :value="SEX_FEMALE" :disabled="loading" />
              <svg class="sex-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="9" r="5"/>
                <path d="M12 14v7"/>
                <path d="M9 18h6"/>
              </svg>
              <span>女</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label for="reg-password">密码：</label>
          <div class="input-wrap">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              id="reg-password"
              v-model="regForm.password"
              type="password"
              placeholder="请设置密码（至少 6 位）"
              autocomplete="new-password"
              :disabled="loading"
            />
          </div>
        </div>

        <transition name="shake">
          <div v-if="error" class="login-error">
            <svg class="login-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 8v5"/>
              <path d="M12 16.5v.01"/>
            </svg>
            <span>{{ error }}</span>
          </div>
        </transition>

        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          <span v-else>注 册</span>
        </button>
      </form>

      <div v-if="!embedded || !isLogin" class="login-footer">
        <a v-if="isLogin" class="back-link" href="/">
          <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M19 12H5"/>
            <path d="M12 19l-7-7 7-7"/>
          </svg>
          返回首页
        </a>
        <a v-else class="back-link" href="#" @click.prevent="switchMode('login')">已有账号？去登录</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '../../composables/useTheme.js'
import api from '../../api/article.js'

// 接入全站主题：登录页与前台页面保持同一套配色（含服务端保存的主题）
useTheme()

const router = useRouter()

const props = defineProps({
  // 弹窗嵌入模式：只渲染中间的卡片，不带整页背景层
  embedded: { type: Boolean, default: false }
})

const emit = defineEmits(['success', 'close'])

// 性别取值（后端暂定：1 男 / 2 女）
const SEX_MALE = 1
const SEX_FEMALE = 2

// 登录 / 注册 模式切换
const mode = ref('login')
const isLogin = computed(() => mode.value === 'login')

const switchMode = (m) => {
  mode.value = m
  error.value = ''
  success.value = ''
}

const form = reactive({
  username: '',
  password: ''
})

const regForm = reactive({
  username: '',
  phone: '',
  sex: SEX_MALE,
  password: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')

const handleLogin = async () => {
  error.value = ''
  success.value = ''

  if (!form.username || !form.password) {
    error.value = '请输入用户名和密码'
    return
  }

  loading.value = true

  try {
    // 真实登录：POST /user/login/userLogin
    const res = await api.userLogin({
      loginName: form.username.trim(),
      password: form.password,
      loginType: 'account'
    })
    const ok = !!(res && (res.success === true || res.code === 200 || res.code === 0))
    if (!ok) {
      error.value = (res && (res.msg || res.message)) || '用户名或密码错误'
      return
    }

    const data = res.data && typeof res.data === 'object' ? res.data : {}
    const token = data.authorizationToken || ''
    const user = data.user && typeof data.user === 'object' ? data.user : {}
    if (!token) {
      error.value = '登录成功但未返回授权信息，请稍后重试'
      return
    }

    // 保存授权 token 与基础用户信息（后续所有请求在 header 带上 authorization_token）
    localStorage.setItem('authorization_token', token)
    localStorage.setItem('adminUser', JSON.stringify(user))
    // 清理旧版模拟登录写入的键
    localStorage.removeItem('adminToken')

    emit('success', { username: form.username.trim(), user })

    // 整页模式跳仪表盘；弹窗模式留在当前页，由外层决定（导航栏会刷新登录态）
    if (!props.embedded) {
      router.push('/admin/dashboard')
    }
  } catch (e) {
    console.error('登录失败', e)
    error.value = '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 注册：POST /index/user/register（用户名 + 手机号 + 性别 + 密码）
const handleRegister = async () => {
  error.value = ''
  success.value = ''

  const username = regForm.username.trim()
  const phone = regForm.phone.trim()
  const password = regForm.password

  if (!username || !phone || !password) {
    error.value = '请完整填写注册信息'
    return
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    error.value = '请输入正确的手机号'
    return
  }
  if (password.length < 6) {
    error.value = '密码至少 6 位'
    return
  }

  loading.value = true

  try {
    const res = await api.registerUser({
      username,
      phone,
      sex: regForm.sex,
      password
    })
    const ok = !!(res && (res.success === true || res.code === 200 || res.code === 0))
    if (!ok) {
      error.value = (res && (res.msg || res.message)) || '注册失败，请稍后重试'
      return
    }
    // 注册成功：回到登录并带上刚注册的用户名
    form.username = username
    regForm.password = ''
    switchMode('login')
    success.value = '注册成功，请登录'
  } catch (e) {
    console.error('注册失败', e)
    error.value = '注册失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped src="./AdminLogin.css"></style>
