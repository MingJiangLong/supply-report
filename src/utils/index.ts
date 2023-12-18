import { submit } from "@/service"
import { useShareData } from "@/store"
import { v4 as uuidV4 } from "uuid"
// const UBOX_TOKEN_KEY = 'UBOX_TOKEN_KEY'
export default function (callback: (env: string) => void) {
  if (import.meta.env.MODE != 'prod') {
    typeof callback === 'function' && callback(import.meta.env.MODE)
  }
}


// https://h5.dev.uboxol.com/replenishment-dev/#/?to=replnm&vm=99900990&out_trade_no=907428914732
/**
 * 从路由hash获取部分参数
 * @returns 
 */

export function isDev() {
  return import.meta.env.MODE === 'development'
}

export function isPre() {
  return import.meta.env.MODE === 'pre'
}

export function isTesting() {
  return import.meta.env.MODE === 'testing'
}
export function isProd() {
  return import.meta.env.MODE === 'prod'
}
export function getPathBaseParams(): { [k: string]: any } {

  if (isDev()) {
    return {
      vm: '99900990',
      out_trade_no: "99902380A20230209163729",
      loginName: '18576518892'
    }
  }
  let hash = window.location.hash;
  hash = hash.substring(3);
  return hash.split("&").reduce((count, current) => {
    let [key, value] = current.split("=")
    return {
      ...count,
      [key]: value
    }
  }, {})
}


export function addWatermark(image: CanvasImageSource, message: string[]): Promise<Blob | null> {
  return new Promise((s) => {
    const canvasDom = document.createElement('canvas');
    canvasDom.width = window.innerWidth;
    canvasDom.height = window.innerHeight;

    const context = canvasDom.getContext("2d");
    if (!context) return
    context.drawImage(image, 0, 0, window.innerWidth, window.innerHeight);

    context.fillStyle = "rgba(0,0,0,.5)"
    context.globalAlpha = 0.6

    context.fillRect(0, 0, window.innerWidth, 95)
    context.fillStyle = "#ffffff"
    context.font = "18px serif"
    context.fillText(`机器号:${message[0]}`, 20, 20)
    context.fillText(`${message[1]}`, 20, 50)
    context.fillText(`${message[2]}`, 20, 80)
    // return canvasDom.toDataURL('image/png')
    canvasDom.toBlob(function (e) {
      s(e)
    }, 'image/png', 1)
  })
}

export function getLocalDateStr(value: number) {
  if (value >= 10) return `${value}`
  return `0${value}`
}
export function initSN(link = false) {
  const date = new Date();
  if (!link) {
    return `${date.getFullYear()}${getLocalDateStr(date.getMonth() + 1)}${getLocalDateStr(date.getDate())}${getLocalDateStr(date.getHours())}${getLocalDateStr(date.getMinutes())}${getLocalDateStr(date.getSeconds())}`
  }

  return `${date.getFullYear()}-${getLocalDateStr(date.getMonth() + 1)}-${getLocalDateStr(date.getDate())} ${getLocalDateStr(date.getHours())}:${getLocalDateStr(date.getMinutes())}:${getLocalDateStr(date.getSeconds())}`
}

export async function refreshToken() {
  if (isDev()) return 'yapi-uboxol';
  return await getUboxToken()
}

export const getUboxToken = () => {
  return new Promise<string>((resolve, reject) => {
    try {
      window.uboxClient.getToken(function (token) {
        resolve(token)
      })
    } catch (error) {
      reject(new Error('客户端调用失败，获取不到用户信息'))
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
      productIdentifyCount: item.stock
    })),
    sn,
    loginName: shareData.LOGIN_NAME(),
    pictures: shareData.imageBeforeOpen(),
    pictureTime: shareData.imageInfoBeforeOpen.time
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

}