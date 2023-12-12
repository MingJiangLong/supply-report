
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
  stock: number
  replenishmentStock: number
  status?: string
  status2?: string
  stock_temp: number
  recommend:number
  recommend_temp:number
  // replenishmentStock_temp: number
  mdseTypeId1: number
}

interface ImportMetaEnv {
  readonly VITE_APP_API_HOST: string
  // 更多环境变量...
}
