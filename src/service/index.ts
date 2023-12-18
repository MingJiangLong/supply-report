
import { API_HOST } from '@/config';
import { refreshToken, isDev, isPre } from '@/utils'
import Axios, { AxiosRequestConfig } from 'axios'

const axios = Axios.create({
  timeout: 1000 * 6,
  baseURL: API_HOST
})
axios.interceptors.request.use(async (config) => {
  try {
    if (isPre()) {
      config.params = {
        ...config.params,
        release: 'pre'
      }
    }
    if (isDev()) {
      config.headers['Authorization'] = `yapi-uboxol`
    } else {
      config.headers['Authorization'] = `Bearer ${window.ucloud.token()}`
    }
    return config
  } catch (error: any) {
    console.log(error);
    return Promise.reject(error)
  }
})

axios.interceptors.response.use(async (data) => {
  if (data?.data?.head?.code == 403 && !data.config.headers['retry_token_done']) {
    const token = await refreshToken();
    data.config.headers['Authorization'] = `Bearer ${token}`
    data.config.headers['retry_token_done'] = true
    return axios(data?.config)
  }
  if (data?.data?.head?.code != 200) throw new Error((data?.data?.head?.desc) ?? '服务器异常')
  return data.data
}, async (error) => {
  let errorCode = error?.response?.status
  if (errorCode == 401 && !error.config.headers['retry_token_done']) {
    const token = await refreshToken();
    error.config.headers['retry_token_done'] = true
    error.config.headers['Authorization'] = `Bearer ${token}`
    return axios(error?.config)
  }
  return Promise.reject(error)
})

function post<T = any>(url: string, data?: { [k: string]: any }, config?: AxiosRequestConfig<any>): Promise<Response<T>> {
  return axios.post(url, data, config);
}

export function fetchGoodsInMachine(vmCode: string) {
  return post(`/simple/adjust_channel/get_channel_goods_list`, {
    vmCode,
  }, {
    headers: {
      "Content-Type": 'application/x-www-form-urlencoded'
    },
  })
}

export function submit(data: SubmitData) {
  return post(`/simple/supply/submit_stock`, data, {
    headers: {
      "Content-Type": 'application/json'
    },
  })
}

export function fetchUploadInfo(): Promise<Response<{
  accessKeyId: string
  accessKeySecret: string
  bucket: string
  endpoint: string
  expiration: string
  securityToken: string
}>> {
  return post(`/simple/get_aliyun_token`, void 0, {
    params: {
      from: 'escort-html'
    }
  })
}
type SubmitData = {
  vmCode: string
  /** 补货前后 */
  moment: 0 | 1
  transactionId: string
  out_trade_no: string
  productInfo: {
    productId: number | string
    productCount: number
    productName: string
  }[],
  sn: string
  loginName: string
  pictures?: string
  pictureTime?: string    // 补货后拍照时间
  prePictures?: string    // 补货前图片
  prePictureTime?: string // 补货前拍照时间
  /** 月度盘点字段，1是、0否 */
  inventory?: number

}

type Response<T = any> = {
  head: {
    code: number
    desc: string
  },
  body: T
}