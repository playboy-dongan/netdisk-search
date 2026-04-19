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

type LegacySearchItem = {
  link: string
  disk_name: string
  files: string
  disk_type: string
  disk_pass: string
  update_time: string
}

type ShareCheckCacheEntry = {
  active: boolean
  checkedAt: number
}

export const FAST_SEARCH_ENGINE = 2
export const DEEP_SEARCH_ENGINE = 4
export const DEFAULT_CLOUD_TYPES = ['baidu', 'aliyun', 'quark', 'xunlei']

const DEFAULT_PANSOU_API_BASE = 'https://so.252035.xyz'
const MAX_KEYWORD_LENGTH = 50
const SHARE_CHECK_TIMEOUT_MS = 2200
const SHARE_CHECK_CONCURRENCY = 8
const SHARE_CHECK_CACHE_TTL_MS = 5 * 60 * 1000
const SHARE_CHECK_CACHE_MAX_SIZE = 1000

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

const invalidSharePagePatterns = [
  /分享(?:已)?(?:取消|删除|失效|过期|不存在)/,
  /链接(?:已)?(?:失效|无效|不存在|过期)/,
  /资源(?:已)?(?:失效|删除|下架|不存在)/,
  /文件(?:已)?(?:删除|不存在|过期)/,
  /页面不存在/,
  /来晚了/,
  /无法访问/,
  /暂时无法查看/,
  /违规|敏感内容/,
  /not\s*found/i,
  /invalid|expired|deleted|unavailable/i,
]

const globalShareCheckCache = globalThis as typeof globalThis & {
  __NETDISK_SHARE_CHECK_CACHE__?: Map<string, ShareCheckCacheEntry>
}

if (!globalShareCheckCache.__NETDISK_SHARE_CHECK_CACHE__) {
  globalShareCheckCache.__NETDISK_SHARE_CHECK_CACHE__ = new Map<string, ShareCheckCacheEntry>()
}

const shareCheckCache = globalShareCheckCache.__NETDISK_SHARE_CHECK_CACHE__!

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

const normalizeShareUrl = (value?: string) => {
  const url = String(value || '').trim()

  if (!url) {
    return null
  }

  try {
    const parsedUrl = new URL(url)

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return null
    }

    return parsedUrl
  } catch {
    return null
  }
}

const isKnownShareUrlShape = (value?: string) => {
  const parsedUrl = normalizeShareUrl(value)

  if (!parsedUrl) {
    return false
  }

  const host = parsedUrl.hostname.replace(/^www\./, '').toLowerCase()
  const path = parsedUrl.pathname

  if (host === 'pan.xunlei.com') {
    return /^\/s\/[A-Za-z0-9_-]{8,}/.test(path)
  }

  if (host === 'pan.quark.cn') {
    return /^\/s\/[A-Za-z0-9_-]{10,}/.test(path)
  }

  if (host === 'pan.baidu.com') {
    return /^\/s\/1[A-Za-z0-9_-]{5,}/.test(path)
      || (path === '/share/init' && (parsedUrl.searchParams.get('surl') || '').length >= 5)
  }

  if (host === 'alipan.com' || host === 'aliyundrive.com') {
    return /^\/s\/[A-Za-z0-9_-]{10,}/.test(path)
  }

  return false
}

const getCachedShareCheck = (url: string) => {
  const cached = shareCheckCache.get(url)

  if (!cached || Date.now() - cached.checkedAt > SHARE_CHECK_CACHE_TTL_MS) {
    return null
  }

  return cached.active
}

const setCachedShareCheck = (url: string, active: boolean) => {
  shareCheckCache.set(url, {
    active,
    checkedAt: Date.now(),
  })

  if (shareCheckCache.size > SHARE_CHECK_CACHE_MAX_SIZE) {
    const oldestKey = shareCheckCache.keys().next().value

    if (oldestKey) {
      shareCheckCache.delete(oldestKey)
    }
  }
}

const isInvalidSharePage = (text: string) => {
  return invalidSharePagePatterns.some((pattern) => pattern.test(text))
}

const requestSharePageText = async (url: string) => {
  return await $fetch<string>(url, {
    method: 'GET',
    responseType: 'text',
    retry: 0,
    timeout: SHARE_CHECK_TIMEOUT_MS,
    headers: {
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    },
  })
}

export const isShareLinkActive = async (url: string) => {
  if (!isKnownShareUrlShape(url)) {
    return false
  }

  const cached = getCachedShareCheck(url)

  if (cached !== null) {
    return cached
  }

  try {
    const text = await requestSharePageText(url)
    const active = Boolean(text) && !isInvalidSharePage(text.slice(0, 120000))

    setCachedShareCheck(url, active)

    return active
  } catch {
    setCachedShareCheck(url, false)

    return false
  }
}

const buildLegacySearchItems = (
  mergedByType: Record<string, PansouItem[]>,
) => {
  return Object.entries(mergedByType || {}).flatMap(([cloudType, items]) => {
    return (items || []).filter((item) => {
      return !isInvalidResource(item) && isKnownShareUrlShape(item.url)
    }).map((item, index): LegacySearchItem => {
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
}

export const filterActiveShareLinks = async (
  items: LegacySearchItem[],
  page = 1,
  size = 10,
) => {
  const start = Math.max(page - 1, 0) * size
  const end = start + size
  const activeItems: LegacySearchItem[] = []

  for (let index = 0; index < items.length && activeItems.length < end; index += SHARE_CHECK_CONCURRENCY) {
    const batch = items.slice(index, index + SHARE_CHECK_CONCURRENCY)
    const checkedBatch = await Promise.all(batch.map(async (item) => {
      return await isShareLinkActive(item.link) ? item : null
    }))

    const activeBatch = checkedBatch.filter((item): item is LegacySearchItem => Boolean(item))
    activeItems.push(...activeBatch)
  }

  return {
    list: activeItems.slice(start, end),
    total: items.length,
  }
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

export const transformMergedByTypeToValidatedLegacyList = async (
  mergedByType: Record<string, PansouItem[]>,
  page = 1,
  size = 10,
) => {
  return await filterActiveShareLinks(
    buildLegacySearchItems(mergedByType),
    page,
    size,
  )
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
