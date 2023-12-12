<template>
  <img :src="shareData.displayImage" @click="onGoBack" />
</template>

<script setup lang="ts">
import { useShareData } from "@/store"
import { } from "vue"
import { useRouter } from "vue-router";
const shareData = useShareData()
const router = useRouter()
function onGoBack() {
  router.back()
}
</script>

<style scoped lang="less">
img {
  height: 100%;
  width: 100%;
}
</style>
