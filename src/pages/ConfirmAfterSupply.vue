<template>
  <main>
    <Location />
    <Steps :current="1" />
    <div class="card">
      <div class="row card-head" style="background: #fff8f3">
        <div>商品图片</div>
        <div>商品名称/ID</div>
        <div>推荐补货数</div>
        <div>补货后库存</div>
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
            <div v-if="item.status2 != 'editing'">
              {{ item.recommend }}
            </div>
            <div
              v-if="item.status2 != 'editing'"
              class="icon row"
              style="justify-content: center"
              @click="onEditBtnClick(key)"
            >
              <span>{{ item.recommend_temp }}</span>
              <img src="@/assets/img/icon_edit.png" />
            </div>
            <div v-if="item.status2 == 'editing'" style="flex: 11">
              <Stepper
                :min="0"
                :default-value="item.recommend_temp"
                @change="
                  v => {
                    onStepperChange(key, v)
                  }
                "
              />
            </div>
          </div>
          <div class="row card-main">
            <div style="flex: 1">该商品补货核对状态:</div>
            <div
              :class="
                item.status2 != undefined
                  ? 'hairline-btn-disable'
                  : 'hairline-btn'
              "
              @click="onConfirmStore(key)"
            >
              {{ item.status2 != undefined ? "已确认" : "确认补货数" }}
            </div>
          </div>
          <div class="van-hairline--bottom divide"></div>
        </template>
      </List>
    </div>
  </main>
  <footer>
    <button @click="onNextStep" :class="isBtnAble ? 'btn-able' : 'btn-disable'">
      补货完成,去拍照
    </button>
  </footer>
</template>

<script setup lang="ts">
import Location from "@/components/Location.vue"
import Steps from "@/components/Steps.vue"
import { onMounted } from "vue"
import { useRouter } from "vue-router"
import { Stepper, List } from "vant"
import { useShareData } from "@/store"
import { ref } from "vue"
import { computed } from "vue"
const router = useRouter()
const shareData = useShareData()
const listLoading = ref(false)

const isBtnAble = computed(() => {
  return shareData.goodsList.every(item => {
    return !!item.status2
  })
})
function onStepperChange(index: number, value: number) {
  let goods = shareData.goodsList[index]
  if (!goods) return
  goods.recommend_temp = value
}

function onEditBtnClick(index: number, status = "editing") {
  let goods = shareData.goodsList[index]
  if (!goods) return
  goods["status2"] = status
}

function onConfirmStore(index: number) {
  const goods = shareData.goodsList[index]
  if (!goods) return
  goods["status2"] = "edited"
}

function onNextStep() {
  if (!isBtnAble.value) return
  router.push("takePhotoAndReport")
}

onMounted(() => {
  shareData.sort(2)
})
</script>

<style scoped lang="less">
@img-size: 60px;
footer {
  display: flex;
  padding: 8px 21px 8px;
  gap: 6px 14px;
  font-size: 18px;

  & > button {
    // background: #d1d4de;
    border-radius: 25px;
    // color: #ffffff;
    flex: 1;
  }
}
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
    flex: 6;
  }
  & > div:nth-child(4) {
    flex: 6;
  }
}
.card {
  @img-size: 60px;
  img {
    width: @img-size;
    height: @img-size;
  }
}
.card-main {
  padding: 10px;
  display: flex;
  align-items: center;
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
  img {
    width: 14px;
    height: 14px;
    padding-left: 5px;
  }
}
.divide {
  margin: 10px 10px 20px;
}
</style>
