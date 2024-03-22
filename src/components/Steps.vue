<template>
  <Steps
         v-if="realSteps.length > 1"
         :active="props.current"
         inactive-color="#D1D4DE"
         active-color="#FF7500"
         finish-icon="checked">
    <Step v-for="(item, key) in realSteps" :key="key">
      {{ item }}
      <template v-slot:active-icon>
        <div style="height: 8px;width: 8px;border-radius: 8px;background: #FF7500;"></div>
      </template>
    </Step>
  </Steps>
</template>

<script setup lang="ts">
import { reactive, computed } from "vue"
import { Steps, Step } from 'vant'
const realSteps = computed(() => {
  return props.steps ?? steps
})
const props = defineProps<{ current: number, steps?: string[] }>()
const steps = reactive(["补货前确认", "补货后确认", "拍照上报"])
</script>

<style scoped lang="less">
.steps {
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 14px;
  height: 80px;
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
