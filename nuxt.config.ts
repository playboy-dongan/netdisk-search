import { siteConfig } from './utils/site'

const siteUrl = siteConfig.domain.replace(/\/$/, '')
const shareImageUrl = `${siteUrl}/og-image.png`
const defaultCloudflareWebAnalyticsToken = '7b6603cb63f74f2e835ad2dd7fc1e8eb'
const cloudflareWebAnalyticsToken =
    process.env.NUXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN ||
    process.env.CLOUDFLARE_WEB_ANALYTICS_TOKEN ||
    defaultCloudflareWebAnalyticsToken
const cloudflareWebAnalyticsScript = cloudflareWebAnalyticsToken
    ? [
        {
            key: 'cloudflare-web-analytics',
            defer: true,
            src: 'https://static.cloudflareinsights.com/beacon.min.js',
            'data-cf-beacon': JSON.stringify({ token: cloudflareWebAnalyticsToken }),
            tagPosition: 'bodyClose'
        }
    ]
    : []

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
                },
                { name: 'theme-color', content: '#ffffff' },
                { property: 'og:type', content: 'website' },
                { property: 'og:site_name', content: siteConfig.name },
                { property: 'og:image', content: shareImageUrl },
                { property: 'og:image:secure_url', content: shareImageUrl },
                { property: 'og:image:type', content: 'image/png' },
                { property: 'og:image:width', content: '1200' },
                { property: 'og:image:height', content: '630' },
                { property: 'og:image:alt', content: 'Netdisk Search share preview' },
                { name: 'twitter:card', content: 'summary_large_image' },
                { name: 'twitter:title', content: siteConfig.name },
                { name: 'twitter:description', content: siteConfig.description },
                { name: 'twitter:image', content: shareImageUrl }
            ],
            link: [
                { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
                { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
                { rel: 'shortcut icon', href: '/favicon.ico' },
                { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }
            ],
            script: [
                {
                    key: 'google-adsense',
                    async: true,
                    src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2901994507892320',
                    crossorigin: 'anonymous'
                },
                ...cloudflareWebAnalyticsScript
            ]
        }
    },
    css: ['~/assets/css/shadcn.css'],
    modules: [
        '@element-plus/nuxt',
        '@nuxtjs/tailwindcss',
        '@nuxtjs/device',
        '@nuxtjs/i18n',
        '@nuxtjs/google-fonts',
        '@nuxtjs/color-mode',
        'shadcn-nuxt'
    ],
    shadcn: {
        prefix: '',
        componentDir: '@/components/ui'
    },
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
