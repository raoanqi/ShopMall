<template>
  <div class="login_container">
    <div class="login_box">
      <!--     头像-->
      <div class="avatar_box">
        <img src="../../public/images/avator.jpg" alt="头像">
      </div>
      <!--      登陆表单-->
      <el-form :model="loginForm" :rules="loginFormRules" ref="loginFormRef" label-width="0px" class="login_form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" type="password"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginFormRules: {
        username: [{required: true, message: '请输入用户名'}],
        password: [{required: true, message: '请输入登录密码'}]
      }
    }
  },
  methods: {
    // 表单重置
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields()
    },
    //  校验表单
    async login() {
      // 先校验
      try {
        await this.$refs.loginFormRef.validate(valid => console.log(valid))
      } catch (e) {
        return
      }
      //  校验完成，开始请求
      try {
        // 将其中的data对象结构出来，并赋值给res
        const {data: res} = await this.$http.post(`login`, this.loginForm)
        //  判断响应中的状态码，不是200，就代表登陆失败
        if (res.meta.status !== 200) {
          this.$message.error('登陆失败')
        } else {
          this.$message.success('登陆成功')
          window.sessionStorage.setItem('token', res.data.token)
          this.$router.push('/home')
        }
      //  登陆成功之后，需要将登陆成功的token，保存到客户端的sessionStorage中，
      //  项目中除了登陆页面，其他的页面只能在登陆状态下才能访问
      //  token只应该在网站打开期间才生效，所以是将token保保存在sessionStorage之中
      //  通过编程式导航跳转到后台的主页，路由地址是/home
      //  注意这个登陆过程的学习
      } catch (e) {
        return null
      }
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;

  .login_box {
    width: 450px;
    height: 300px;
    background-color: #ffffff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .avatar_box {
      width: 130px;
      height: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #ffffff;

      img {
        width: 130px;
        height: 130px;
        border-radius: 50%;
        background-color: #eee;
      }
    }

    .login_form {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 40px;
      box-sizing: border-box;
    }

    .btns {
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>