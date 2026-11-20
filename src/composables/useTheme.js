import { ref, watch, onMounted } from 'vue'
import { getApiUrl, API_PATHS, getAuthHeader } from '../config.js'

// 主题本地缓存 key：优先使用缓存，避免每次刷新都请求 getSetting / switchTheme
const THEME_CACHE_KEY = 'cached_theme'

const readCache = () => {
  try {
    return localStorage.getItem(THEME_CACHE_KEY)
  } catch (e) {
    return null
  }
}

const writeCache = (t) => {
  try {
    localStorage.setItem(THEME_CACHE_KEY, t)
  } catch (e) { /* ignore */ }
}

const theme = ref(readCache() || 'light')

const themeCycle = ['dark', 'light', 'retro', 'cyberpunk', 'forest', 'summer', 'ink', 'pink']

// 标记：服务端主题是否已加载完毕，之后才允许同步到服务端
let enableServerSync = false

// 最近一次已确认同步的主题（来自服务端或已 POST 给服务端）
// watch 触发时只有与它不同才真正调用 switchTheme，避免组件挂载导致的重复请求
let syncedTheme = theme.value

// 从服务端获取设置并初始化主题（仅本地无缓存时调用，即用户首次打开站点）
const fetchServerTheme = async () => {
  // 已有本地缓存：直接使用，跳过服务端请求
  if (readCache()) {
    enableServerSync = true
    syncedTheme = theme.value
    return
  }
  try {
    const url = getApiUrl(API_PATHS.getSetting)
    // GET 不带 Content-Type，避免多余的 CORS 预检；已登录时带上授权 token
    const res = await fetch(url, {
      headers: getAuthHeader()
    })
    const json = await res.json()
    if (json.data && json.data.theme && themeCycle.includes(json.data.theme)) {
      const serverTheme = json.data.theme
      if (serverTheme !== theme.value) {
        // 预先标记为已同步，避免 watcher 触发时又向服务端 POST 一次相同主题
        syncedTheme = serverTheme
        theme.value = serverTheme
      }
    }
    // 服务端主题确认完毕，写入本地缓存
    writeCache(theme.value)
  } catch (e) {
    console.warn('获取服务端主题设置失败，使用默认 light 主题', e)
    writeCache(theme.value)
  } finally {
    enableServerSync = true
    syncedTheme = theme.value
  }
}

// 模块加载时初始化主题（有缓存则不发请求）
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

  // 注意：本 watch 会在每个调用 useTheme() 的组件里各注册一次，
  // 因此用 syncedTheme 去重：同一主题只有第一个 watcher 真正发请求
  watch(theme, (newTheme) => {
    applyTheme(newTheme)
    // 同步本地缓存，刷新后直接命中缓存
    writeCache(newTheme)
    // 仅在用户真实切换主题（与服务端已确认的主题不同）时才同步到服务端
    if (enableServerSync && newTheme !== syncedTheme) {
      syncedTheme = newTheme
      fetch(getApiUrl(API_PATHS.switchTheme(newTheme)), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
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
