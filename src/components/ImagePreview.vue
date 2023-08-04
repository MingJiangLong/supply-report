<template>
  <Overlay :show="props.show">
    <div class="submit-success-component">
      <div>
        <img :src="props.imageUrl" v-if="props.imageUrl"/>
        <div>
          <input type="file" accept="image/*" capture="environment" @input="onInput" />
          重拍
        </div>
      </div>
      <img src="@/assets/img/btn_search_close.png" @click="onClose" />
    </div>
  </Overlay>
</template>

<script setup lang="ts">
import {} from "vue"
import { Overlay } from "vant"
const props = defineProps<{
  show: boolean
  imageUrl?: string
}>()
const emits = defineEmits<{
  (e: "onTakePhotoAgain", item: any): void
  (e: "update:show", show: boolean): void
}>()

function onClose() {
  emits("update:show", false)
}

function onInput(e:any) {
  emits("onTakePhotoAgain", e)
}
</script>

<style scoped lang="less">
.submit-success-component {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  font-size: 14px;
  color: #3b3b3b;
  text-align: center;
  font-weight: 500;
  img {
    width: 44px;
    height: 44px;
    margin-top: 22px;
  }

  div:first-child {
    width: 304px;
    height: 390px;
    border-radius: 8px;
    background: #ffffff;
    div:last-child {
      font-size: 16px;
      font-weight: 500;
      width: 122px;
      height: 38px;
      border-radius: 22px;
      color: #737373;
      background: #f4f6f8;
      border-radius: 22px;
      text-align: center;
      line-height: 38px;
      margin: auto;
      margin-top: 19px;
      position: relative;
    }
    img {
      width: 278px;
      height: 278px;
      margin: 14px;
    }
  }
}
input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: pointer;
  opacity: 0;
}
</style>
