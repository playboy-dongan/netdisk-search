import { getPansouApiBase, mapCurrentTypeToCloudTypes, mapEngineToSource, transformMergedByTypeToLegacyList } from '~/server/utils/pansou'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const keyword = String(body.q || '').trim()
        const page = Number(body.page || 1)
        const size = Number(body.size || 10)

        if (!keyword) {
            return {
                code: 200,
                data: {
                    list: [],
                    total: 0,
                }
            }
        }

        const cloudTypes = mapCurrentTypeToCloudTypes(body.type)
        const src = mapEngineToSource(Number(body.engine))
        const pansouApiBase = getPansouApiBase()

        const res = await $fetch(`${pansouApiBase}/api/search`, {
            method: 'GET',
            query: {
                kw: keyword,
                res: 'merged_by_type',
                src,
                cloud_types: cloudTypes.length ? cloudTypes.join(',') : undefined,
                conc: 8,
            }
        })

        if (res.code !== 0) {
            return {
                code: 500,
                msg: res.message || 'error',
            }
        }

        return {
            code: 200,
            data: transformMergedByTypeToLegacyList(res.data?.merged_by_type || {}, page, size),
        }
    } catch (e) {
        console.log(e)
        return {
            code: 500,
            msg: 'PanSou API 暂时不可用，请稍后再试',
        }
    }
})
