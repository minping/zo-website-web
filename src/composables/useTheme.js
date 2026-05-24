import { ref, watch, onMounted } from 'vue'

const theme = ref(localStorage.getItem('theme') || 'dark')

export function useTheme() {
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  const setTheme = (newTheme) => {
    theme.value = newTheme
  }

  watch(theme, (newTheme) => {
    if (newTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    localStorage.setItem('theme', newTheme)
  }, { immediate: true })

  onMounted(() => {
    if (theme.value === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
    }
  })

  return {
    theme,
    toggleTheme,
    setTheme
  }
}
