<script setup>
import SiteLegalLinks from '~/components/common/SiteLegalLinks.vue'
import { siteConfig, siteDisclaimerText } from '~/utils/site'

definePageMeta({
  layout: 'custom',
})

useSeoMeta({
  title: '免费网盘资源搜索',
  description: siteConfig.description,
  ogTitle: siteConfig.name,
  ogDescription: siteConfig.description,
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

const colorMode = useColorMode()
const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="min-h-screen bg-[#ffffff] pb-[220px] pt-[60px] dark:bg-gray-800">
    <div class="mx-auto max-w-[1240px] px-[20px] text-right">
      <client-only>
        <el-button v-if="colorMode.preference === 'dark'" link @click="colorMode.preference = 'light'">
          <img class="h-[20px] w-[20px]" src="@/assets/theme/entypo--light-up.svg" alt="light mode">
        </el-button>
        <el-button v-if="colorMode.preference === 'light'" link @click="colorMode.preference = 'dark'">
          <img class="h-[20px] w-[20px]" src="@/assets/theme/icon-park-solid--dark-mode.svg" alt="dark mode">
        </el-button>
      </client-only>
    </div>

    <div class="mt-[80px] flex flex-row items-center justify-center gap-3">
      <img class="h-[40px] w-[40px] sm:h-[60px] sm:w-[60px]" :src="siteConfig.logo" alt="logo">
      <h1 class="text-[20px] font-serif font-bold dark:text-white sm:text-[28px]">{{ siteConfig.name }}</h1>
    </div>

    <div class="mx-auto mt-[20px] max-w-[1240px] px-[20px]">
      <div class="mx-auto flex w-[80%] items-center gap-2 md:w-[700px]">
        <div class="h-[40px] flex-1 overflow-hidden rounded-[50px] border border-slate-300 font-mono sm:h-[50px]">
          <client-only>
            <el-input
              v-model="searchKeyword"
              placeholder="输入关键词后回车或点击搜索"
              @keydown.enter="search(searchKeyword)"
              prefix-icon="Search"
            />
          </client-only>
        </div>

        <client-only>
          <el-button type="primary" round @click="search(searchKeyword)">搜索</el-button>
        </client-only>
      </div>
    </div>

    <div class="mx-auto mt-[20px] max-w-[520px]">
      <div class="flex flex-row flex-wrap justify-center gap-1">
        <el-tag
          v-for="keyword in hotKeywords"
          :key="keyword"
          class="mx-1 cursor-pointer"
          type="info"
          @click="search(keyword)"
        >
          {{ keyword }}
        </el-tag>
      </div>
    </div>

    <div class="fixed bottom-0 left-0 right-0 bg-white p-4 dark:bg-gray-800">
      <div class="mx-auto flex max-w-[1240px] flex-col items-center gap-3">
        <SiteLegalLinks />
        <p class="text-center text-[11px] leading-6 text-slate-400 sm:text-[12px]">
          {{ siteDisclaimerText }}
        </p>
        <p class="text-center text-[11px] text-slate-300 dark:text-slate-500">
          © {{ currentYear }} {{ siteConfig.name }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.el-input__inner) {
  height: 48px;
}

@media screen and (max-width: 768px) {
  :deep(.el-input__inner) {
    height: 37px;
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
