import { ref, watch, onMounted } from 'vue'
import { getApiUrl, API_PATHS } from '../config.js'

const theme = ref('light')

const themeCycle = ['dark', 'light', 'retro', 'cyberpunk']

// 标记：服务端主题是否已加载完毕，之后才允许同步到服务端
let enableServerSync = false

// 从服务端获取设置并初始化主题
const fetchServerTheme = async () => {
  try {
    const url = getApiUrl(API_PATHS.getSetting)
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' }
    })
    const json = await res.json()
    if (json.data && json.data.theme) {
      const serverTheme = json.data.theme
      if (themeCycle.includes(serverTheme)) {
        theme.value = serverTheme
      }
    }
  } catch (e) {
    console.warn('获取服务端主题设置失败，使用默认 light 主题', e)
  } finally {
    enableServerSync = true
  }
}

// 模块加载时立即请求服务端主题
fetchServerTheme()

export function useTheme() {
  const toggleTheme = () => {
    const idx = themeCycle.indexOf(theme.value)
    theme.value = themeCycle[(idx + 1) % themeCycle.length]
  }

  const setTheme = (newTheme) => {
    theme.value = newTheme
  }

  const applyTheme = (t) => {
    document.documentElement.removeAttribute('data-theme')
    if (t !== 'dark') {
      document.documentElement.setAttribute('data-theme', t)
    }
  }

  watch(theme, (newTheme) => {
    applyTheme(newTheme)
    // 仅在服务端主题加载完成后，才将用户主动切换同步到服务端
    // 避免初始化时用默认值覆盖服务端设置
    if (enableServerSync) {
      fetch(getApiUrl(API_PATHS.switchTheme(newTheme)), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).catch(() => {})
    }
  }, { immediate: true })

  onMounted(() => {
    applyTheme(theme.value)
  })

  return {
    theme,
    toggleTheme,
    setTheme
  }
}
