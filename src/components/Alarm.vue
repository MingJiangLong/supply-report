<template>
  <div class="row notice">
    <img src="@/assets/img/notice.png" alt="" />
    <span>{{ props.message }}</span>
  </div>
</template>

<script setup lang="ts">
import {} from "vue"
const props = defineProps<{ message: string }>()
</script>

<style scoped lang="less">
.notice {
  @image-size: 20px;
  padding: 12px 0;

  img {
    width: @image-size;
    height: @image-size;
  }
  span {
    font-size: 14px;
    color: #ff6600;
    font-weight: 500;
    padding-left: 5px;
  }
}
</style>
