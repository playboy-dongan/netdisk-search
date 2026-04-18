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
    timeout: number
    delayMs?: number
}

const FRESH_CACHE_TTL_MS = 5 * 60 * 1000
const STALE_CACHE_TTL_MS = 30 * 60 * 1000
const FAST_PRIMARY_TIMEOUT_MS = 3500
const FAST_FALLBACK_TIMEOUT_MS = 5500
const FAST_FALLBACK_DELAY_MS = 900
const DEEP_MODE_TIMEOUT_MS = 10000

const globalCache = globalThis as typeof globalThis & {
    __NETDISK_SEARCH_CACHE__?: Map<string, CacheEntry>
}

if (!globalCache.__NETDISK_SEARCH_CACHE__) {
    globalCache.__NETDISK_SEARCH_CACHE__ = new Map<string, CacheEntry>()
}

const searchCache = globalCache.__NETDISK_SEARCH_CACHE__

const buildCacheKey = (params: Record<string, unknown>) => JSON.stringify(params)

const emptySearchData = (): LegacySearchData => ({
    list: [],
    total: 0,
})

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

const getErrorMessage = (error: any) => {
    return error?.data?.message || error?.message || 'Search request failed'
}

const waitForDelay = (delayMs: number, signal?: AbortSignal) => {
    if (!delayMs) {
        return Promise.resolve()
    }

    return new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
            cleanup()
            resolve()
        }, delayMs)

        const handleAbort = () => {
            clearTimeout(timer)
            cleanup()
            reject(new Error('Search aborted'))
        }

        const cleanup = () => {
            signal?.removeEventListener('abort', handleAbort)
        }

        if (!signal) {
            return
        }

        if (signal.aborted) {
            handleAbort()
            return
        }

        signal.addEventListener('abort', handleAbort, { once: true })
    })
}

const requestPansou = async (
    pansouApiBase: string,
    keyword: string,
    cloudTypes: string[],
    plan: SearchPlan,
    signal?: AbortSignal,
) => {
    const query: Record<string, string | number> = {
        kw: keyword,
        res: 'merged_by_type',
        src: plan.src,
        refresh: 'false',
    }

    if (cloudTypes.length) {
        query.cloud_types = cloudTypes.join(',')
    }

    return await $fetch<PansouSearchResponse>(`${pansouApiBase}/api/search`, {
        method: 'GET',
        query,
        headers: {
            accept: 'application/json,text/plain,*/*',
            'user-agent': 'Cloudflare-Workers',
        },
        retry: 0,
        timeout: plan.timeout,
        signal,
    })
}

const runPlan = async (
    pansouApiBase: string,
    keyword: string,
    cloudTypes: string[],
    page: number,
    size: number,
    plan: SearchPlan,
    signal?: AbortSignal,
) => {
    await waitForDelay(plan.delayMs || 0, signal)

    const response = await requestPansou(pansouApiBase, keyword, cloudTypes, plan, signal)

    if (response.code !== 0) {
        throw new Error(response.message || 'Search source returned an invalid response')
    }

    return transformMergedByTypeToLegacyList(
        response.data?.merged_by_type || {},
        page,
        size,
    )
}

const getSearchPlans = (engine: number): SearchPlan[] => {
    if (engine === DEEP_SEARCH_ENGINE) {
        return [
            { src: 'all', timeout: DEEP_MODE_TIMEOUT_MS },
        ]
    }

    return [
        { src: 'tg', timeout: FAST_PRIMARY_TIMEOUT_MS },
        { src: 'all', timeout: FAST_FALLBACK_TIMEOUT_MS, delayMs: FAST_FALLBACK_DELAY_MS },
    ]
}

const runFastSearchPlan = async (
    pansouApiBase: string,
    keyword: string,
    cloudTypes: string[],
    page: number,
    size: number,
    [primaryPlan, fallbackPlan]: SearchPlan[],
) => {
    const fallbackController = typeof AbortController !== 'undefined'
        ? new AbortController()
        : null

    const fallbackPromise = fallbackPlan
        ? runPlan(
            pansouApiBase,
            keyword,
            cloudTypes,
            page,
            size,
            fallbackPlan,
            fallbackController?.signal,
        )
        : Promise.resolve(emptySearchData())

    let primaryData: LegacySearchData | null = null
    let lastError = ''
    let hasSuccessfulResponse = false

    try {
        primaryData = await runPlan(
            pansouApiBase,
            keyword,
            cloudTypes,
            page,
            size,
            primaryPlan,
        )
        hasSuccessfulResponse = true
    } catch (error: any) {
        lastError = getErrorMessage(error)
    }

    if (primaryData?.total) {
        fallbackController?.abort()
        void fallbackPromise.catch(() => {})

        return {
            data: primaryData,
            lastError,
            hasSuccessfulResponse,
        }
    }

    try {
        const fallbackData = await fallbackPromise
        hasSuccessfulResponse = true

        if (fallbackData.total || !primaryData) {
            return {
                data: fallbackData,
                lastError,
                hasSuccessfulResponse,
            }
        }
    } catch (error: any) {
        const fallbackError = getErrorMessage(error)

        if (fallbackError !== 'Search aborted') {
            lastError = fallbackError
        }
    }

    return {
        data: primaryData || emptySearchData(),
        lastError,
        hasSuccessfulResponse,
    }
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
                data: emptySearchData(),
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
        let data = emptySearchData()
        let lastError = ''
        let hasSuccessfulResponse = false

        if (engine === FAST_SEARCH_ENGINE) {
            const fastSearchResult = await runFastSearchPlan(
                pansouApiBase,
                keyword,
                cloudTypes,
                page,
                size,
                searchPlans,
            )

            data = fastSearchResult.data
            lastError = fastSearchResult.lastError
            hasSuccessfulResponse = fastSearchResult.hasSuccessfulResponse
        } else {
            try {
                data = await runPlan(
                    pansouApiBase,
                    keyword,
                    cloudTypes,
                    page,
                    size,
                    searchPlans[0],
                )
                hasSuccessfulResponse = true
            } catch (error: any) {
                lastError = getErrorMessage(error)
            }
        }

        if (hasSuccessfulResponse) {
            setCachedResult(cacheKey, data)

            return {
                code: 200,
                data,
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
                ? (lastError || 'Fast search timed out, please retry')
                : (lastError || 'Deep search failed, please retry later'),
        }
    } catch (error) {
        console.log(error)

        return {
            code: 500,
            msg: 'PanSou API is temporarily unavailable, please retry later.',
        }
    }
})
