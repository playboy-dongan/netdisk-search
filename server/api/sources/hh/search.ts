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
    name: string
    src: 'all' | 'tg' | 'plugin'
    timeout: number
    delayMs?: number
    plugins?: string[]
}

const FRESH_CACHE_TTL_MS = 5 * 60 * 1000
const STALE_CACHE_TTL_MS = 30 * 60 * 1000
const FAST_PRIMARY_TIMEOUT_MS = 2500
const FAST_PLUGIN_TIMEOUT_MS = 2200
const FAST_FALLBACK_TIMEOUT_MS = 4800
const FAST_FALLBACK_DELAY_MS = 80
const DEEP_MODE_TIMEOUT_MS = 9000

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
    return error?.data?.message || error?.message || '搜索请求失败'
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

    if (plan.plugins?.length) {
        query.plugins = plan.plugins.join(',')
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
        throw new Error(response.message || '搜索源返回异常')
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
            { name: 'fallback_all', src: 'all', timeout: DEEP_MODE_TIMEOUT_MS },
        ]
    }

    return [
        { name: 'fast_tg', src: 'tg', timeout: FAST_PRIMARY_TIMEOUT_MS },
        { name: 'plugin_labi', src: 'plugin', plugins: ['labi'], timeout: FAST_PLUGIN_TIMEOUT_MS },
        { name: 'plugin_pansearch', src: 'plugin', plugins: ['pansearch'], timeout: FAST_PLUGIN_TIMEOUT_MS },
        { name: 'fallback_all', src: 'all', timeout: FAST_FALLBACK_TIMEOUT_MS, delayMs: FAST_FALLBACK_DELAY_MS },
    ]
}

const abortControllerSafely = (controller: AbortController | null) => {
    if (!controller || controller.signal.aborted) {
        return
    }

    controller.abort()
}

const abortOtherPlans = (
    controllers: Array<{ name: string, controller: AbortController | null }>,
    winner: string,
) => {
    for (const item of controllers) {
        if (item.name !== winner) {
            abortControllerSafely(item.controller)
        }
    }
}

const runFastSearchPlan = async (
    pansouApiBase: string,
    keyword: string,
    cloudTypes: string[],
    page: number,
    size: number,
    plans: SearchPlan[],
) => {
    const planControllers = plans.map((plan) => ({
        name: plan.name,
        controller: typeof AbortController !== 'undefined'
            ? new AbortController()
            : null,
    }))

    const planTasks = plans.map((plan, index) =>
        runPlan(
            pansouApiBase,
            keyword,
            cloudTypes,
            page,
            size,
            plan,
            planControllers[index]?.controller?.signal,
        )
            .then((data) => ({
                name: plan.name,
                success: true,
                data,
                error: '',
            }))
            .catch((error: any) => ({
                name: plan.name,
                success: false,
                data: emptySearchData(),
                error: getErrorMessage(error),
            }))
    )

    const wrappedTasks = planTasks.map((task, index) =>
        task.then((result) => ({
            index,
            result,
        }))
    )
    const pendingTaskIndexes = new Set(wrappedTasks.map((_, index) => index))

    let firstSuccessfulEmptyData: LegacySearchData | null = null
    let lastError = ''
    let hasSuccessfulResponse = false

    while (pendingTaskIndexes.size) {
        const { index, result } = await Promise.race(
            Array.from(pendingTaskIndexes).map((taskIndex) => wrappedTasks[taskIndex])
        )

        pendingTaskIndexes.delete(index)

        if (result.success) {
            hasSuccessfulResponse = true

            if (result.data.total > 0) {
                abortOtherPlans(planControllers, result.name)

                return {
                    data: result.data,
                    lastError,
                    hasSuccessfulResponse,
                }
            }

            firstSuccessfulEmptyData = firstSuccessfulEmptyData || result.data
            continue
        }

        if (result.error !== 'Search aborted') {
            lastError = result.error || lastError
        }
    }

    return {
        data: firstSuccessfulEmptyData || emptySearchData(),
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

        const staleCache = getCachedResult(cacheKey, STALE_CACHE_TTL_MS)
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
            if (data.total > 0) {
                setCachedResult(cacheKey, data)
            } else if (staleCache?.total) {
                return {
                    code: 200,
                    data: staleCache,
                }
            }

            return {
                code: 200,
                data,
            }
        }

        if (staleCache) {
            return {
                code: 200,
                data: staleCache,
            }
        }

        return {
            code: 500,
            msg: engine === FAST_SEARCH_ENGINE
                ? (lastError || '搜索源响应较慢，请稍后重试')
                : (lastError || '补充搜索结果加载失败，请稍后再试'),
        }
    } catch (error) {
        console.log(error)

        return {
            code: 500,
            msg: 'PanSou API 暂时不可用，请稍后再试',
        }
    }
})
