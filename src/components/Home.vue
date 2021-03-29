<template>
  <el-container class="home-container">
    <!--    头部区域-->
    <el-header>
      <div>
        <img src="../assets/logo.png" style="width: 50px" alt="logo">
        <span>淘宝后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出登录</el-button>
    </el-header>
    <!--    页面主体区域-->
    <el-container>
      <!--      侧边栏-->
      <el-aside :width="collapse?'64px':'200px'">
        <!--        折叠-->
        <div class="toggle" @click="toggleCollapse">
          <i :class="collapse?'el-icon-right':'el-icon-back'"></i>
        </div>
        <el-menu background-color="#333744"
                 text-color="#fff"
                 active-text-color="#409eff"
                 :unique-opened="true"
                 :collapse="collapse"
                 :collapse-transition="false"
                 :router="true"
                 :default-active="activePath">
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <el-menu-item-group>
              <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id"
                            @click="saveNavState('/'+subItem.path)">
                <template slot="title">
                  <i class="el-icon-menu"></i>
                  <span>{{ subItem.authName }}</span>
                </template>
              </el-menu-item>
            </el-menu-item-group>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--      右侧主体-->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      menuList: [],
      //  icon的列，存储一级目录的icon
      iconObj: {
        '125': 'el-icon-user',
        '103': 'el-icon-s-cooperation',
        '101': 'el-icon-s-shop',
        '102': 'el-icon-s-flag',
        '145': 'el-icon-s-comment'
      },
      collapse: false,
      //  当前的激活链接地址
      activePath: ''
    }
  },
  methods: {
    logout() {
      //  登出操作：（1）清空token；（2）定位到login页面
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    //   获取全部的菜单
    async getMenuList() {
      const {data: res} = await this.$http.get('menus')
      // console.log(res)
      if (res.meta.status === 200) {
        this.menuList = res.data
      } else {
        return this.$message.error(res.meta.msg())
      }
    },
    //  折叠菜单
    toggleCollapse() {
      this.collapse = !this.collapse
    },
    // 保存链接的激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  },
  created() {
    this.getMenuList()
    // 组件创建时，拿到存储的数据，代表当前激活的是哪一个菜单
    this.activePath = window.sessionStorage.getItem('activePath')
  }
}
</script>

<style lang="less">
.home-container {
  // 全屏
  height: 100%;

  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #ffffff;
    font-size: 20px;

    > div {
      display: flex;
      align-items: center;

      span {
        margin-left: 15px;
      }
    }
  }

  .el-aside {
    background-color: #333744;

    .toggle {
      background-color: #4a5064;
      font-size: 10px;
      line-height: 24px;
      color: #ffffff;
      text-align: center;
      letter-spacing: 0.2em;
      cursor: pointer;
    }

    //  消除菜单右侧的边框线
    .el-menu {
      border-right: none;
    }
  }

  .el-main {
    background-color: #eaedf1;
  }
}

</style>