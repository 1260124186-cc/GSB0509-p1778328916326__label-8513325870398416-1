/**
 * 应用入口文件
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// VXE Table
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'

// VXE Table Element Plus 适配器
import VXETablePluginElement from 'vxe-table-plugin-element'
import 'vxe-table-plugin-element/dist/style.css'

import router from './router'
import App from './App.vue'

// 使用 Element Plus 适配器
VXETable.use(VXETablePluginElement)

const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用插件
app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
  locale: zhCn
})
app.use(VXETable)

app.mount('#app')

