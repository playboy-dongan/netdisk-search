export type PansouItem = {
  url?: string
  password?: string
  note?: string
  datetime?: string
  source?: string
  valid?: boolean
  is_valid?: boolean
  available?: boolean
  deleted?: boolean
  expired?: boolean
  status?: string
}

export const FAST_SEARCH_ENGINE = 2
export const DEEP_SEARCH_ENGINE = 4
export const DEFAULT_CLOUD_TYPES = ['baidu', 'aliyun', 'quark', 'xunlei']

const DEFAULT_PANSOU_API_BASE = 'https://so.252035.xyz'
const MAX_KEYWORD_LENGTH = 50

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

const invalidStatusKeywords = [
  'invalid',
  'expired',
  'deleted',
  'unavailable',
  'dead',
  '失效',
  '无效',
  '过期',
  '删除',
  '不存在',
  '取消',
]

const invalidTextPatterns = [
  /分享(?:已)?(?:被)?(?:取消|删除|失效)/,
  /链接(?:已)?(?:失效|无效|不存在|过期)/,
  /资源(?:已)?(?:失效|不存在|删除|下架)/,
  /文件(?:已)?(?:删除|不存在|过期)/,
  /(?:已经|已)失效/,
  /提取码(?:错误|无效)/,
  /(?:违规|敏感)(?:内容|资源)?(?:已)?(?:被)?(?:屏蔽|删除|无法访问)?/,
  /无法访问/,
  /暂时无法查看/,
  /(?:^|[\s【\[（(:：])失效(?:$|[\s】\]）),，。:：])/,
]

const replacementTextPatterns = [
  /失效.{0,8}(?:已补|补档|补发|已恢复|已修复|重新|更新|新链)/,
  /(?:已补|补档|补发|已恢复|已修复|重新|更新|新链).{0,8}失效/,
]

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

const mojibakePattern = /[À-ÿ]/
const cjkPattern = /[\u3400-\u9FFF]/

const fixMojibake = (value?: string) => {
  if (!value || !mojibakePattern.test(value)) {
    return value || ''
  }

  try {
    const decoded = Buffer.from(value, 'latin1').toString('utf8')

    if (!decoded || decoded.includes('\uFFFD') || !cjkPattern.test(decoded)) {
      return value
    }

    return decoded
  } catch {
    return value
  }
}

const normalizeDate = (value?: string) => {
  if (!value || value === '0001-01-01T00:00:00Z') {
    return ''
  }

  return value
}

export const isInvalidResource = (item: PansouItem) => {
  if (item.valid === false || item.is_valid === false || item.available === false) {
    return true
  }

  if (item.deleted === true || item.expired === true) {
    return true
  }

  const status = String(item.status || '').trim().toLowerCase()
  if (status && invalidStatusKeywords.some((keyword) => status.includes(keyword))) {
    return true
  }

  const text = [item.note, item.source].filter(Boolean).join(' ')
  if (!text || replacementTextPatterns.some((pattern) => pattern.test(text))) {
    return false
  }

  return invalidTextPatterns.some((pattern) => pattern.test(text))
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

export const normalizeKeyword = (value?: string) => {
  const keyword = String(value || '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return keyword.slice(0, MAX_KEYWORD_LENGTH)
}

export const clampPositiveNumber = (value: unknown, min: number, max: number, fallback: number) => {
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return fallback
  }

  return Math.min(Math.max(Math.floor(parsed), min), max)
}

export const mapCurrentTypeToCloudTypes = (type?: string) => {
  return cloudTypeFilterMap[type || ''] || DEFAULT_CLOUD_TYPES
}

export const transformMergedByTypeToLegacyList = (
  mergedByType: Record<string, PansouItem[]>,
  page = 1,
  size = 10,
) => {
  const flatList = Object.entries(mergedByType || {}).flatMap(([cloudType, items]) => {
    return (items || []).filter((item) => !isInvalidResource(item)).map((item, index) => {
      const safeTitle = escapeHtml(fixMojibake(item.note) || item.url || `资源 ${index + 1}`)
      const safeSource = item.source ? escapeHtml(fixMojibake(item.source) || item.source) : 'PanSou'
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
