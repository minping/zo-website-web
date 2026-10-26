const CONFETTI_COLORS = ['#f43f5e', '#f97316', '#facc15', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899', '#fb7185']

// 打卡成功彩带礼花：在 targetEl（被点击的按钮）圆心一次性绽放粒子
// root 为 fixed 定位的覆盖层容器，需在页面里预留 <div ref="burstRoot" class="confetti-burst"></div>
export const burstConfetti = (root, targetEl, count = 90) => {
  if (!root || !targetEl) return
  const rect = targetEl.getBoundingClientRect()
  root.style.left = `${rect.left + rect.width / 2}px`
  root.style.top = `${rect.top + rect.height / 2}px`
  root.innerHTML = ''
  const fragment = document.createDocumentFragment()
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span')
    piece.className = 'confetti-piece'
    const angle = Math.random() * Math.PI * 2
    const dist = 70 + Math.random() * 170
    piece.style.setProperty('--dx', `${Math.cos(angle) * dist}px`)
    piece.style.setProperty('--dy', `${Math.sin(angle) * dist - 35}px`)
    piece.style.setProperty('--rot', `${Math.round(Math.random() * 720 - 360)}deg`)
    piece.style.setProperty('--d', `${0.5 + Math.random() * 0.5}s`)
    piece.style.width = `${6 + Math.random() * 6}px`
    piece.style.height = `${5 + Math.random() * 7}px`
    piece.style.borderRadius = Math.random() > 0.55 ? '50%' : '2px'
    piece.style.background = CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0]
    fragment.appendChild(piece)
  }
  root.appendChild(fragment)
  setTimeout(() => {
    if (root) root.innerHTML = ''
  }, 1800)
}
