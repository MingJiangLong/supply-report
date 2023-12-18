<!-- !新需求 此页作为首页 -->
<!-- 开门前拍照 -->
<template>
  <main>
    <Location />
    <Steps :current="0" :steps="shareData.steps" />
    <Alarm message="开门前，拍照上报" />
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
               @on-delete="onDeleteImage"
               @on-image-click="onImagePreview"
               :done-url="shareData.imageInfoBeforeOpen.url"
               desc="拍照上报" />
      </div>
    </div>
  </main>
  <footer>
    <Button @click="onNextStep" :disabled="!shareData.imageInfoBeforeOpen.url" :loading="loading">下一步</Button>
  </footer>
</template>

<script setup lang="ts">
import { ref } from "vue"
import Location from "@/components/Location.vue"
import Steps from "@/components/Steps.vue"
import Alarm from "@/components/Alarm.vue"
import eg_small from "@/assets/img/eg_small.png"
import eg_big from "@/assets/img/eg_big.png"
import Image from "@/components/Image.vue"
import { useShareData } from "@/store";
import { useRouter } from "vue-router";
import { Button } from "vant";
import { initSN, isDev } from "@/utils";
import { onMounted } from "vue";
import { URLHash } from 'ubox-util'
const shareData = useShareData()
function initPathData() {
  if (isDev()) {
    location.replace(` http://192.168.29.45:5173/supply-report-dev#/take-photo-before-open?vm=99900990&out_trade_no=99902380A20230209163729&loginName=18576518892&is_normal_supply=false`)
  }
  shareData.vm = URLHash.getValueByKey("vm")
  shareData.loginName = URLHash.getValueByKey("loginName")
  shareData.out_trade_no = URLHash.getValueByKey("out_trade_no")
  shareData.isNormalSupply = URLHash.getValueByKey("is_normal_supply") == 'false' ? false : true
}
const router = useRouter()
/**
 * 点击示意图
 */
function onEGImagePreview() {
  shareData.displayImage = eg_big
  router.push("preview")
}

/** 上传之后本地保存链接url */
function onUpload(dataSource: string) {
  shareData.imageInfoBeforeOpen.url = dataSource;
  shareData.imageInfoBeforeOpen.time = initSN(true);
}

/** 本地移除拍照信息；移除链接`url`以及拍照时间`time` */
function onDeleteImage() {
  shareData.imageInfoBeforeOpen.url = '';
  shareData.imageInfoBeforeOpen.time = '';
}

/** 图片预览;需要跳转图片预览页 */
function onImagePreview() {
  shareData.displayImage = shareData.imageInfoBeforeOpen.url;
  router.push("preview")
}

const loading = ref(false)
/** 
 * 点击下一步按钮<br/>
 * `常规补货` 需要后台上报一次;<br/>
 * `盘点补货` 直接跳转
 */
async function onNextStep() {

  if (shareData.isNormalSupply) {
    router.push("confirm-after-supply")
  }

  if (!shareData.isNormalSupply) {
    router.push("count-before-supply")
  }
}

/** 初始化点位信息 以及商品列表信息 */
async function initList() {
  await shareData.fetchBaseInfo()
  shareData.sort()
}

onMounted(() => {
  initPathData()
  initList()
})
</script>

<style scoped lang="less">
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

footer {
  display: flex;
  padding: 8px 21px 8px;
  gap: 6px 14px;
  font-size: 18px;

  &>button:first-child {
    background: var(--ubox-btn-background);
    color: #ffffff;
    border: 1px solid #d1d4de;
    border-radius: 25px;
    flex: 1;
  }

  // & > button:last-child {
  //   background: var(--ubox-btn-background);
  //   border-radius: 25px;
  //   color: #ffffff;
  //   flex: 2;
  //   border: none;
  // }
}
</style>