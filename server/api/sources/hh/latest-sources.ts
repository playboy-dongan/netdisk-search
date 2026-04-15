import { buildHotSearchList } from '~/server/utils/pansou'

export default defineEventHandler(async (event) => {
    try {
        const query = await getQuery(event)
        const page = Number(query.page || 1)
        const size = Number(query.size || 10)

        return {
            code: 200,
            data: buildHotSearchList(page, size),
        }
    } catch (e) {
        console.log(e)
        return {
            code: 500,
            msg: 'error',
        }
    }
})
