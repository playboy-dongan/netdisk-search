export default defineEventHandler(() => {
    return [
        {
            engine: 2,
            engine_name: 'PanSou 聚合搜索',
            url: '/api/sources/hh/search',
            latest_url: '/api/sources/hh/latest-sources',
            doc_url: '/api/sources/hh/doc',
            adv_params: {}
        },
        {
            engine: 3,
            engine_name: 'PanSou 仅插件',
            url: '/api/sources/hh/search',
            latest_url: '/api/sources/hh/latest-sources',
            doc_url: '/api/sources/hh/doc',
            adv_params: {}
        },
        {
            engine: 4,
            engine_name: 'PanSou 仅 TG 频道',
            url: '/api/sources/hh/search',
            latest_url: '/api/sources/hh/latest-sources',
            doc_url: '/api/sources/hh/doc',
            adv_params: {}
        }
    ]
})
