<template>
  <div class="bg-scenery" :class="themeClass" aria-hidden="true">
    <!-- ======== 深色：星空 · 月 · 远山 · 松影 ======== -->
    <template v-if="theme === 'dark'">
      <span class="art art-moon"></span>
      <span class="art art-star st-1"></span>
      <span class="art art-star st-2"></span>
      <span class="art art-star st-3"></span>
      <span class="art art-star st-4"></span>
      <svg class="art-svg art-mountains" viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice">
        <path d="M0 320 V230 L220 110 L420 260 L640 160 L860 280 L1100 130 L1440 300 V320 Z" style="fill:var(--text-secondary);opacity:.16"/>
        <path d="M0 320 V270 L320 190 L560 290 L900 210 L1200 300 L1440 260 V320 Z" style="fill:var(--text-secondary);opacity:.22"/>
      </svg>
      <svg class="art-svg art-pine art-pine-l" viewBox="0 0 90 120">
        <path d="M45 8 L80 62 H10 Z" style="fill:var(--text-secondary);opacity:.2"/>
        <path d="M45 34 L84 92 H6 Z" style="fill:var(--text-secondary);opacity:.3"/>
        <path d="M45 62 L90 120 H0 Z" style="fill:var(--text-secondary);opacity:.42"/>
      </svg>
      <svg class="art-svg art-pine art-pine-r" viewBox="0 0 90 120">
        <path d="M45 8 L80 62 H10 Z" style="fill:var(--text-secondary);opacity:.2"/>
        <path d="M45 34 L84 92 H6 Z" style="fill:var(--text-secondary);opacity:.3"/>
        <path d="M45 62 L90 120 H0 Z" style="fill:var(--text-secondary);opacity:.42"/>
      </svg>
    </template>

    <!-- ======== 亮色：晨光 · 云 · 气球 ======== -->
    <template v-else-if="theme === 'light'">
      <span class="art art-sun"></span>
      <svg class="art-svg art-cloud art-drift" viewBox="0 0 120 44">
        <ellipse cx="32" cy="30" rx="27" ry="14"/>
        <ellipse cx="62" cy="22" rx="25" ry="16"/>
        <ellipse cx="92" cy="32" rx="22" ry="11"/>
      </svg>
      <svg class="art-svg art-cloud art-drift art-cloud2" viewBox="0 0 120 44">
        <ellipse cx="32" cy="30" rx="27" ry="14"/>
        <ellipse cx="62" cy="22" rx="25" ry="16"/>
        <ellipse cx="92" cy="32" rx="22" ry="11"/>
      </svg>
      <svg class="art-svg art-hills" viewBox="0 0 1440 200" preserveAspectRatio="none">
        <path d="M0 200 V120 Q180 40 380 110 T760 100 T1140 120 T1440 90 V200 Z" style="fill:var(--accent-primary);opacity:.12"/>
      </svg>
      <svg class="art-svg art-balloon art-floaty" viewBox="0 0 90 120">
        <ellipse cx="45" cy="40" rx="26" ry="32" style="fill:var(--accent-secondary);opacity:.5"/>
        <path d="M40 68 Q45 78 50 68 Z" style="fill:var(--accent-primary);opacity:.55"/>
        <path d="M45 72 L45 92" style="stroke:var(--text-muted);stroke-width:2;fill:none;opacity:.7"/>
        <path d="M45 88 L28 104 M45 90 L63 106 M45 90 L41 108" style="stroke:var(--text-muted);stroke-width:1.5;fill:none;opacity:.55"/>
      </svg>
    </template>

    <!-- ======== 复古：暖阳 · 山丘 · 热气球 ======== -->
    <template v-else-if="theme === 'retro'">
      <svg class="art-svg art-retro-sun" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="24" style="fill:var(--accent-primary);opacity:.5"/>
        <path d="M60 14 V30 M60 90 V106 M14 60 H30 M90 60 H106 M28 28 L38 38 M82 82 L92 92 M92 28 L82 38 M38 82 L28 92" style="stroke:var(--accent-primary);stroke-width:4;stroke-linecap:round;opacity:.6"/>
      </svg>
      <svg class="art-svg art-cloud art-drift" viewBox="0 0 120 40">
        <ellipse cx="34" cy="27" rx="30" ry="13"/>
        <ellipse cx="66" cy="20" rx="26" ry="15"/>
        <ellipse cx="94" cy="29" rx="20" ry="10"/>
      </svg>
      <svg class="art-svg art-hills art-retro-hills" viewBox="0 0 1440 200" preserveAspectRatio="none">
        <path d="M0 200 V140 Q200 60 420 130 T820 110 T1220 130 T1440 100 V200 Z" style="fill:var(--accent-primary);opacity:.18"/>
        <path d="M0 200 V170 Q260 110 520 165 T1040 150 T1440 165 V200 Z" style="fill:var(--accent-primary);opacity:.12"/>
      </svg>
      <svg class="art-svg art-balloon art-floaty" viewBox="0 0 90 120">
        <ellipse cx="45" cy="42" rx="27" ry="34" style="fill:var(--accent-primary);opacity:.42"/>
        <path d="M45 74 L32 86 L58 86 Z" style="fill:var(--accent-secondary);opacity:.55"/>
        <path d="M45 88 L45 104" style="stroke:var(--text-muted);stroke-width:2;fill:none;opacity:.7"/>
        <path d="M45 100 L28 116 M45 100 L63 116 M45 100 L41 118" style="stroke:var(--text-muted);stroke-width:1.5;fill:none;opacity:.55"/>
      </svg>
    </template>

    <!-- ======== 森林：树木 · 云 · 落叶 ======== -->
    <template v-else-if="theme === 'forest'">
      <svg class="art-svg art-cloud art-drift" viewBox="0 0 120 44">
        <ellipse cx="32" cy="30" rx="27" ry="14"/>
        <ellipse cx="62" cy="22" rx="25" ry="16"/>
        <ellipse cx="92" cy="32" rx="22" ry="11"/>
      </svg>
      <svg class="art-svg art-leafy-tree art-tree-l" viewBox="0 0 110 150">
        <path d="M48 150 L50 110" style="stroke:var(--accent-primary);stroke-width:7;stroke-linecap:round;opacity:.5"/>
        <ellipse cx="50" cy="78" rx="34" ry="30" style="fill:var(--accent-primary);opacity:.4"/>
        <ellipse cx="34" cy="92" rx="24" ry="22" style="fill:var(--accent-primary);opacity:.3"/>
        <ellipse cx="68" cy="94" rx="24" ry="22" style="fill:var(--accent-primary);opacity:.36"/>
      </svg>
      <svg class="art-svg art-pine art-pine-r" viewBox="0 0 90 120">
        <path d="M45 8 L80 62 H10 Z" style="fill:var(--accent-primary);opacity:.4"/>
        <path d="M45 34 L84 92 H6 Z" style="fill:var(--accent-primary);opacity:.5"/>
        <path d="M45 62 L90 120 H0 Z" style="fill:var(--accent-primary);opacity:.62"/>
      </svg>
      <svg class="art-svg art-grass" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path d="M0 120 V80 Q180 20 380 70 T760 55 T1140 80 T1440 60 V120 Z" style="fill:var(--accent-secondary);opacity:.22"/>
      </svg>
      <svg class="art-svg art-leaf art-leaf1" viewBox="0 0 30 40">
        <path d="M15 38 C8 28 9 12 15 4 C21 12 22 28 15 38 Z" style="fill:var(--accent-primary);opacity:.55"/>
      </svg>
      <svg class="art-svg art-leaf art-leaf2" viewBox="0 0 30 40">
        <path d="M15 38 C8 28 9 12 15 4 C21 12 22 28 15 38 Z" style="fill:var(--accent-secondary);opacity:.55"/>
      </svg>
    </template>

    <!-- ======== 夏日：风车 · 太阳 · 云 ======== -->
    <template v-else-if="theme === 'summer'">
      <span class="art art-sun"></span>
      <svg class="art-svg art-cloud art-drift" viewBox="0 0 120 44">
        <ellipse cx="32" cy="30" rx="27" ry="14"/>
        <ellipse cx="62" cy="22" rx="25" ry="16"/>
        <ellipse cx="92" cy="32" rx="22" ry="11"/>
      </svg>
      <svg class="art-svg art-cloud art-drift art-cloud2" viewBox="0 0 120 44">
        <ellipse cx="32" cy="30" rx="27" ry="14"/>
        <ellipse cx="62" cy="22" rx="25" ry="16"/>
        <ellipse cx="92" cy="32" rx="22" ry="11"/>
      </svg>
      <svg class="art-svg art-windmill" viewBox="0 0 140 240">
        <g class="blades">
          <rect x="63" y="8" width="14" height="164" rx="7" style="fill:#ffffff;opacity:.95"/>
          <rect x="1" y="81" width="138" height="14" rx="7" style="fill:#ffffff;opacity:.95"/>
        </g>
        <circle cx="70" cy="90" r="7" style="fill:var(--accent-secondary);opacity:.9"/>
        <path d="M64 150 h12 v85 h-12 Z" style="fill:var(--text-muted);opacity:.6"/>
      </svg>
      <svg class="art-svg art-grass art-summer-ground" viewBox="0 0 1440 140" preserveAspectRatio="none">
        <path d="M0 140 V100 Q240 40 480 90 T960 80 T1440 90 V140 Z" style="fill:var(--accent-secondary);opacity:.28"/>
      </svg>
    </template>

    <!-- ======== 赛博朋克：霓虹都市 ======== -->
    <template v-else-if="theme === 'cyberpunk'">
      <span class="art art-cyber-moon"></span>
      <span class="art art-star art-neon st-1"></span>
      <span class="art art-star art-neon st-2"></span>
      <span class="art art-star art-neon st-3"></span>
      <span class="art art-diamond art-d1 art-floaty"></span>
      <span class="art art-diamond art-d2 art-floaty"></span>
      <svg class="art-svg art-city" viewBox="0 0 1440 260" preserveAspectRatio="xMidYMax meet">
        <g style="fill:none;stroke:var(--accent-secondary);stroke-width:2;opacity:.4">
          <path d="M0 240 V110 h70 v30 h45 v-70 h60 v150"/>
          <path d="M240 240 V150 h50 v-60 h80 v-40 h60 v190"/>
          <path d="M500 240 V80 h90 v-30 h70 v-20 h50 v210"/>
          <path d="M760 240 V160 h60 v-90 h90 v-30 h70 v180"/>
          <path d="M1020 240 V100 h80 v-40 h70 v40 h60 v140"/>
          <path d="M1280 240 V130 h70 v-50 h90 v160"/>
        </g>
        <g style="fill:var(--accent-primary);opacity:.6">
          <rect x="30" y="150" width="8" height="8"/><rect x="60" y="180" width="8" height="8"/>
          <rect x="265" y="90" width="8" height="8"/><rect x="320" y="140" width="8" height="8"/>
          <rect x="540" y="130" width="8" height="8"/><rect x="600" y="80" width="8" height="8"/>
          <rect x="790" y="200" width="8" height="8"/><rect x="830" y="110" width="8" height="8"/>
          <rect x="1040" y="150" width="8" height="8"/><rect x="1110" y="190" width="8" height="8"/>
          <rect x="1300" y="170" width="8" height="8"/><rect x="1350" y="120" width="8" height="8"/>
        </g>
      </svg>
    </template>

    <!-- ======== 云墨：远山 · 飞鸟 · 日 ======== -->
    <template v-else>
      <span class="art art-ink-sun"></span>
      <svg class="art-svg art-ink-mountain" viewBox="0 0 1440 300" preserveAspectRatio="xMidYMax slice">
        <path d="M0 300 V210 L260 90 L470 230 L720 150 L950 250 L1230 120 L1440 240 V300 Z" style="fill:var(--text-secondary);opacity:.3"/>
        <path d="M0 300 V250 L420 170 L760 260 L1120 190 L1440 260 V300 Z" style="fill:var(--text-secondary);opacity:.2"/>
      </svg>
      <svg class="art-svg art-bird art-b1" viewBox="0 0 60 30">
        <path d="M4 20 Q16 8 30 16 M30 16 Q44 8 56 20" style="fill:none;stroke:var(--text-secondary);stroke-width:3;stroke-linecap:round;opacity:.6"/>
      </svg>
      <svg class="art-svg art-bird art-b2" viewBox="0 0 60 30">
        <path d="M4 20 Q16 8 30 16 M30 16 Q44 8 56 20" style="fill:none;stroke:var(--text-secondary);stroke-width:3;stroke-linecap:round;opacity:.45"/>
      </svg>
      <svg class="art-svg art-boat art-floaty" viewBox="0 0 90 60">
        <path d="M8 40 Q45 56 84 40 L78 48 Q45 58 12 48 Z" style="fill:var(--text-secondary);opacity:.55"/>
        <path d="M45 42 V6" style="stroke:var(--text-secondary);stroke-width:2.5;opacity:.55"/>
        <path d="M45 8 L72 34 L45 30 Z" style="fill:var(--text-secondary);opacity:.38"/>
      </svg>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme'

