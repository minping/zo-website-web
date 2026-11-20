<template>
  <div class="knowledge-page">
    <!-- 背景效果 -->
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>
    <!-- 主题背景装饰 -->
    <BgScenery />

    <!-- 导航栏 -->
    <Navbar activeMenu="知识库" />

    <!-- 页面主体：仅思维图画布（无工具栏 / 无画布背景） -->
    <main class="kb-main">
      <MindMap bare />
    </main>
  </div>
</template>

<script setup>
import Navbar from './Navbar.vue'
import BgScenery from './BgScenery.vue'
import MindMap from './MindMap.vue'
</script>

<style scoped>
.knowledge-page {
  position: relative;
  min-height: 100vh;
  /* 顶部留出固定导航栏高度 */
  padding-top: 64px;
  display: flex;
  flex-direction: column;
}

.bg-glow {
  position: fixed;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.3;
  pointer-events: none;
  z-index: 0;
}

.bg-glow-1 {
  top: -200px;
  right: -200px;
  background: var(--accent-primary);
}

.bg-glow-2 {
  bottom: -200px;
  left: -200px;
  background: var(--accent-secondary);
}

.kb-main {
  position: relative;
  z-index: 1;
  flex: 1;
  /* 至少铺满首屏；内容变多时随思维图一起增高，页面正常滚动 */
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: flex-start;
}

/* 思维图横向铺满；高度由节点内容决定，不设上限 */
.kb-main :deep(.mind-map) {
  flex: 1;
  height: auto;
  min-height: 0;
}
</style>
