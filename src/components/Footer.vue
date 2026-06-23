<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-brand">
          <span class="logo-icon">&lt;/&gt;</span>
          <span>Zode</span>
        </div>
        <p class="footer-copy">&copy; 2026 Zode. All rights reserved.</p>
        <div class="icp-info">
          <a href="https://beian.mps.gov.cn/#/query/webSearch?code=36100202000734" rel="noreferrer" target="_blank"><img width="16px" src="../../public/images/back.png">赣公网安备36100202000734号</a>
        </div>
        <div class="icp-info">
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
            <svg class="icp-icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill="#3b82f6" d="M10 1L3 4v5c0 4.3 2.9 8.3 7 9.5 4.1-1.2 7-5.2 7-9.5V4L10 1zm0 2.2l5 2.4v4.4c0 3.3-2.1 6.4-5 7.5-2.9-1.1-5-4.2-5-7.5V5.6l5-2.4z"/>
              <path fill="#3b82f6" d="M9 7h2v5h-2V7zm0 6h2v2H9v-2z"/>
            </svg>
            赣ICP备2026007696号
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// Footer component - 可以根据需要添加 props 和 emit
const props = defineProps({
  // 可以扩展自定义内容
})

const emit = defineEmits(['navigate'])

// 可以在这里添加链接点击处理
const handleLinkClick = (link) => {
  emit('navigate', link)
}
</script>

<style scoped>
.footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: 40px 0;
  position: relative;
  z-index: 1;
  transition: background 0.3s ease, border-color 0.3s ease;
}

.footer-content {
  text-align: center;
}

.footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.logo-icon {
  font-size: 18px;
  font-weight: bold;
  color: var(--accent-primary);
}

.footer-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 16px;
}

.footer-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
  cursor: pointer;
}

.footer-link:hover {
  color: var(--accent-primary);
}

.footer-copy {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.icp-info {
  display: flex;
  justify-content: center;
}

.icp-info a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 12px;
  transition: color 0.3s;
}

.icp-info a:hover {
  color: var(--accent-primary);
}

.icp-icon {
  width: 16px;
  height: 16px;
}
</style>
