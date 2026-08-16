<template>
  <div class="api-card" @click="$emit('select', api)">
    <div class="api-card-header">
      <span class="api-icon">
        <img v-if="api.icon" :src="api.icon" :alt="api.name" class="api-icon-img" />
        <template v-else>{{ (api.name || 'A').charAt(0) }}</template>
      </span>
      <div class="api-title-group">
        <span class="api-name">{{ api.name }}</span>
        <span class="api-author">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>{{ api.author || 'Zo' }}</span>
        </span>
      </div>
    </div>
    <p class="api-desc">{{ api.description }}</p>
    <div class="api-tags">
      <span v-for="t in api.tags" :key="t.value" class="api-tag">
        {{ t.text }}
      </span>
      <span v-if="!api.isFree" class="api-tag paid-tag">
        付费
      </span>
    </div>
    <div class="api-stats">
      <span class="api-stat" data-tip="累计 API 调用次数">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
        {{ api.stats.calls }}
      </span>
      <span class="api-stat" data-tip="请求成功比例">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        {{ api.stats.successRate }}%
      </span>
      <span class="api-stat" data-tip="平均响应时间">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        {{ api.responseTime }}ms
      </span>
      <span class="api-stat" data-tip="用户点赞数">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        {{ api.stats.likes }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  api: {
    type: Object,
    required: true
  }
})

defineEmits(['select'])
</script>

<style scoped>
.api-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
  padding: 18px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s;
}

.api-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-primary);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.api-card-header {
  display: flex;
  align-items: stretch;
  gap: 10px;
  margin-bottom: 8px;
}

/* API 图标 */
.api-icon {
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 6px;
  overflow: hidden;
}

.api-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 标题组：名称在上、作者在下 */
.api-title-group {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}

.api-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.api-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0 0 10px;
  flex: 1;
}

.api-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

/* 作者行 */
.api-author {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--text-secondary);
}

.api-author svg {
  flex-shrink: 0;
  color: var(--text-tertiary);
}

.api-tag {
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 8px;
  background: color-mix(in srgb, var(--accent-primary) 15%, transparent);
  color: var(--accent-primary);
}

.paid-tag {
  background: color-mix(in srgb, var(--accent-secondary) 15%, transparent);
  color: var(--accent-secondary);
}

.api-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 4px;
  padding-top: 6px;
}

.api-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-secondary);
  cursor: help;
  position: relative;
  white-space: nowrap;
}

.api-stat svg {
  flex-shrink: 0;
  color: var(--text-tertiary);
}

.api-stat:hover {
  color: var(--accent-primary);
}

.api-stat:hover::after {
  content: attr(data-tip);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 10px;
  background: var(--bg-elevated);
  border-radius: 6px;
  font-size: 11px;
  color: var(--text-primary);
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.api-stat:hover::before {
  content: '';
  position: absolute;
  bottom: calc(100% + 2px);
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  z-index: 10;
}
</style>
