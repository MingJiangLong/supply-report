<!-- !新需求 此页作为首页 -->
<!-- 开门前拍照 -->
<template>
  <PageContainer>
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
    <template v-slot:footer>
      <Button @click="onNextStep" :disabled="!shareData.imageInfoBeforeOpen.url" :loading="loading">下一步</Button>
    </template>
  </PageContainer>
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
import PageContainer from '@/components/PageContainer.vue'
import { URLHelper } from "web-url-helper"
const shareData = useShareData()
function initPathData() {

  let url = window.location.toString()
  const urlHelper = new URLHelper(url)

  if (isDev()) {
    urlHelper.hashSearchParams.append("vm", "99900990")
    urlHelper.hashSearchParams.append("out_trade_no", "99902380A20230209163729")
    urlHelper.hashSearchParams.append("loginName", "18576518892")
  }

  shareData.vm = urlHelper.hashSearchParams.get("vm") ?? ''
  shareData.loginName = urlHelper.hashSearchParams.get("loginName") ?? ''
  shareData.out_trade_no = urlHelper.hashSearchParams.get("out_trade_no") ?? ''
  shareData.isNormalSupply = urlHelper.hashSearchParams.get("is_normal_supply") == 'false' ? false : true
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
    shareData.goodsList = shareData.goodsList.map(item => {
      /** 推荐补货数 =  上次补货后库存 - 修正库存*/
      let temp = item.replenishmentStock - item.stock_temp

      let lockNumber = isNaN(+item?.lastStockNum) ? temp : +item.lastStockNum < 0 ? temp : +item.lastStockNum
      return {
        ...item,
        recommend: lockNumber,// 推荐补货数
        recommend_temp: item.replenishmentStock,// 补货后库存
      }
    })
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
  &>button:first-child {
    background: var(--ubox-btn-background);
    color: #ffffff;
    border: 1px solid #d1d4de;
    border-radius: 25px;
    flex: 1;
  }
}
</style>