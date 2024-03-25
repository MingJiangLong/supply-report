import { NodeType, SupplyType } from "@/constant"
import { fetchGoodsInMachine, normalSubmit, submit } from "@/service"
import { defineStore } from "pinia"
import { showToast } from "vant"
import { v4 as uuidV4 } from "uuid"
import { initSN } from "@/utils"

export const useShareData = defineStore("shareData", {
  state: (): State => {
    return {
      vm: "",
      nodeName: "",
      goodsList: [],
      displayImage: "",
      reportImage: "",
      transactionId: "",
      out_trade_no: "",
      sn: "",
      loginName: "",

      imageInfoBeforeOpen: {
        url: "",
        time: "",
      },
      imageInfoAfterOpen: {
        url: "",
        time: "",
      },
      isLoadingBaseData: false,
      nodeType: NodeType.normal,
      supplyType: SupplyType.normal,
    }
  },
  getters: {
    TRANSACTION_ID(state) {
      return () => {
        if (!!!state.transactionId)
          throw new Error("系统异常,获取transaction失败")
        return state.transactionId
      }
    },
    SN(state) {
      return () => {
        if (!!!state.vm) throw new Error("系统异常,获取sn失败!")
        return state.sn
      }
    },
    VM(state) {
      return () => {
        if (!!!state.vm) throw new Error("获取机器信息失败")
        return state.vm
      }
    },
    OUT_TRADE_NO(state) {
      return () => {
        if (!!!state.out_trade_no) throw new Error("获取订单信息失败")
        return state.out_trade_no
      }
    },
    LOGIN_NAME(state) {
      return () => {
        if (!!!state.loginName) throw new Error("获取登录信息失败")
        return state.loginName
      }
    },
    REPORT_IMAGE(state) {
      return () => {
        if (!!!state.reportImage) throw new Error("请补货后拍照上传")
        return state.reportImage
      }
    },
    imageAfterOpen(state) {
      return () => {
        if (!!!state.imageInfoAfterOpen.url) throw new Error("请补货后拍照上传")
        return state.imageInfoAfterOpen.url
      }
    },
    imageBeforeOpen(state) {
      return () => {
        if (!!!state.imageInfoBeforeOpen.url) throw new Error("开门前拍照上传")
        return state.imageInfoBeforeOpen.url
      }
    },
    steps(state) {
      if (state.nodeType === NodeType.secret) {
        if (state.supplyType === SupplyType.normal) {
          return ["补货后上报"]
        }
        return ["补货前盘点", "补货后上报"]
      }
      if (state.supplyType === SupplyType.normal) {
        return ["开门前拍照", "补货后上报", "补货后拍照"]
      }
      return ["开门前拍照", "补货前盘点", "补货后上报", "补货后拍照"]
    },

    isSecretNode(state) {
      return state.nodeType == NodeType.secret
    },
    isNormalSupply(state) {
      return state.supplyType == SupplyType.normal
    },
    baseSubmitData(state) {
      return (moment: number) => {
        return {
          vmCode: state.vm,
          out_trade_no: state.out_trade_no,
          productInfo: state.goodsList.map(item => ({
            productId: item.productId,
            productName: item.productName,
            productCount: item.stock_temp,
            productIdentifyCount:
              moment == 1 ? item.recommend_temp : item.stock_temp,
          })),
          loginName: state.loginName,
        }
      }
    },
  },
  actions: {
    async fetchBaseInfo() {
      try {
        this.isLoadingBaseData = true
        this.goodsList = []
        const result = await fetchGoodsInMachine(this.VM())
        if (result?.head?.code != 200)
          throw new Error(result?.head?.desc ?? "服务器繁忙!")
        const nodeName = result?.body?.node
        const list = result?.body?.list
        this.nodeName = nodeName

        // 排序mdseTypeId1 == 1001  是饮料 等于其他零食
        this.goodsList = Array.isArray(list)
          ? list.map(item => ({
              ...item,
              stock_temp: item?.stock ?? 0,
              recommend: 0,
              recommend_temp: 0,
              // replenishmentStock_temp: item?.replenishmentStock ?? 0
            }))
          : []
      } catch (error: any) {
        showToast({
          message: error?.message,
          type: "fail",
        })
      } finally {
        this.isLoadingBaseData = false
      }
    },
    sort(type = 1) {
      const temp = this.goodsList.reduce(
        (count, current) => {
          if (current?.mdseTypeId1 == 1001) {
            count[0].push(current)
          } else {
            count[1].push(current)
          }
          return count
        },
        [[] as Goods[], [] as Goods[]]
      )

      if (type == 1) {
        this.goodsList = [
          ...temp[0].sort((a, b) => a.stock - b.stock),
          ...temp[1].sort((a, b) => a.stock - b.stock),
        ]
      } else {
        this.goodsList = [
          ...temp[0].sort(
            (a, b) => b.replenishmentStock - a.replenishmentStock
          ),
          ...temp[1].sort(
            (a, b) => b.replenishmentStock - a.replenishmentStock
          ),
        ]
      }
    },
    clearPhoto() {
      this.imageInfoBeforeOpen = { url: "", time: "" }
      this.imageInfoAfterOpen = { url: "", time: "" }
    },
    clear() {
      this.$reset()
    },
    async submitWhenNormalSupply() {
      const transactionId = uuidV4()
      const sn = initSN()
      return normalSubmit({
        transactionId,
        sn,
        ...this.baseSubmitData(1),
        prePictures: this.imageInfoBeforeOpen.url,
        prePictureTime: this.imageInfoBeforeOpen.time,
        pictures: this.imageInfoAfterOpen.url,
        pictureTime: this.imageInfoAfterOpen.time,
      })
    },
    async submitWhenCountSupply(moment: 0 | 1) {
      let transactionId = this.transactionId
      let sn = this.sn

      if (moment == 0) {
        transactionId = uuidV4()
        sn = initSN()
      }
      const submitResult = await submit({
        ...this.baseSubmitData(moment),
        transactionId,
        sn,
        moment,
        pictures: this.imageInfoBeforeOpen.url,
        pictureTime: this.imageInfoBeforeOpen.time,
      })
      if (submitResult?.head?.code != 200)
        throw new Error(submitResult?.head?.desc)

      if (moment == 0) {
        this.transactionId = transactionId
        this.sn = sn
      }
    },
  },
  persist: true,
})

type State = {
  /** 机器编号 */
  vm: string

  /** 点位名称 */
  nodeName: string

  /** 商品名称 */
  goodsList: Goods[]

  /**
   * 补货前后提交
   */
  transactionId: string

  out_trade_no: string

  sn: string
  loginName: string

  displayImage: string
  reportImage: string

  /** 开门前拍照信息 */
  imageInfoBeforeOpen: {
    /** 照片url */
    url: string

    /** 拍照时间 */
    time: string
  }
  imageInfoAfterOpen: {
    /** 照片url */
    url: string

    /** 拍照时间 */
    time: string
  }

  /** 是否在加载数据 */
  isLoadingBaseData: boolean

  /** 补货类型  月度判断 常规判断 */
  supplyType: SupplyType

  /** 点位类型 常规点位 机密点位 */
  nodeType: NodeType
}
