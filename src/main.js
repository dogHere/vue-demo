import Vue from 'vue'
import Antd from 'ant-design-vue'
import App from './App.vue'
import router from './router'
import 'ant-design-vue/dist/antd.css'

Vue.use(Antd)
/**
 * export function
 * 防止ssr时App的单例缓存App
 */
export default function createApp () {
  if (typeof window !== 'undefined') {
    App.el = '#app'
    App.router = router
    return new Vue(App)
  }
  const root = new Vue(App)
  return root
}

if (typeof window !== 'undefined') createApp()
