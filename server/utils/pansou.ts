type PansouItem = {
  url?: string
  password?: string
  note?: string
  datetime?: string
  source?: string
}

export const FAST_SEARCH_ENGINE = 2
export const DEEP_SEARCH_ENGINE = 4

const DEFAULT_PANSOU_API_BASE = 'https://so.252035.xyz'

const diskTypeMap: Record<string, string> = {
  aliyun: 'ALY',
  baidu: 'BDY',
  quark: 'QUARK',
  xunlei: 'XUNLEI',
  uc: 'UC',
  tianyi: 'TIANYI',
  pikpak: 'PIKPAK',
  magnet: 'MAGNET',
  mobile: 'MOBILE',
  '115': '115',
  '123': '123',
}

const cloudTypeFilterMap: Record<string, string[]> = {
  ALY: ['aliyun'],
  BDY: ['baidu'],
  QUARK: ['quark'],
  XUNLEI: ['xunlei'],
}

const hotSearchKeywords = [
  '庆余年',
  '歌手2024',
  '周处除三害',
  '我的阿勒泰',
  '第二十条',
  '新生',
  '热辣滚烫',
  '承欢记',
]

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;')

const normalizeDate = (value?: string) => {
  if (!value || value === '0001-01-01T00:00:00Z') {
    return ''
  }

  return value
}

export const getPansouApiBase = () => {
  const config = useRuntimeConfig()
  return (config.pansouApiBase || DEFAULT_PANSOU_API_BASE).replace(/\/+$/, '')
}

export const normalizeEngine = (engine?: number) => {
  if (engine === DEEP_SEARCH_ENGINE) {
    return DEEP_SEARCH_ENGINE
  }

  return FAST_SEARCH_ENGINE
}

export const mapCurrentTypeToCloudTypes = (type?: string) => {
  return cloudTypeFilterMap[type || ''] || []
}

export const transformMergedByTypeToLegacyList = (
  mergedByType: Record<string, PansouItem[]>,
  page = 1,
  size = 10,
) => {
  const flatList = Object.entries(mergedByType || {}).flatMap(([cloudType, items]) => {
    return (items || []).map((item, index) => {
      const safeTitle = escapeHtml(item.note || item.url || `资源 ${index + 1}`)
      const safeSource = item.source ? escapeHtml(item.source) : 'PanSou'
      const safeCloudType = escapeHtml(cloudType)

      return {
        link: item.url || '',
        disk_name: safeTitle,
        files: `来源: ${safeSource}<br>类型: ${safeCloudType}`,
        disk_type: diskTypeMap[cloudType] || cloudType.toUpperCase(),
        disk_pass: item.password ? escapeHtml(item.password) : '',
        update_time: normalizeDate(item.datetime),
      }
    })
  }).filter((item) => item.link)

  const start = Math.max(page - 1, 0) * size
  const end = start + size

  return {
    list: flatList.slice(start, end),
    total: flatList.length,
  }
}

export const buildHotSearchList = (page = 1, size = 10) => {
  const list = hotSearchKeywords.map((keyword) => ({
    link: `/search?keyword=${encodeURIComponent(keyword)}`,
    disk_name: `热门搜索：${keyword}`,
    files: '点击后会在本站内自动搜索这个关键词',
    disk_type: '',
    disk_pass: '',
    update_time: '',
  }))

  const start = Math.max(page - 1, 0) * size
  const end = start + size

  return {
    list: list.slice(start, end),
    total: list.length,
  }
}
