<template>
  <div class="ubox-button" @click="onClick">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import {} from "vue"
const loading = ref(false)
const emits = defineEmits<{
  (e: "onClick"): Promise<any> | any
}>()

async function onClick() {
  try {
    if (loading.value) return
    loading.value = true
    await emits("onClick") // 如果有页面跳转可能会关不掉
    loading.value = false
  } catch (error) {
    console.log("组件onClick有错误抛出:", error)
  }
}
</script>

<style scoped lang="less">
.ubox-button {
}
</style>
