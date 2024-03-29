
interface Window {
  session?: string
  UBOX_TOKEN?: string
  ucloud: {
    postMessage: (data: string) => void
    token:()=>string
  }
  uboxClient: {
    getToken: (callback: (token: string) => void) => void
  }
}


interface Goods {
  productId: number
  imageUrl: string
  productName: string
  fullName: string
  price: number
  delete: boolean
  replenishmentStock: number

  status?: string
  
  /** 用于标记是否被编辑过 */
  status2?: string

  /** 页面系统库存展示字段 */
  stock: number

  /** 页面系统库存修改展示字段 */
  stock_temp: number

  /** 用于页面推荐补货数展示 */
  recommend:number

  /** 用于页面补货后库存展示 */
  recommend_temp:number

  // replenishmentStock_temp: number
  mdseTypeId1: number
  
  lastStockNum:number 
}

interface ImportMetaEnv {
  readonly VITE_APP_API_HOST: string
  // 更多环境变量...
}
