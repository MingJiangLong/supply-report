<template>
  <div class="image-component-container">
    <div class="img-container">
      <input
        v-if="!!!props.doneUrl"
        type="file"
        accept="image/*"
        capture="environment"
        @input="onInput"
      />
      <img
        class="close"
        v-if="props.doneUrl && !props.onlyDisplay"
        @click="onDelete"
        src="@/assets/img/btn_search_close.png"
      />
      <img v-if="props.doneUrl" :src="props.doneUrl" @click="onImageClick" />
      <img v-else :src="notDoneImage" />
      <div class="upload-overlay" v-if="loading">处理中</div>
    </div>
    <div
      :style="{
        color: '#868686',
        fontWeight: 400,
        textAlign: 'center',
      }"
    >
      {{ props.desc }}
    </div>
  </div>
</template>

<script setup lang="ts">
import {} from "vue"
import notDoneImage from "@/assets/img/pic_none.png"
import { ref } from "vue"
import { showToast } from "vant"
import { addWatermark } from "@/utils"
import { useShareData } from "@/store"
import { initSN } from "@/utils"
import { fetchUploadInfo } from "@/service"
//@ts-ignore
import OSS from "ali-oss"
const shareData = useShareData()
const props = defineProps<{
  doneUrl?: string
  desc?: string
  onlyDisplay?: true
}>()

const emit = defineEmits<{
  (e: "afterUpload", item: any): void
  (e: "onImageClick"): void
  (e: "onDelete"): void
}>()

function readFileAsDateUrl(file: File): Promise<string> {
  return new Promise<string>(s => {
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = function (_e) {
      s(reader.result as string)
    }
  })
}

function onImageClick() {
  emit("onImageClick")
}

function onDelete() {
  emit("onDelete")
}
async function onInput(e: any) {
  try {
    loading.value = true
    let file = e.target.files[0] as File
    const imageSource = await readFileAsDateUrl(file)
    const image = new Image()

    image.src = imageSource

    image.onload = async function () {
      let sn = initSN(true)
      let newImage = await addWatermark(image, [
        shareData.VM(),
        shareData.nodeName,
        sn,
      ])

      const temp = await fetchUploadInfo()
      if (temp?.head?.code != 200)
        return showToast({ message: "获取上传信息失败!", type: "fail" })
      const uploadInfo = temp?.body
      const store = new OSS({
        accessKeyId: uploadInfo.accessKeyId,
        accessKeySecret: uploadInfo.accessKeySecret,
        bucket: uploadInfo.bucket,
        endpoint: uploadInfo.endpoint,
        stsToken: uploadInfo.securityToken,
      })
      if (!newImage) return
      store
        .put(`supply-report/${sn}.png`, newImage)
        .then((result: any) => {
          loading.value = false
          emit("afterUpload", result?.url)
        })
        .catch(() => {
          loading.value = false
          showToast({ message: "上传失败", type: "fail" })
        })
    }
  } catch (error) {
    showToast(`${props.desc}上传失败,请重试!`)
    loading.value = false
  }
}

const loading = ref(false)
</script>

<style scoped lang="less">
@image-size: 100px;
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
img {
  width: 99px;
  height: 99px;
  border-radius: 8px;
}
.img-container {
  width: @image-size;
  height: @image-size;
  margin: 12.5px 12.5px 12.5px 0;
  position: relative;
  border-radius: 8px;
  border: 1px solid var(--ubox-disable);
  // display: flex;
  // justify-content: center;
}
.image-component-container {
  font-size: 14px;
  font-weight: 500;
}
.upload-overlay {
  width: @image-size;
  height: @image-size;
  position: absolute;
  background: rgba(0, 0, 0, 0.6);
  top: 0;
  left: 0;
  color: #fff;
  text-align: center;
  line-height: @image-size;
}
@icon-size: 24px;
.close {
  position: absolute;
  width: @icon-size;
  height: @icon-size;
  right: 0;
  border-radius: @icon-size;
  top: 0;
  font-size: 20px;
  background: rgba(0, 0, 0, 0.6);
}
</style>
