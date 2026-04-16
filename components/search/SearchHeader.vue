<script setup lang="ts">
import { Search as SearchIcon } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { siteConfig } from '~/utils/site'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const props = defineProps({
  keyword: {
    type: String,
    default: () => ''
  }
})

const searchKeyword = ref(props.keyword)
const emit = defineEmits(['search'])

const search = () => {
  emit('search', searchKeyword.value)
}

const colorMode = useColorMode()

watch(() => props.keyword, (value) => {
  searchKeyword.value = value
})
</script>

<template>
  <el-affix>
    <div class="min-w-0 overflow-x-hidden bg-white px-[10px] py-[10px] shadow dark:bg-gray-800 md:px-[20px]">
      <div class="mx-auto flex max-w-[1240px] flex-col gap-3">
        <div class="relative flex min-h-[40px] flex-row items-center gap-2 md:gap-4">
          <div class="flex shrink-0 flex-row items-center gap-2">
            <img class="h-[30px] w-[30px] cursor-pointer md:h-[40px] md:w-[40px]" :src="siteConfig.logo" alt="logo" @click="goHome()">
            <h1 class="hidden cursor-pointer text-[14px] font-serif font-bold dark:text-white md:block" @click="goHome()">
              {{ siteConfig.shortName }}
            </h1>
          </div>

          <div class="header-search-control flex min-w-0 flex-1 items-center gap-2 md:max-w-[520px]">
            <div class="relative min-w-0 flex-1">
              <SearchIcon class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                v-model="searchKeyword"
                class="h-10 rounded-full border-slate-200 bg-white pl-10 shadow-sm dark:bg-gray-900"
                placeholder="输入关键词后回车或点击搜索"
                @keydown.enter="search()"
              />
            </div>

            <Button class="header-search-button rounded-full px-6" @click="search()">搜索</Button>
          </div>

          <div class="hidden items-center md:absolute md:right-[20px] md:flex">
            <client-only>
              <el-button v-if="colorMode.preference === 'dark'" link @click="colorMode.preference = 'light'">
                <img class="h-[20px] w-[20px]" src="@/assets/theme/entypo--light-up.svg" alt="light mode">
              </el-button>
              <el-button v-if="colorMode.preference === 'light'" link @click="colorMode.preference = 'dark'">
                <img class="h-[20px] w-[20px]" src="@/assets/theme/icon-park-solid--dark-mode.svg" alt="dark mode">
              </el-button>
            </client-only>
          </div>
        </div>

        <Button class="mobile-search-button w-full rounded-full" @click="search()">搜索</Button>
      </div>
    </div>
  </el-affix>
</template>

<style scoped lang="scss">
.mobile-search-button {
  display: none;
}

@media screen and (max-width: 639px) {
  .header-search-control {
    flex: 0 1 auto;
    width: calc(100vw - 96px) !important;
  }

  .header-search-button {
    display: none !important;
  }

  .mobile-search-button {
    display: inline-flex !important;
  }
}
</style>