const { theme } = useTheme()

const themeClass = computed(() => `theme-${theme.value}`)
</script>

<style scoped>
/* ========== 主题背景装饰层 ==========
   用法：置于各页面根容器顶部背景区（position: relative 容器内），
   通过 .theme-* 控制每个主题出现不同的 SVG 场景元素。 */
.bg-scenery {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 560px;
  overflow: hidden;
  pointer-events: none;
  user-select: none;
  z-index: 0;
}

.art,
.art-svg {
  position: absolute;
  display: block;
  pointer-events: none;
}

/* ---------- 通用物件 ---------- */

/* 太阳（亮色/夏日） */
.art-sun {
  top: 84px;
  right: 10%;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: radial-gradient(circle, #fbd38d 30%, #f6ad55 72%, rgba(246, 173, 85, 0));
  box-shadow: 0 0 40px 12px rgba(246, 173, 85, 0.35);
  animation: sunBreath 5s ease-in-out infinite;
}

/* 月亮（深色） */
.art-moon {
  top: 84px;
  right: 9%;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: radial-gradient(circle at 62% 40%, #f1f5f9 0%, #cbd5e1 55%, #94a3b8 100%);
  box-shadow: 0 0 34px 10px rgba(148, 163, 184, 0.45);
}

/* 星星 */
.art-star {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #cbd5e1;
  animation: twinkle 3s ease-in-out infinite;
}

.st-1 { top: 110px; left: 12%; }
.st-2 { top: 160px; left: 26%; animation-delay: .8s; }
.st-3 { top: 100px; left: 40%; animation-delay: 1.4s; }
.st-4 { top: 190px; left: 8%; animation-delay: 2s; }

/* 赛博霓虹星点 */
.art-neon {
  background: var(--accent-secondary);
  box-shadow: 0 0 12px 3px var(--accent-glow);
  width: 6px;
  height: 6px;
}

/* 赛博大月亮（描边圆环） */
.art-cyber-moon {
  top: 70px;
  right: 8%;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 2px dashed var(--accent-secondary);
  opacity: .8;
  animation: spinSlow 30s linear infinite;
}
.art-cyber-moon::before {
  content: '';
  position: absolute;
  top: 14px;
  right: 14px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--accent-secondary);
  opacity: .9;
}
.art-cyber-moon::after {
  content: '';
  position: absolute;
  left: 26px;
  bottom: 22px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent-primary);
}

