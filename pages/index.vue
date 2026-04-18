<script setup>
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import SiteLegalLinks from '~/components/common/SiteLegalLinks.vue'
import aliImg from '@/assets/netdisk/aliyun.png'
import bdyImg from '@/assets/netdisk/baidu.png'
import quarkImg from '@/assets/netdisk/quark.png'
import xunleiImg from '@/assets/netdisk/xunlei.png'
import { siteConfig, siteDisclaimerText } from '~/utils/site'

definePageMeta({
  layout: 'custom',
})

useSeoMeta({
  title: '免费网盘资源搜索',
  description: siteConfig.description,
  ogTitle: siteConfig.brandTitle,
  ogDescription: siteConfig.description,
  twitterTitle: siteConfig.brandTitle,
  twitterDescription: siteConfig.description,
})

const searchKeyword = ref('')
const router = useRouter()

const search = (keyword) => {
  if (!keyword) {
    return
  }

  router.push({ path: '/search', query: { keyword: encodeURIComponent(keyword) } })
}

const hotKeywords = ref([
  '庆余年',
  '歌手2024',
  '我的阿勒泰',
  '新生',
  '周处除三害',
  '热辣滚烫',
  '第二十条',
  '承欢记',
  '哈哈哈哈哈',
])

const diskEntrances = [
  {
    title: '阿里云盘资源',
    description: '适合查找公开分享的影视、课程、资料合集。',
    keyword: '阿里云盘',
    image: aliImg,
  },
  {
    title: '百度网盘资源',
    description: '适合查找常见公开资料、老资源和学习内容。',
    keyword: '百度网盘',
    image: bdyImg,
  },
  {
    title: '夸克网盘资源',
    description: '适合查找近期热门内容和公开分享合集。',
    keyword: '夸克网盘',
    image: quarkImg,
  },
  {
    title: '迅雷网盘资源',
    description: '适合查找公开转存资源和影视相关内容。',
    keyword: '迅雷网盘',
    image: xunleiImg,
  },
]

const colorMode = useColorMode()
const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="min-w-0 overflow-x-hidden bg-[#ffffff] dark:bg-gray-800">
    <main id="home-search-area" class="min-h-screen pb-12 pt-[48px] sm:pt-[60px]">
      <div class="mx-auto max-w-[1240px] px-[20px] text-right">
        <client-only>
          <el-button v-if="colorMode.preference === 'dark'" link @click="colorMode.preference = 'light'">
            <img class="h-[20px] w-[20px]" src="@/assets/theme/entypo--light-up.svg" :alt="`${siteConfig.brandName} light mode`">
          </el-button>
          <el-button v-if="colorMode.preference === 'light'" link @click="colorMode.preference = 'dark'">
            <img class="h-[20px] w-[20px]" src="@/assets/theme/icon-park-solid--dark-mode.svg" :alt="`${siteConfig.brandName} dark mode`">
          </el-button>
        </client-only>
      </div>

      <div class="mt-[72px] flex flex-row items-center justify-center gap-3 sm:mt-[80px]">
        <img class="h-[40px] w-[40px] sm:h-[60px] sm:w-[60px]" :src="siteConfig.logo" :alt="`${siteConfig.brandTitle} logo`">
        <h1 class="text-[20px] font-serif font-bold dark:text-white sm:text-[28px]">{{ siteConfig.name }}</h1>
      </div>

      <div class="mx-auto mt-[20px] max-w-[1240px] px-[20px]">
        <div class="home-search-controls mx-auto flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <div class="min-w-0 flex-1">
            <Input
              v-model="searchKeyword"
              class="h-12 rounded-full border-slate-200 bg-white px-5 shadow-sm dark:bg-gray-900"
              placeholder="输入关键词后回车或点击搜索"
              @keydown.enter="search(searchKeyword)"
            />
          </div>

          <Button class="h-12 w-full rounded-full px-8 sm:w-auto" @click="search(searchKeyword)">搜索</Button>
        </div>
      </div>

      <div class="home-keyword-list mx-auto mt-[20px]">
        <div class="flex flex-row flex-wrap justify-center gap-2">
          <NuxtLink
            v-for="keyword in hotKeywords"
            :key="keyword"
            class="rounded-[6px] border border-slate-200 bg-slate-50 px-3 py-1 text-[12px] text-slate-600 transition hover:border-blue-300 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-slate-200"
            :to="{ path: '/search', query: { keyword } }"
          >
            {{ keyword }}
          </NuxtLink>
        </div>
      </div>

      <section class="mx-auto mt-16 max-w-[1040px] px-5">
        <h2 class="text-center text-[18px] font-bold text-slate-900 dark:text-white sm:text-[22px]">
          常用网盘入口
        </h2>
        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NuxtLink
            v-for="item in diskEntrances"
            :key="item.title"
            class="group min-w-0"
            :to="{ path: '/search', query: { keyword: item.keyword } }"
          >
            <Card class="h-full border-slate-200 py-0 transition group-hover:-translate-y-0.5 group-hover:border-blue-200 group-hover:shadow-md dark:border-gray-700">
              <CardContent class="p-4">
                <div class="flex items-center gap-3">
                  <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-blue-50 dark:bg-blue-950/40">
                    <img class="h-7 w-7" :src="item.image" :alt="item.title">
                  </span>
                  <h3 class="min-w-0 text-[15px] font-semibold text-slate-900 dark:text-white">{{ item.title }}</h3>
                </div>
                <p class="mt-3 text-[13px] leading-6 text-muted-foreground">
                  {{ item.description }}
                </p>
              </CardContent>
            </Card>
          </NuxtLink>
        </div>
      </section>
    </main>

    <footer id="site-footer" class="bg-white p-4 dark:bg-gray-800">
      <div class="mx-auto flex max-w-[1240px] flex-col items-center gap-3">
        <SiteLegalLinks />
        <p class="text-center text-[11px] leading-6 text-slate-400 sm:text-[12px]">
          {{ siteDisclaimerText }}
        </p>
        <p class="text-center text-[11px] text-slate-300 dark:text-slate-500">
          © {{ currentYear }} {{ siteConfig.brandTitle }}
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.home-search-controls {
  width: 700px;
  max-width: calc(100vw - 72px);
}

.home-keyword-list {
  width: 620px;
  max-width: calc(100vw - 72px);
}

@media screen and (max-width: 768px) {
  .home-search-controls,
  .home-keyword-list {
    width: calc(100vw - 72px) !important;
  }
}

:deep(.el-input__wrapper) {
  box-shadow: none;
}

:deep(.el-input-group__prepend) {
  box-shadow: none;
}

:deep(.el-input) {
  --el-input-focus-border: transparent;
  --el-input-border-color: transparent;
  --el-input-focus-border-color: transparent;
  --el-input-hover-border-color: transparent;
}

:deep(.el-input-group--prepend .el-input-group__prepend .el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: none !important;
}

:deep(.el-input-group--prepend .el-input-group__prepend .el-select .el-input .el-input__inner) {
  text-align: center;
}

:deep(.el-select .el-input__wrapper.is-focus) {
  box-shadow: none !important;
}
</style>
