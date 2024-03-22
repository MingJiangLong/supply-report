export const API_HOST = import.meta.env.VITE_APP_API_HOST
export const APP_BASE_PATH = import.meta.env.VITE_APP_BASE_PATH

export const NORMAL_SUPPLY_STEPS = ["开门前拍照", "补货后上报", "补货后拍照"]
export const COUNT_SUPPLY_STEPS = [
  "开门前拍照",
  "补货前盘点",
  "补货后上报",
  "补货后拍照",
]
export const isDev = import.meta.env.MODE === "development"
export const isProd = import.meta.env.MODE === "prod"
export const isPre = import.meta.env.MODE === "pre"

