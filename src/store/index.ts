import { fetchGoodsInMachine } from "@/service";
import { defineStore } from "pinia";
import { showToast } from "vant";

export const useShareData = defineStore('shareData', {
  state: (): State => {
    return {
      vm: '',
      nodeName: '',
      goodsList: [],
      displayImage: '',
      reportImage: '',
      transactionId: '',
      out_trade_no: '',
      sn: '',
      loginName: '',
    }
  },
  getters: {
    TRANSACTION_ID(state) {
      return () => {
        if (!!!state.transactionId) throw new Error("系统异常,获取transaction失败");
        return state.transactionId
      }
    },
    SN(state) {
      return () => {
        if (!!!state.vm) throw new Error("系统异常,获取sn失败!");
        return state.sn
      }
    },
    VM(state) {
      return () => {
        if (!!!state.vm) throw new Error("获取机器信息失败");
        return state.vm
      }
    },
    OUT_TRADE_NO(state) {
      return () => {


        if (!!!state.out_trade_no) throw new Error("获取订单信息失败");
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
    }
  },
  actions: {
    async fetchBaseInfo() {
      try {
        const result = await fetchGoodsInMachine(this.VM())
        if (result?.head?.code != 200)
          throw new Error(result?.head?.desc ?? "服务器繁忙!")
        const nodeName = result?.body?.node
        const list = result?.body?.list
        this.nodeName = nodeName

        // 排序mdseTypeId1 == 1001  是饮料 等于其他零食
        this.goodsList = Array.isArray(list) ? list.map(item => ({
          ...item,
          stock_temp: item?.stock ?? 0,
          recommend: 0,
          recommend_temp: 0,
          // replenishmentStock_temp: item?.replenishmentStock ?? 0
        })) : []
      } catch (error: any) {
        showToast({
          message: error?.message,
          type: "fail",
        })
      }
    },
    sort(type = 1) {
      const temp = this.goodsList.reduce((count, current) => {
        if (current?.mdseTypeId1 == 1001) {
          count[0].push(current)
        } else {
          count[1].push(current)
        }
        return count
      }, [[] as Goods[], [] as Goods[]])

      if (type == 1) {
        this.goodsList = [...temp[0].sort((a, b) => a.stock - b.stock), ...temp[1].sort((a, b) => a.stock - b.stock)]
      } else {
        this.goodsList = [...temp[0].sort((a, b) => b.replenishmentStock - a.replenishmentStock), ...temp[1].sort((a, b) => b.replenishmentStock - a.replenishmentStock)]
      }
    },

  }
})

type State = {
  vm: string
  nodeName: string
  goodsList: Goods[],

  /**
   * 补货前后提交
  */
  transactionId: string
  out_trade_no: string
  sn: string
  loginName: string
  displayImage: string
  reportImage: string
}