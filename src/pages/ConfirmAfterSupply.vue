<template>
  <PageContainer>
    <Location />
    <Steps :current="stepCurrent" :steps="shareData.steps" v-if="shareData.steps.length > 1" />
    <!-- <NoticeBar mode="closeable" left-icon="volume-o" text="1. 商品补货量与推荐量一致，直接确认；2. 商品补货量与推荐量不一致，根据差额加减补货后库存" /> -->
    <div style="background:#FFF0E6;padding:10px;border-radius: 8px;color:#FF7108;font-size: 13px;margin-bottom:10px">
      <div>
        <Icon name="warning-o" />
        提示信息
      </div>
      <div style="margin-top:3px">1. 商品补货量与推荐量一致，直接确认；</div>
      <div style="margin-top:3px">2. 商品补货量与推荐量不一致，根据差额加减补货后库存</div>
    </div>
    <div class="card">
      <Sticky>
        <Search
                v-model="searchValue" placeholder="请输入商品名称" @search="onSearch" />
        <div class="row card-head" style="background: #fff8f3">
          <div>商品图片</div>
          <div>商品名称/ID</div>
          <div>推荐补货数</div>
          <div>补货后库存</div>
        </div>
      </Sticky>
      <div class="card-body">
        <List v-if="!shareData.isLoadingBaseData" v-model:loading="shareData.isLoadingBaseData" disabled>
          <div v-for="(item, key) in shareData.goodsList" ref="listRef">
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
                   @click="onEditBtnClick(key)">
                <span>{{ item.recommend_temp }}</span>
                <img src="@/assets/img/icon_edit.png" />
              </div>
              <div v-if="item.status2 == 'editing'" style="flex: 11">
                <Stepper
                         :min="0"
                         :default-value="item.recommend_temp"
                         @change="v => {
      onStepperChange(key, v)
    }
      " />
              </div>
            </div>
            <div class="row card-main">
              <div style="flex: 1">该商品补货核对状态:</div>
              <div
                   :class="item.status2 != undefined
      ? 'hairline-btn-disable'
      : 'hairline-btn'
      "
                   @click="onConfirmStore(key)">
                {{ item.status2 != undefined ? "已确认" : "确认补货数" }}
              </div>
            </div>
            <div class="van-hairline--bottom divide"></div>
          </div>
        </List>
        <div v-else style="display: flex;justify-content: center;margin-top: 20px;">
          <Loading size="24px" />
        </div>
      </div>
    </div>
    <template v-slot:footer>

      <Button @click="goBack" class="bottom-btn-1"
              v-if="!shareData.isSecretNode || !shareData.isNormalSupply">上一步</Button>
      <Button @click="submitWhenSecretNode" :loading="submitting" class="bottom-btn" :disabled="!isBtnAble"
              v-if="shareData.isSecretNode">
        提交
      </Button>
      <Button @click="onNextStep" class="bottom-btn" :disabled="!isBtnAble" v-if="!shareData.isSecretNode">
        补货完成,去拍照
      </Button>
    </template>
  </PageContainer>
</template>

<script setup lang="ts">
import Location from "@/components/Location.vue"
import Steps from "@/components/Steps.vue"
import { onMounted } from "vue"
import { useRouter } from "vue-router"
import { Stepper, List, Search, Button, Sticky, showToast, Loading, Icon } from "vant"
import { useShareData } from "@/store"
import { ref } from "vue"
import { computed } from "vue"
import PageContainer from "@/components/PageContainer.vue"
import { isProd } from "@/config"
const router = useRouter()
const shareData = useShareData()
const listRef = ref()

/** 下一步按钮是可用 */
const isBtnAble = computed(() => {
  return shareData.goodsList.every(item => {
    return !!item.status2
  }) && shareData.goodsList.length && !shareData.isLoadingBaseData
})


const stepCurrent = computed(() => {
  if (shareData.isSecretNode) {
    if (shareData.isNormalSupply) return 0
    return 1
  };
  if (shareData.isNormalSupply) return 1
  return 2
})

const searchValue = ref('')

/** 库存数量控件值变化 */
function onStepperChange(index: number, value: number) {
  let goods = shareData.goodsList[index]
  if (!goods) return
  goods.recommend_temp = value
}

/** 点击编辑库存按钮 */
function onEditBtnClick(index: number, status = "editing") {
  let goods = shareData.goodsList[index]
  if (!goods) return
  goods["status2"] = status
}

/** 确认库存 */
function onConfirmStore(index: number) {
  const goods = shareData.goodsList[index]
  if (!goods) return
  goods["status2"] = "edited"
}

/** 点击下一步 */
function onNextStep() {
  if (!isBtnAble.value) return
  router.push("take-photo-and-report")
}

function goBack() {
  router.back()
}

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

const submitting = ref(false)
async function submitWhenSecretNode() {
  try {
    if (!isBtnAble.value) return
    submitting.value = true
    if (shareData.isNormalSupply) {
      await shareData.submitWhenNormalSupply();
    } else {
      await shareData.submitWhenCountSupply(1)
    }
    showToast({
      message: "提交成功",
      type: "success",
    })

    // if (!isProd) return;
    setTimeout(() => {
      shareData.clear()
      window?.ucloud?.postMessage?.(
        JSON.stringify({ code: 10003, msg: "关闭页面" })
      )
    }, 3000)
  } catch (error: any) {
    showToast({
      message: error?.message ?? "系统异常",
      type: "fail",
    })
  } finally {
    submitting.value = false
  }

}

/** 挂载时对商品列表进行排序 */
onMounted(() => {
  shareData.sort(2)
})
</script>

<style scoped lang="less">
@img-size: 60px;

main {
  padding: 0 8px;
}

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
    flex: 6;
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
  height: 0;
  background: var(--ubox-page-bg);

  img {
    width: @img-size;
    height: @img-size;
  }

  .card-body {
    flex: 1;
    margin: 5px 0;
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
  img {
    width: 14px;
    height: 14px;
    padding-left: 5px;
  }
}

.divide {
  margin: 5px 10px 5px;
}

.tips {
  color: #FF7500;
  font-size: 12px;
  padding: 12px;
}
</style>
