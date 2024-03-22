import { isDev } from "@/config"
import { NodeType, SupplyType } from "@/constant"
import { submit } from "@/service"
import { useShareData } from "@/store"
import { v4 as uuidV4 } from "uuid"
import { URLHelper } from "web-url-helper"

/** 初始化H5必要数据 */
export function initNecessaryData() {
  const urlHelper = new URLHelper(window.location.toString())
  if (isDev) {
    urlHelper.hashSearchParams.append("vm", "99900990")
    urlHelper.hashSearchParams.append("out_trade_no", "99902380A20230209163729")
    urlHelper.hashSearchParams.append("loginName", "18576518892")
    urlHelper.hashSearchParams.append("is_normal_supply", "false")
    urlHelper.hashSearchParams.append("node_type", "2")
  }

  const shareData = useShareData()
  shareData.vm = urlHelper.hashSearchParams.get("vm") ?? ""
  shareData.loginName = urlHelper.hashSearchParams.get("loginName") ?? ""
  shareData.out_trade_no = urlHelper.hashSearchParams.get("out_trade_no") ?? ""
  const isNormalType = urlHelper.hashSearchParams.get("is_normal_supply")

  if (isNormalType === "true" || isNormalType === "false") {
    shareData.supplyType =
      isNormalType === "true" ? SupplyType.normal : SupplyType.count
  } else {
    throw new Error("获取补货类型失败!")
  }

  const nodeType = urlHelper.hashSearchParams.get("node_type")
  if (nodeType == "1" || nodeType === "2") {
    shareData.nodeType = +nodeType
  } else {
    throw new Error("获取点位类型失败!")
  }
  shareData.fetchBaseInfo()
}

/** 盘点之后更新数据,不需要盘点也可以调用才方法更新商品数据 */
export function updateGoodsAfterCount() {
  const shareData = useShareData()
  /** 是否为分拣机 */
  const isSortTypeMachine = shareData.goodsList.some(
    item => +item.lastStockNum > 0
  )
  shareData.goodsList = shareData.goodsList.map(item => {
    /** 非分拣机推荐补货数 =  上次补货后库存 - 修正库存*/
    let temp = item.replenishmentStock - item.stock_temp
    let recommendNumber = temp >= 0 ? temp : 0
    return {
      ...item,
      // 非分拣机: 推荐补货数 =  上次补货后库存 - 修正库存; 分拣机: 推荐补货数 = lastStockNum(备货数)
      recommend: isSortTypeMachine ? +item?.lastStockNum : recommendNumber, // 推荐补货数
      // 分拣机:补货后库存 = 推荐补货数 + 修正库存; 非分拣机:补货后库存 = replenishmentStock (上次补货后库存)
      recommend_temp: isSortTypeMachine
        ? item.lastStockNum + item.stock_temp
        : item.replenishmentStock, // 补货后库存
    }
  })
}

export function addWatermark(
  image: CanvasImageSource,
  message: string[]
): Promise<Blob | null> {
  return new Promise(s => {
    const canvasDom = document.createElement("canvas")
    canvasDom.width = window.innerWidth
    canvasDom.height = window.innerHeight

    const context = canvasDom.getContext("2d")
    if (!context) return
    context.drawImage(image, 0, 0, window.innerWidth, window.innerHeight)

    context.fillStyle = "rgba(0,0,0,.5)"
    context.globalAlpha = 0.6

    context.fillRect(0, 0, window.innerWidth, 95)
    context.fillStyle = "#ffffff"
    context.font = "18px serif"
    context.fillText(`机器号:${message[0]}`, 20, 20)
    context.fillText(`${message[1]}`, 20, 50)
    context.fillText(`${message[2]}`, 20, 80)
    // return canvasDom.toDataURL('image/png')
    canvasDom.toBlob(
      function (e) {
        s(e)
      },
      "image/png",
      1
    )
  })
}

export function getLocalDateStr(value: number) {
  if (value >= 10) return `${value}`
  return `0${value}`
}
export function initSN(link = false) {
  const date = new Date()
  if (!link) {
    return `${date.getFullYear()}${getLocalDateStr(
      date.getMonth() + 1
    )}${getLocalDateStr(date.getDate())}${getLocalDateStr(
      date.getHours()
    )}${getLocalDateStr(date.getMinutes())}${getLocalDateStr(
      date.getSeconds()
    )}`
  }

  return `${date.getFullYear()}-${getLocalDateStr(
    date.getMonth() + 1
  )}-${getLocalDateStr(date.getDate())} ${getLocalDateStr(
    date.getHours()
  )}:${getLocalDateStr(date.getMinutes())}:${getLocalDateStr(
    date.getSeconds()
  )}`
}

export async function refreshToken() {
  if (isDev) return "yapi-uboxol"
  return await getUboxToken()
}

export const getUboxToken = () => {
  return new Promise<string>((resolve, reject) => {
    try {
      window.uboxClient.getToken(function (token) {
        resolve(token)
      })
    } catch (error) {
      reject(new Error("客户端调用失败，获取不到用户信息"))
    }
  })
}

export async function firstReport() {
  const shareData = useShareData()
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
      productIdentifyCount: item.stock,
    })),
    sn,
    loginName: shareData.LOGIN_NAME(),
    pictures: shareData.imageBeforeOpen(),
    pictureTime: shareData.imageInfoBeforeOpen.time,
  })
  if (submitResult?.head?.code != 200) throw new Error(submitResult?.head?.desc)
  shareData.goodsList = shareData.goodsList.map(item => {
    /** 非分拣机推荐补货数 =  上次补货后库存 - 修正库存*/
    let temp = item.replenishmentStock - item.stock_temp
    let recommendNumber = temp >= 0 ? temp : 0

    // 分拣机(分拣机才有备货数)
    const isSortTypeMachine = +item.lastStockNum > 0

    return {
      ...item,
      // 非分拣机: 推荐补货数 =  上次补货后库存 - 修正库存; 分拣机: 推荐补货数 = lastStockNum(备货数)
      recommend: isSortTypeMachine ? +item?.lastStockNum : recommendNumber, // 推荐补货数
      // 分拣机:补货后库存 = 推荐补货数 + 修正库存; 非分拣机:补货后库存 = replenishmentStock (上次补货后库存)
      recommend_temp: isSortTypeMachine
        ? item.lastStockNum + item.stock_temp
        : item.replenishmentStock, // 补货后库存
    }
  })
  // 保存sn和transaction
  shareData.transactionId = transactionId
  shareData.sn = sn
}

export function getSteps() {
  const shareData = useShareData()

  if (shareData.nodeType === NodeType.secret) {
    if (shareData.supplyType === SupplyType.normal) {
      return ["开门前拍照", "补货后上报", "补货后拍照"]
    }
    return ["开门前拍照", "补货前盘点", "补货后上报", "补货后拍照"]
  }
  if (shareData.supplyType === SupplyType.normal) {
    return ["补货后上报"]
  }
  return ["补货前盘点", "补货后上报"]
}
