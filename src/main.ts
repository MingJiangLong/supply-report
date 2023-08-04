import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import 'amfe-flexible'
import Vconsole from 'vconsole'
import 'vant/lib/index.css';
import { createPinia } from 'pinia'
import { isProd } from './utils'
const pinia = createPinia()
const app = createApp(App);
app.use(pinia)
if (!isProd()) {
  app.use(() => new Vconsole())
}
app.use(router).mount('#app')