/* 赛博浮空菱形 */
.art-diamond {
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, var(--accent-secondary), var(--accent-primary));
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  box-shadow: 0 0 14px 2px var(--accent-glow);
}
.art-d1 { top: 210px; right: 26%; }
.art-d2 { top: 120px; right: 34%; animation-delay: .9s; width: 12px; height: 12px; }

/* 云 */
.art-cloud {
  width: 130px;
  fill: var(--text-secondary);
  opacity: .5;
  animation: driftX 11s ease-in-out infinite alternate;
}
.art-cloud2 {
  top: 210px;
  right: 20%;
  width: 100px;
  opacity: .32;
  animation-duration: 14s;
  animation-delay: .6s;
}

/* 气球 / 扁舟 漂浮 */
.art-balloon {
  width: 60px;
}
.art-boat {
  bottom: 16px;
  left: 7%;
  width: 92px;
}

.art-floaty {
  animation: floatY 5s ease-in-out infinite;
}

/* ---------- 主题定位 ---------- */

/* 远山（亮色主题底部缓坡） */
.art-hills {
  left: 0;
  bottom: 0;
  width: 100%;
  height: 240px;
}

.art-retro-hills {
  height: 210px;
}

/* 复古太阳 */
.art-retro-sun {
  top: 60px;
  right: 10%;
  width: 64px;
  animation: sunBreath 6s ease-in-out infinite;
}

