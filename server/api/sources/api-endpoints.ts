export default defineEventHandler(() => {
    return [
        {
            engine: 2,
            engine_name: 'PanSou 快速搜索（推荐）',
            url: '/api/sources/hh/search',
            latest_url: '/api/sources/hh/latest-sources',
            doc_url: '/api/sources/hh/doc',
            adv_params: {}
        },
        {
            engine: 4,
            engine_name: 'PanSou 深度搜索（较慢）',
            url: '/api/sources/hh/search',
            latest_url: '/api/sources/hh/latest-sources',
            doc_url: '/api/sources/hh/doc',
            adv_params: {}
        }
    ]
})
