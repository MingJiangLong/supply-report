<template>
  <div style="display: flex;flex-direction: row;">
    <div>机器号</div>
    <div>{{ shareData.vm }}</div>
  </div>
  <div>{{ shareData.nodeName }}</div>
  <!-- <div>
    <img class="icon" src="@/assets/img/icon_machine.png" />
    <span class="h18">{{ shareData.vm }}</span>
    <span class="h14" style="color: #737373">({{ shareData.nodeName }})</span>
  </div> -->
</template>

<script setup lang="ts">
import { useShareData } from "@/store";
import { } from "vue"
import { Row, Col } from 'vant'
const shareData = useShareData()

</script>

<style scoped lang="less">
@icon-size: 14px;

img[class="icon"] {
  width: @icon-size;
  height: @icon-size;
}

span[class="h18"] {
  padding-left: 6px;
}

span[class="h14"] {
  padding-left: 4px;
}

div {
  padding: 24px 0 12px;
}
</style>