/* 山（深色） */
.art-mountains {
  left: 0;
  bottom: 0;
  width: 100%;
  height: 300px;
}

/* 松树剪影 */
.art-pine {
  bottom: 0;
  width: 74px;
}
.art-pine-l {
  left: 3%;
}
.art-pine-r {
  right: 5%;
  width: 92px;
  animation: sway 7s ease-in-out infinite;
  transform-origin: bottom center;
}

/* 阔叶树（森林） */
.art-leafy-tree {
  bottom: 0;
  width: 96px;
}
.art-tree-l {
  left: 4%;
  animation: sway 8s ease-in-out infinite;
  transform-origin: bottom center;
}

/* 草丘/地面 */
.art-grass {
  left: 0;
  bottom: 0;
  width: 100%;
  height: 130px;
}

/* 落叶（森林） */
.art-leaf {
  width: 18px;
  animation: leafFall 7s linear infinite;
  opacity: 0;
}
.art-leaf1 {
  top: 120px;
  left: 24%;
  animation-delay: 0s;
}
.art-leaf2 {
  top: 90px;
  left: 44%;
  width: 14px;
  animation-delay: 2.6s;
}

/* 风车（夏日） */
.art-windmill {
  right: 7%;
  bottom: 0;
  width: 108px;
  height: auto;
}
.blades {
  transform-box: fill-box;
  transform-origin: center;
  animation: spinSlow 9s linear infinite;
}

