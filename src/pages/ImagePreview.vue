<template>
  <img :src="shareData.displayImage" />
</template>

<script setup lang="ts">
import { useShareData } from "@/store"
import {} from "vue"
const shareData = useShareData()
</script>

<style scoped lang="less">
img {
  height: 100%;
  width: 100%;
}
</style>
