export default defineEventHandler(() => {
    return [
        {
            engine: 2,
            engine_name: '自动搜索',
            url: '/api/sources/hh/search',
            latest_url: '/api/sources/hh/latest-sources',
            doc_url: '/api/sources/hh/doc',
            adv_params: {}
        }
    ]
})
