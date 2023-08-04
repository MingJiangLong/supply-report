<template>
  <main>
    <Location />
    <Steps :current="0" />
    <Alarm message="开门后，确认库存" />
    <div class="card">
      <div class="row card-head" style="background: #fff8f3">
        <div>商品图片</div>
        <div>商品名称/ID</div>
        <div>系统库存</div>
        <div>修正库存</div>
      </div>
      <List v-model:loading="listLoading" disabled>
        <template v-for="(item, key) in shareData.goodsList">
          <div class="row card-head card-main">
            <div class="goods-img-container">
              <div v-if="item.delete">已删除</div>
              <img :src="item.imageUrl" />
            </div>
            <div class="card-desc">
              <div>{{ item.fullName }}</div>
              <div>ID:{{ item.productId }}</div>
            </div>
            <div v-if="item.status != 'editing'">{{ item.stock_temp }}</div>
            <div
              v-if="item.status != 'editing'"
              class="icon row"
              @click="onEditBtnClick(key)"
            >
              <img src="@/assets/img/icon_edit.png" />
              <span>修正库存</span>
            </div>
            <div style="flex: 11" v-if="item.status == 'editing'">
              <Stepper
                :min="0"
                :max="999"
                :default-value="item.stock_temp"
                @change="
                  v => {
                    onStepperChange(key, v)
                  }
                "
              />
            </div>
          </div>
          <div class="row card-main">
            <div style="flex: 1">该商品库存核对状态:</div>
            <div
              :class="
                item.status != undefined
                  ? 'hairline-btn-disable'
                  : 'hairline-btn'
              "
              @click="onConfirmStore(key)"
            >
              {{ item.status != undefined ? "已确认" : "确认库存" }}
            </div>
          </div>
          <div class="van-hairline--bottom divide"></div>
        </template>
      </List>
    </div>
  </main>
  <footer>
    <Button
      @click="onBottomBtnClick"
      :loading="submitLoading"
      class="bottom-btn"
      >核对无误,开始补货</Button
    >
  </footer>
</template>

<script setup lang="ts">
import Alarm from "@/components/Alarm.vue"
import Location from "@/components/Location.vue"
import Steps from "@/components/Steps.vue"
import { submit } from "@/service"
import { getPathBaseParams, initSN } from "@/utils"
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { Stepper, Button, List } from "vant"
import { showToast } from "vant"
import { useShareData } from "@/store"
// @ts-ignore
import { v4 as uuidV4 } from "uuid"
const router = useRouter()
const shareData = useShareData()
const submitLoading = ref(false)
const listLoading = ref(false)

function onStepperChange(index: number, value: number) {
  let goods = shareData.goodsList[index]
  if (!goods) return
  goods.stock_temp = value
}
function onEditBtnClick(index: number, status = "editing") {
  let goods = shareData.goodsList[index]
  if (!goods) return
  goods["status"] = status
}

/** 核对无误，开始补货 */
async function onBottomBtnClick() {
  try {
    submitLoading.value = true
    const transactionId = uuidV4()
    const sn = initSN()
    const submitResult = await submit({
      vmCode: shareData.VM(),
      moment: 0,
      transactionId,
      out_trade_no: shareData.OUT_TRADE_NO(),
      productInfo: shareData.goodsList.map(item => ({
        productId: item.productId,
        productName: item.productName,
        productCount: item.stock_temp,
        productIdentifyCount:item.stock
      })),
      sn,
      loginName: shareData.LOGIN_NAME(),
    })
    if (submitResult?.head?.code != 200)
      throw new Error(submitResult?.head?.desc)

    shareData.goodsList = shareData.goodsList.map(item => {
      /** 推荐补货数 =  上次补货后库存 - 修正库存*/
      let temp = item.replenishmentStock - item.stock_temp
      return {
        ...item,
        recommend: temp >= 0 ? temp : 0,// 推荐补货数
        recommend_temp: item.replenishmentStock,// 补货后库存
      }
    })
    // 保存sn和transaction
    shareData.transactionId = transactionId
    shareData.sn = sn
    showToast({ message: "提交成功", type: "success" })
    router.push("/confirmAfterSupply")
  } catch (error: any) {
    showToast({
      message: error?.message,
      type: "fail",
    })
  } finally {
    submitLoading.value = false
  }
}

function onConfirmStore(index: number) {
  const goods = shareData.goodsList[index]
  if (!goods) return
  goods["status"] = "edited"
}

function initPathData() {
  const result = getPathBaseParams()
  shareData.vm = result.vm
  shareData.loginName = result.loginName
  shareData.out_trade_no = result.out_trade_no
}
async function initList() {
  listLoading.value = true
  await shareData.fetchBaseInfo()
  shareData.sort()
  listLoading.value = false
}
onMounted(() => {
  initPathData()
  initList()
})
</script>

<style scoped lang="less">
.bottom-btn {
  width: 100%;
  padding: 16px;
  text-align: center;
  background: var(--ubox-btn-background);
  color: #ffffff;
  border-radius: 35px;
  font-size: 18px;
}
main {
  padding: 0 8px;
}
footer {
  padding: 8px 21px 8px;
}
.card-head {
  & > div {
    text-align: center;
    padding: 12px 0;
  }
  & > div:nth-child(1) {
    flex: 5;
  }
  & > div:nth-child(2) {
    flex: 10;
  }
  & > div:nth-child(3) {
    flex: 5;
  }
  & > div:nth-child(4) {
    flex: 6;
  }
}
.card {
  @img-size: 60px;
  .goods-img-container {
    width: @img-size;
    height: @img-size;
    position: relative;
    div {
      position: absolute;
      width: @img-size;
      height: @img-size;
      border-radius: @img-size;
      line-height: @img-size;
      color: #ffffff;
      transform: rotate(-45deg);
      font-weight: bold;
      background: rgba(0, 0, 0, 0.3);
    }
    img {
      width: @img-size;
      height: @img-size;
    }
  }
}
.card-main {
  padding: 10px;
  display: flex;
  align-items: center;
  background: #ffffff;
}
.card-desc {
  color: #737373;
  div {
    text-align: left;
    margin-top: 5px;
    padding-left: 10px;
  }
}
.icon {
  color: #ff6600;
  line-height: 14px;
  img {
    width: 14px;
    height: 14px;
  }
}
.divide {
  margin: 10px 10px 20px;
}
</style>