/* 城市（赛博） */
.art-city {
  left: 0;
  bottom: 0;
  width: 100%;
  height: 230px;
}

/* 水墨山 */
.art-ink-mountain {
  left: 0;
  bottom: 0;
  width: 100%;
  height: 270px;
}

/* 水墨红日 */
.art-ink-sun {
  top: 100px;
  right: 12%;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--accent-primary);
  opacity: .85;
  animation: sunBreath 6s ease-in-out infinite;
}

/* 飞鸟（云墨） */
.art-bird {
  width: 42px;
}
.art-b1 {
  top: 150px;
  right: 34%;
  animation: birdGlide 7s ease-in-out infinite alternate;
}
.art-b2 {
  top: 190px;
  right: 27%;
  width: 30px;
  animation: birdGlide 9s ease-in-out infinite alternate-reverse;
}

/* ========== 动画 ========== */
@keyframes driftX {
  from { transform: translateX(0); }
  to   { transform: translateX(48px); }
}

@keyframes floatY {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-14px); }
}

@keyframes sunBreath {
  0%, 100% { opacity: .95; transform: scale(1); }
  50%      { opacity: .7;  transform: scale(1.08); }
}

@keyframes twinkle {
  0%, 100% { opacity: .25; }
  50%      { opacity: 1; }
}

@keyframes sway {
  0%, 100% { transform: rotate(-1.6deg); }
  50%      { transform: rotate(1.6deg); }
}

@keyframes spinSlow {
  to { transform: rotate(360deg); }
}

@keyframes leafFall {
  0%   { transform: translate(0, -30px) rotate(0); opacity: 0; }
  12%  { opacity: .9; }
  88%  { opacity: .9; }
  100% { transform: translate(46px, 120px) rotate(240deg); opacity: 0; }
}

@keyframes birdGlide {
  from { transform: translate(0, 0); }
  to   { transform: translate(34px, -16px); }
}

/* 窄屏弱化装饰，避免干扰正文 */
@media (max-width: 900px) {
  .bg-scenery { height: 380px; }
  .art-leaf, .art-leaf2, .art-d2, .art-b2 { display: none; }
  .art-sun, .art-moon { top: 92px; right: 7%; width: 38px; height: 38px; }
  .art-retro-sun { top: 74px; right: 7%; width: 46px; }
  .art-ink-sun { top: 104px; right: 7%; width: 36px; height: 36px; }
  .art-cyber-moon { top: 80px; right: 6%; width: 88px; height: 88px; }
}

@media (max-width: 640px) {
  .bg-scenery { height: 300px; opacity: .72; }
  .art-hills, .art-grass, .art-retro-hills { height: 120px; }
  .art-pine { width: 52px; }
  .art-windmill { width: 76px; right: 5%; }
  .art-balloon { width: 46px; }
  .art-city, .art-ink-mountain, .art-mountains { height: 170px; }
}
</style>
