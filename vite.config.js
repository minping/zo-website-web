import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 部署在 Spring Boot 的 /website 上下文里：构建产物里的静态资源需带 /website 前缀；
// 开发期仍用根路径，方便本地 vite dev server 直接访问。
export default defineConfig(({ command }) => ({
  plugins: [vue()],
  base: command === 'build' ? '/website/' : '/',
  server: {
    port: 3000,
    host: true
  }
}))
