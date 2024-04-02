<!-- 补货后拍照上传 -->
<template>
  <PageContainer>
    <Location />
    <Steps :current="shareData.steps.length - 1" :steps="shareData.steps" />
    <Alarm message="关门后，拍照上报" />
    <div class="card">
      <h5>补货拍照上报</h5>
      <div class="row">
        <Image
               :done-url="eg_small"
               @on-image-click="onEGImagePreview"
               desc="上报示意图"
               only-display />
        <Image
               @after-upload="onUpload"
               :done-url="shareData.imageInfoAfterOpen.url"
               @on-delete="onDeleteImage"
               @on-image-click="onImagePreview"
               desc="拍照上报" />
      </div>
    </div>
    <template v-slot:footer>
      <Button @click="onPreStep">上一步</Button>
      <Button @click="onSubmit" :loading="submitLoading"
              :disabled="!!!shareData.imageInfoAfterOpen.url || haveSubmit">提交</Button>
    </template>

  </PageContainer>
</template>

<script setup lang="ts">
import Alarm from "@/components/Alarm.vue"
import Image from "@/components/Image.vue"
import Location from "@/components/Location.vue"
import Steps from "@/components/Steps.vue"
import PageContainer from "@/components/PageContainer.vue"
import { useShareData } from "@/store"
import eg_small from "@/assets/img/eg_small.png"
import eg_big from "@/assets/img/eg_big.png"
import { ref } from "vue"
import { useRouter } from "vue-router"
import { Button, showToast } from "vant"
import { initSN } from "@/utils"
// import { isProd } from "@/config"
const shareData = useShareData()
const router = useRouter()
const submitLoading = ref(false)
const haveSubmit = ref(false)
function onUpload(dataSource: string) {
  shareData.imageInfoAfterOpen = {
    url: dataSource,
    time: initSN(true)
  }
}


function onDeleteImage() {
  shareData.imageInfoAfterOpen.time = ''
  shareData.imageInfoAfterOpen.url = ''
}

function onEGImagePreview() {
  shareData.displayImage = eg_big
  router.push("preview")
}
function onImagePreview() {
  shareData.displayImage = shareData.imageInfoAfterOpen.url
  router.push("preview")
}
function onPreStep() {
  router.back()
}
async function onSubmit() {
  try {
    if (haveSubmit.value) return
    submitLoading.value = true
    let result: any
    if (shareData.isNormalSupply) {
      result = await shareData.submitWhenNormalSupply()
    } else {
      result = await shareData.submitWhenCountSupply(1)
    }
    if (result?.head?.code != 200) throw new Error(result?.head?.desc)
    haveSubmit.value = true

    showToast({
      message: "提交成功,3s后返回首页!",
      type: "success",
    })
    // if (!isProd) return
    setTimeout(() => {
      shareData.clear()
      window?.ucloud?.postMessage?.(
        JSON.stringify({ code: 10003, msg: "关闭页面" })
      )
    }, 3000)
  } catch (error: any) {
    showToast({
      message: error?.message,
      type: "fail",
    })
  } finally {
    submitLoading.value = false
  }
}


</script>

<style scoped lang="less">
footer {
  display: flex;
  padding: 8px 21px 8px;
  gap: 6px 14px;
  font-size: 18px;

  &>button:first-child {
    background: #ffffff;
    color: #929292;
    border: 1px solid #d1d4de;
    border-radius: 25px;
    flex: 1;
  }

  &>button:last-child {
    background: var(--ubox-btn-background);
    border-radius: 25px;
    color: #ffffff;
    flex: 2;
    border: none;
    margin-left: 10px;
  }
}


.card {
  padding: 23px 14px;

  &>h5 {
    padding: 0;
    margin: 0;
    font-size: 16px;
    color: #3b3b3b;
    font-weight: 500;
  }
}
</style>
