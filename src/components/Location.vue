<template>
  <div class="location-card">
    <div style="flex: 1;">
      <div class="main-desc">机器号:{{ shareData.vm }}</div>
      <div class="sub-desc">{{ shareData.nodeName }}</div>
    </div>
    <div class="btn" @click="goGoodsManage">
      商品管理
    </div>
  </div>
</template>

<script setup lang="ts">
import { isProd } from "@/config";
import { isPre } from "@/config";
import { useShareData } from "@/store";
import { } from "vue"
import { URLHelper } from "web-url-helper";
const shareData = useShareData()


function goGoodsManage() {
  let url = 'https://h5.dev.uboxol.com/goods-manage-dev/#/goods/manage'
  if (isPre) url = 'https://h5.dev.uboxol.com/goods-manage-pre/#/goods/manage'
  if (isProd) url = 'https://h5.uboxol.com/goods-manage/#/goods/manage'

  let urlHelper = new URLHelper(url);
  urlHelper.hashSearchParams.append("loginName", shareData.loginName)
  urlHelper.hashSearchParams.append("vm", shareData.vm)

  window.open(urlHelper.toString())

}
</script>

<style scoped lang="less">
@icon-size: 14px;

.location-card {
  display: flex;
  flex-direction: row;
  padding: 18px 14px;
  background: #ffffff;
  border-radius: 8px;
  align-items: center;
  margin: 12px 0;

  .main-desc {
    font-weight: 500;
    font-size: 16px;
    color: #3A3A3A;
  }

  .sub-desc {
    font-weight: 400;
    font-size: 14px;
    color: #737373;
    margin-top: 8px;
  }

  .btn {
    height: 30px;
    display: flex;
    align-items: center;
    padding: 0 10px;
    color: #FF6600;
    border-radius: 25px;
    border: 1px solid #FF6600;
  }
}
</style>
