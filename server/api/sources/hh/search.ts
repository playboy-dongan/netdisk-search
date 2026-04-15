import {
    DEEP_SEARCH_ENGINE,
    FAST_SEARCH_ENGINE,
    clampPositiveNumber,
    getPansouApiBase,
    mapCurrentTypeToCloudTypes,
    normalizeEngine,
    normalizeKeyword,
    transformMergedByTypeToLegacyList
} from '~/server/utils/pansou'

type PansouSearchResponse = {
    code: number
    message?: string
    data?: {
        merged_by_type?: Record<string, any[]>
    }
}

type LegacySearchData = {
    list: any[]
    total: number
}

type CacheEntry = {
    data: LegacySearchData
    updatedAt: number
}

type SearchPlan = {
    src: 'all' | 'tg'
    conc: number
    timeout: number
}

const FRESH_CACHE_TTL_MS = 5 * 60 * 1000
const STALE_CACHE_TTL_MS = 30 * 60 * 1000
const FAST_MODE_TIMEOUT_MS = 6000
const DEEP_MODE_TIMEOUT_MS = 3500

const globalCache = globalThis as typeof globalThis & {
    __NETDISK_SEARCH_CACHE__?: Map<string, CacheEntry>
}

if (!globalCache.__NETDISK_SEARCH_CACHE__) {
    globalCache.__NETDISK_SEARCH_CACHE__ = new Map<string, CacheEntry>()
}

const searchCache = globalCache.__NETDISK_SEARCH_CACHE__

const buildCacheKey = (params: Record<string, unknown>) => JSON.stringify(params)

const getCachedResult = (cacheKey: string, maxAgeMs: number) => {
    const cached = searchCache.get(cacheKey)

    if (!cached) {
        return null
    }

    if (Date.now() - cached.updatedAt > maxAgeMs) {
        return null
    }

    return cached.data
}

const setCachedResult = (cacheKey: string, data: LegacySearchData) => {
    searchCache.set(cacheKey, {
        data,
        updatedAt: Date.now(),
    })
}

const requestPansou = async (
    pansouApiBase: string,
    keyword: string,
    cloudTypes: string[],
    plan: SearchPlan,
) => {
    return await $fetch<PansouSearchResponse>(`${pansouApiBase}/api/search`, {
        method: 'GET',
        query: {
            kw: keyword,
            res: 'merged_by_type',
            src: plan.src,
            cloud_types: cloudTypes.length ? cloudTypes.join(',') : undefined,
            conc: plan.conc,
        },
        retry: 0,
        timeout: plan.timeout,
    })
}

const getSearchPlans = (engine: number): SearchPlan[] => {
    if (engine === DEEP_SEARCH_ENGINE) {
        return [
            { src: 'all', conc: 1, timeout: DEEP_MODE_TIMEOUT_MS },
            { src: 'tg', conc: 1, timeout: FAST_MODE_TIMEOUT_MS },
        ]
    }

    return [
        { src: 'tg', conc: 1, timeout: FAST_MODE_TIMEOUT_MS },
        { src: 'all', conc: 1, timeout: DEEP_MODE_TIMEOUT_MS },
    ]
}

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const keyword = normalizeKeyword(body.q)
        const page = clampPositiveNumber(body.page, 1, 100, 1)
        const size = clampPositiveNumber(body.size, 1, 20, 10)

        if (!keyword) {
            return {
                code: 200,
                data: {
                    list: [],
                    total: 0,
                }
            }
        }

        const engine = normalizeEngine(Number(body.engine))
        const cloudTypes = mapCurrentTypeToCloudTypes(body.type)
        const pansouApiBase = getPansouApiBase()
        const cacheKey = buildCacheKey({
            engine,
            keyword,
            page,
            size,
            type: body.type || '',
        })

        const freshCache = getCachedResult(cacheKey, FRESH_CACHE_TTL_MS)
        if (freshCache) {
            return {
                code: 200,
                data: freshCache,
            }
        }

        const searchPlans = getSearchPlans(engine)
        let lastError = ''

        for (const [index, plan] of searchPlans.entries()) {
            try {
                const response = await requestPansou(pansouApiBase, keyword, cloudTypes, plan)

                if (response.code !== 0) {
                    lastError = response.message || '搜索源返回异常'
                    continue
                }

                const transformedData = transformMergedByTypeToLegacyList(
                    response.data?.merged_by_type || {},
                    page,
                    size,
                )

                if (!transformedData.total && index < searchPlans.length - 1) {
                    continue
                }

                setCachedResult(cacheKey, transformedData)

                return {
                    code: 200,
                    data: transformedData,
                }
            } catch (error: any) {
                lastError = error?.data?.message || error?.message || '搜索源请求失败'
            }
        }

        const staleCache = getCachedResult(cacheKey, STALE_CACHE_TTL_MS)
        if (staleCache) {
            return {
                code: 200,
                data: staleCache,
            }
        }

        return {
            code: 500,
            msg: engine === FAST_SEARCH_ENGINE
                ? '快速搜索当前较忙，请稍后再试或切换到深度搜索'
                : lastError || '深度搜索当前较慢，请稍后再试',
        }
    } catch (error) {
        console.log(error)
        return {
            code: 500,
            msg: 'PanSou API 暂时不可用，请稍后再试',
        }
    }
})
