<!-- !第二版之后，此页面不再作为首页 补货前盘点 -->
<template>
  <PageContainer>
    <Location />
    <Steps :current="1" :steps="COUNT_SUPPLY_STEPS" />
    <!-- <Alarm message="开门后，确认库存" /> -->
    <Search v-model="searchValue" placeholder="请输入商品名称" @search="onSearch" />
    <div class="card">
      <div class="row card-head" style="background: #fff8f3">
        <div>商品图片</div>
        <div>商品名称/ID</div>
        <div>系统库存</div>
        <div>修正库存</div>
      </div>
      <div class="card-body">
        <List v-model:loading="listLoading" disabled style="">
          <template v-for="(item, key) in shareData.goodsList" ref="listRef">
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
                   @click="onEditBtnClick(key)">
                <img src="@/assets/img/icon_edit.png" />
                <span>修正库存</span>
              </div>
              <div style="flex: 11" v-if="item.status == 'editing'">
                <Stepper
                         :min="0"
                         :max="999"
                         :default-value="item.stock_temp"
                         @change="v => {
                           onStepperChange(key, v)
                         }
                           " />
              </div>
            </div>
            <div class="row card-main">
              <div style="flex: 1">该商品库存核对状态:</div>
              <div
                   :class="item.status != undefined
                     ? 'hairline-btn-disable'
                     : 'hairline-btn'
                     "
                   @click="onConfirmStore(key)">
                {{ item.status != undefined ? "已确认" : "确认库存" }}
              </div>
            </div>
            <div class="van-hairline--bottom divide"></div>
          </template>
        </List>
      </div>
    </div>

    <template v-slot:footer>
      <Button @click="() => router.back()">上一步</Button>
      <Button
              @click="onBottomBtnClick"
              :loading="submitLoading"
              :disabled="!isNextAble"
              class="bottom-btn">核对无误,开始补货</Button>
    </template>

  </PageContainer>
</template>

<script setup lang="ts">
// import Alarm from "@/components/Alarm.vue"
import Location from "@/components/Location.vue"
import Steps from "@/components/Steps.vue"
import { firstReport } from "@/utils"
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { Stepper, Button, List, Search } from "vant"
import { showToast } from "vant"
import { useShareData } from "@/store"
import { COUNT_SUPPLY_STEPS } from "@/config"
import PageContainer from "@/components/PageContainer.vue"
const router = useRouter()
const shareData = useShareData()
const submitLoading = ref(false)
const listLoading = ref(false)
/** 商品库存数量控件值变化同步数量 */
function onStepperChange(index: number, value: number) {
  let goods = shareData.goodsList[index]
  if (!goods) return
  goods.stock_temp = value
}

const isNextAble = computed(() => {
  return shareData.goodsList.every(item => item.status)
})
/** 点击编辑库存按钮 */
function onEditBtnClick(index: number, status = "editing") {
  let goods = shareData.goodsList[index]
  if (!goods) return
  goods["status"] = status
}

/**
 * 点击 `核对无误，开始补货`按钮;
 * 补货需要`两次上报`此为第一次;
 * 上报需要前端生成 `transactionId` 和 `sn`,第二次上报需要传第一次上报生成的`transactionId` 和 `sn`;
 * 上报完成之后,缓存商品信息增加 `recommend`推荐补货数和`recommend_temp`补货后库存;
 */
async function onBottomBtnClick() {
  try {
    submitLoading.value = true
    await firstReport()
    router.push("confirm-after-supply")
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

const searchValue = ref('')
const listRef = ref()
/** 搜索商品，搜索到的商品滚动到视图中央 */
function onSearch(value: any) {
  searchValue.value = value;
  if (!shareData.goodsList.length) return;
  if (!searchValue.value) {
    return listRef.value[0]?.scrollIntoView({ block: 'center' })
  }
  const findIndex = shareData.goodsList.findIndex(item => {
    return item.fullName.includes(searchValue.value)
  })
  if (findIndex != -1) {
    listRef.value[findIndex]?.scrollIntoView({ block: 'center' })
  }
}
</script>

<style scoped lang="less">

footer {
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

.card-head {
  &>div {
    text-align: center;
    padding: 12px 0;
  }

  &>div:nth-child(1) {
    flex: 5;
  }

  &>div:nth-child(2) {
    flex: 10;
  }

  &>div:nth-child(3) {
    flex: 5;
  }

  &>div:nth-child(4) {
    flex: 6;
  }
}

.card {
  @img-size: 60px;
  display: flex;
  flex-direction: column;
  flex: 1;

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

  .card-body {
    flex: 1;
    overflow-y: scroll;
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
