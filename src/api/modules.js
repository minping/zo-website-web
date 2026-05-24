// 开放 API 模块数据
export const openApis = [
  {
    id: 1,
    name: '随机壁纸 API',
    description: '获取高清随机壁纸，支持分类筛选',
    endpoint: 'https://api.example.com/wallpaper/random',
    method: 'GET',
    tag: '图片',
    tagColor: '#10b981',
    isFree: true,
    stats: {
      calls: '1.2M',
      successRate: 99.8,
      avgTime: 45,
      likes: 892
    }
  },
  {
    id: 2,
    name: '天气查询 API',
    description: '实时天气数据，支持全国城市',
    endpoint: 'https://api.example.com/weather',
    method: 'GET',
    tag: '生活',
    tagColor: '#3b82f6',
    isFree: true,
    stats: {
      calls: '3.5M',
      successRate: 99.5,
      avgTime: 38,
      likes: 2341
    }
  },
  {
    id: 3,
    name: '短链接生成',
    description: '长链接转换为短链接服务',
    endpoint: 'https://api.example.com/shorten',
    method: 'POST',
    tag: '工具',
    tagColor: '#8b5cf6',
    isFree: true,
    stats: {
      calls: '856K',
      successRate: 99.9,
      avgTime: 52,
      likes: 567
    }
  },
  {
    id: 4,
    name: '二维码生成',
    description: '支持自定义颜色和logo',
    endpoint: 'https://api.example.com/qrcode',
    method: 'POST',
    tag: '工具',
    tagColor: '#f59e0b',
    isFree: false,
    stats: {
      calls: '420K',
      successRate: 99.7,
      avgTime: 78,
      likes: 1234
    }
  },
  {
    id: 5,
    name: 'IP 归属地查询',
    description: '精准 IP 地理位置定位',
    endpoint: 'https://api.example.com/ip',
    method: 'GET',
    tag: '工具',
    tagColor: '#ec4899',
    isFree: true,
    stats: {
      calls: '2.1M',
      successRate: 99.6,
      avgTime: 32,
      likes: 1567
    }
  },
  {
    id: 6,
    name: '图片格式转换',
    description: '支持 PNG/JPEG/WebP 互转',
    endpoint: 'https://api.example.com/image/convert',
    method: 'POST',
    tag: '图片',
    tagColor: '#06b6d4',
    isFree: false,
    stats: {
      calls: '234K',
      successRate: 98.9,
      avgTime: 156,
      likes: 456
    }
  },
  {
    id: 7,
    name: '文字转语音',
    description: '多语言多音色 TTS 服务',
    endpoint: 'https://api.example.com/tts',
    method: 'POST',
    tag: 'AI',
    tagColor: '#f97316',
    isFree: false,
    stats: {
      calls: '567K',
      successRate: 99.2,
      avgTime: 234,
      likes: 2890
    }
  },
  {
    id: 8,
    name: '敏感词检测',
    description: '文本内容安全审核',
    endpoint: 'https://api.example.com/moderation',
    method: 'POST',
    tag: 'AI',
    tagColor: '#84cc16',
    isFree: true,
    stats: {
      calls: '1.8M',
      successRate: 99.4,
      avgTime: 67,
      likes: 1789
    }
  }
]

// 获取 API 列表（模拟接口调用）
export const getApis = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: openApis })
    }, 100)
  })
}

// API 方法颜色映射
export const methodColors = {
  GET: '#10b981',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  DELETE: '#ef4444'
}
