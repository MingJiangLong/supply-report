<template>
  <slot v-if="props.status === 'normal'" name="normal"></slot>
  <slot v-else-if="props.status === 'editing'" name="editing"></slot>
  <slot v-else name="confirm"></slot>
</template>

<script setup lang="ts">
import {} from "vue"
const props = defineProps<{
  status: "normal" | "editing" | "confirm"
}>()
</script>

<style scoped lang="less">
</style>
