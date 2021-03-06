import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import router from './router'

// 引入全局样式
import './assets/css/global.css'
import animated from 'animate.css'

// 引入axios
import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 设置请求拦截器
// 在每次请求之前在请求头中设置一个认证字段Authorization，值就是token
axios.interceptors.request.use((config) => {
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
})
// 将axios直接挂载在Vue的原型上，这样就直接可以拿到
Vue.prototype.$http = axios

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(animated)

new Vue({
    router,
    render: h => h(App),
}).$mount('#app')
