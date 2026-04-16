import { siteConfig } from './utils/site'

export default defineNuxtConfig({
    devtools: { enabled: false },
    app: {
        head: {
            title: siteConfig.name,
            titleTemplate: `%s - ${siteConfig.name}`,
            meta: [
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'description', content: siteConfig.description },
                { name: 'keywords', content: '网盘搜索,阿里云盘,百度网盘,夸克网盘,迅雷网盘,网盘搜搜' },
                {
                    name: 'referrer',
                    content: 'strict-origin-when-cross-origin'
                }
            ],
            link: [{ rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' }],
            script: [
                {
                    key: 'google-adsense',
                    async: true,
                    src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2901994507892320',
                    crossorigin: 'anonymous'
                }
            ]
        }
    },
    modules: [
        '@element-plus/nuxt',
        '@nuxtjs/tailwindcss',
        '@nuxtjs/device',
        '@nuxtjs/i18n',
        '@nuxtjs/google-fonts',
        '@nuxtjs/color-mode'
    ],
    colorMode: {
        preference: 'light',
        classSuffix: ''
    },
    tailwindcss: {
        configPath: 'tailwind.config.js'
    },
    googleFonts: {
        display: 'swap',
        prefetch: false,
        preconnect: false,
        preload: true,
        download: false,
        base64: false,
        families: {
            Inter: [100, 200, 300, 400, 500, 600, 700, 800, 900],
            'Poetsen One': [100, 200, 300, 400, 500, 600, 700, 800, 900],
            'Sedan SC': [100, 200, 300, 400, 500, 600, 700, 800, 900],
            'Briem Hand': [100, 200, 300, 400, 500, 600, 700, 800, 900],
            'Noto Sans Simplified Chinese': [100, 200, 300, 400, 500, 600, 700, 800, 900]
        }
    },
    i18n: {
        defaultLocale: 'cn',
        langDir: './assets/lang/',
        locales: [
            {
                code: 'en',
                name: 'English',
                iso: 'en-US',
                file: 'en-US.json'
            },
            {
                code: 'cn',
                name: '中文',
                iso: 'zh-CN',
                file: 'zh-CN.json'
            }
        ]
    },
    plugins: [],
    nitro: {
        devProxy: {}
    },
    runtimeConfig: {
        openaiApiKey: '',
        proxyUrl: '',
        pansouApiBase: process.env.PANSOU_API_BASE || 'https://so.252035.xyz',
        public: {
            googleAnalyticsId: process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID || '',
        }
    }
})
