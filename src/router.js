import Vue from 'vue'
import Router from 'vue-router'
import Login from "@/components/Login";
import Home from "@/components/Home";
import Welcome from "@/components/Welcome";
import User from "@/components/user/User";
import Rights from "@/components/permission/Rights";
import Roles from "@/components/permission/Roles";

Vue.use(Router)

const router = new Router({
    routes: [
        // 使用重定向,访问/的时候自动重定向到login页面
        {path: '/', redirect: '/login'},
        {path: '/login', component: Login},
        {
            path: '/home',
            component: Home,
            redirect: '/welcome',
            children: [
                {path: '/welcome', component: Welcome},
                {path: '/users', component: User},
                {path: '/rights', component: Rights},
                {path: '/roles', component: Roles}
            ]
        }
    ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
    if (to.path === '/login') {
        return next()
    }
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) {
        return next('/login')
    }
    next()
})
export default router