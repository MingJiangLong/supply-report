<!-- 补货后拍照上传 -->
<template>
  <main>
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
  </main>
  <footer>
    <Button @click="onPreStep">上一步</Button>
    <Button @click="onSubmit" :loading="submitLoading" :disabled="haveSubmit">提交</Button>
    <!-- <button @click="onPreStep">上一步</button>
    <button @click="onSubmit">提交</button> -->
  </footer>
</template>

<script setup lang="ts">
import Alarm from "@/components/Alarm.vue"
import Image from "@/components/Image.vue"
import Location from "@/components/Location.vue"
import Steps from "@/components/Steps.vue"
import { useShareData } from "@/store"
import eg_small from "@/assets/img/eg_small.png"
import eg_big from "@/assets/img/eg_big.png"
import { ref } from "vue"
import { useRouter } from "vue-router"
import { Button, showToast } from "vant"
import { normalSubmit, submit } from "@/service"
import { initSN } from "@/utils"
import { v4 as uuidV4 } from "uuid"
const shareData = useShareData()
const router = useRouter()
const submitLoading = ref(false)
const haveSubmit = ref(false)
function onUpload(dataSource: string) {
  shareData.imageInfoAfterOpen = {
    url: dataSource,
    time: initSN(true)
  }
  // shareData.reportImage = dataSource
}


function onDeleteImage() {
  // shareData.reportImage = ""
  shareData.imageInfoAfterOpen.time = ''
  shareData.imageInfoAfterOpen.url = ''
}

function onEGImagePreview() {
  shareData.displayImage = eg_big
  router.push("preview")
}
function onImagePreview() {
  // shareData.displayImage = shareData.reportImage
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
      const transactionId = uuidV4()
      const sn = initSN()
      result = await normalSubmit({
        vmCode: shareData.VM(),
        transactionId,
        sn,
        loginName: shareData.LOGIN_NAME(),
        productInfo: shareData.goodsList.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productCount: item.recommend_temp,
        })),
        out_trade_no: shareData.OUT_TRADE_NO(),
        prePictures: shareData.imageInfoBeforeOpen.url,
        prePictureTime: shareData.imageInfoBeforeOpen.time,
        pictures: shareData.imageInfoAfterOpen.url,
        pictureTime: shareData.imageInfoAfterOpen.time

      })
    } else {
      result = await submit({
        vmCode: shareData.VM(),
        moment: 1,
        transactionId: shareData.TRANSACTION_ID(),
        out_trade_no: shareData.OUT_TRADE_NO(),
        sn: shareData.SN(),
        loginName: shareData.LOGIN_NAME(),
        productInfo: shareData.goodsList.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productCount: item.recommend_temp,
        })),
        pictures: shareData.imageAfterOpen(),
        pictureTime: shareData.imageInfoAfterOpen.time,
      })

    }
    if (result?.head?.code != 200) throw new Error(result?.head?.desc)
    haveSubmit.value = true

    showToast({
      message: "提交成功,3s后返回首页!",
      type: "success",
    })
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
  }
}

.component-container {}

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
