import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import router from './router'
import ZkTable from 'vue-table-with-tree-grid'

// 引入全局样式
import './assets/css/global.less'
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
// todo：将axios二次封装成为插件，在启动时注入main.js
Vue.prototype.$http = axios
// 配置http错误捕获方法
Vue.prototype.$catchHttpError = function (error) {
    if (!error) {
        throw new Error('出现未知错误')
    } else {
        this.$message({
            type: 'error',
            message: error.message || 'Server Error'
        })
        console.error(error)
    }
}

// 定义全局的过滤器
Vue.filter('dateformat', function (time) {
    const dt = new Date(time)
    const y = dt.getFullYear()
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    const d = (dt.getDate() + '').padStart(2, '0')
    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')

    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(animated)
Vue.use(ZkTable)

new Vue({
    router,
    render: h => h(App),
}).$mount('#app')
