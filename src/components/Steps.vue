<template>
  <div class="steps">
    <template v-for="(item, key) in steps" :key="key">
      <div class="ignore-point-container">
        <div v-if="key < props.current" class="ignore-active"></div>
        <div
          v-else
          class="ignore-not-active"
          :style="{ background: key <= $props.current ? '#ff7500' : '#d2d2d2' }"
        ></div>
        <span
          :style="{
            color: key <= props.current ? '#ff7500' : '#d2d2d2',
            fontWeight: key <= props.current ? '500' : '400',
          }"
          >{{ item }}</span
        >
      </div>
      <div
        class="step-line"
        v-if="key != steps.length - 1"
        :style="{ background: key < props.current ? '#ff7500' : '#DADADA' }"
      ></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue"
const props = defineProps<{ current: number }>()
const steps = reactive(["补货前确认", "补货后确认", "拍照上报"])
</script>

<style scoped lang="less">
.steps {
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 14px;
  height: 90px;
  background: #ffffff;
  padding: 0 40px;
  border-radius: 8px;
}
.step-item {
  width: 44px;
}

span {
  position: absolute;
  top: 25px;
  width: 80px;
  text-align: center;
}
.step-line {
  flex: 1;
  height: 1px;
  margin: 0 20px;
}
@active-size: 18px;
.ignore-point-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: @active-size;
  width: @active-size;
  background: transparent;
  position: relative;
}

@not-active-size: 8px;
.ignore-not-active {
  width: @not-active-size;
  height: @not-active-size;
  // width: 1px;
  // height: 1px;
  background: #ff7500;
  border-radius: @not-active-size;
  // transform: scale(8);
}

.ignore-active {
  height: @active-size;
  width: @active-size;
  border-radius: @active-size;
  background: #ff7500;
  &:after {
    display: block;
    content: "\2713";
    text-align: center;
    color: #ffffff;
  }
}
.step-line {
  height: 1px;
  width: 84px;
}
</style>
