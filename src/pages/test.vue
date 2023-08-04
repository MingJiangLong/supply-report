<template>
  <div class="component-container">
    <img :src="image" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { onMounted } from "vue"
import {} from "vue"
const image = ref("")
onMounted(() => {
})
</script>

<style scoped lang="less">
.component-container {
}
</style>
