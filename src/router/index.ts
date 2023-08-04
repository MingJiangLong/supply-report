import { createRouter, RouteRecordRaw, createWebHashHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
const routes: Array<RouteRecordRaw> = [
  { path: '/', component: Home, meta: { title: '补货前确认' } },
  { path: '/confirmAfterSupply', component: () => import('@/pages/ConfirmAfterSupply.vue'), meta: { title: '补货后确认' } },
  { path: '/takePhotoAndReport', component: () => import('@/pages/TakePhotoAndReport.vue'), meta: { title: '拍照上报' } },
  // { path: '/test', component: () => import('@/pages/test.vue'), meta: { title: '测试' } },
  { path: '/preview', component: () => import('@/pages/ImagePreview.vue'), meta: { title: '查看照片' } },
]
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  window.document.title = `${to.meta?.title ?? ''}`
  // 不能又补货后确认返回补货前确认
  if (!(to.fullPath === '/' && from.fullPath === '/confirmAfterSupply')) {
    next()
  }
})

export default router
