import {
  createRouter,
  RouteRecordRaw,
  createWebHashHistory,
  RouteLocationNormalized,
  NavigationGuardNext,
} from "vue-router"
import Home from "@/pages/Home.vue"
import { useShareData } from "@/store"
import { NodeType, SupplyType } from "@/constant"
const routes: Array<RouteRecordRaw> = [
  { path: "/", redirect: "/take-photo-before-open" },
  {
    path: "/count-before-supply",
    component: Home,
    meta: { title: "补货前盘点" },
  },
  {
    path: "/confirm-after-supply",
    component: () => import("@/pages/ConfirmAfterSupply.vue"),
    meta: { title: "补货后上报" },
  },
  {
    path: "/take-photo-and-report",
    component: () => import("@/pages/TakePhotoAndReport.vue"),
    meta: { title: "补货后拍照" },
  },
  {
    path: "/preview",
    component: () => import("@/pages/ImagePreview.vue"),
    meta: { title: "查看照片" },
  },
  {
    path: "/take-photo-before-open",
    component: () => import("@/pages/TakePhotoBeforeOpen.vue"),
    meta: { title: "开门前拍照" },
  },
]
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

function isSecretNodeRedirect(
  to: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const shareData = useShareData()
  if (
    to.fullPath == "/take-photo-before-open" &&
    shareData.nodeType == NodeType.secret
  ) {
    let pathName = "/confirm-after-supply"
    if (shareData.supplyType == SupplyType.count) {
      pathName = "/count-before-supply"
    }
    return next(pathName)
  }
  next()
}
router.beforeEach((to, _from, next) => {
  window.document.title = `${to.meta?.title ?? ""}`
  isSecretNodeRedirect(to, next)
})

export default router
