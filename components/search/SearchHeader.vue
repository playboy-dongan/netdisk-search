<script setup lang="ts">
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
            <div class="min-w-0 flex-1 overflow-hidden rounded-[50px] border border-slate-300 font-mono">
              <client-only>
                <el-input
                  v-model="searchKeyword"
                  class="h-[30px]"
                  placeholder="输入关键词后回车或点击搜索"
                  @keydown.enter="search()"
                  prefix-icon="Search"
                />
              </client-only>
            </div>

            <client-only>
              <el-button class="header-search-button shrink-0" type="primary" round @click="search()">搜索</el-button>
            </client-only>
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

        <client-only>
          <el-button class="mobile-search-button w-full" type="primary" round @click="search()">搜索</el-button>
        </client-only>
      </div>
    </div>
  </el-affix>
</template>

<style scoped lang="scss">
:deep(.el-input__inner) {
  height: 48px;
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
