import { ref, watch, onMounted } from 'vue'

const theme = ref(localStorage.getItem('theme') || 'dark')

const themeCycle = ['dark', 'light', 'retro', 'cyberpunk']

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
    localStorage.setItem('theme', newTheme)
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
