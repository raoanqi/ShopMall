<template>
  <div>
    <!--    面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{path: 'home/'}">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--    页面中的卡片视图-->
    <el-card>
      <!--      搜索区域-->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogUser=true">添加用户</el-button>
        </el-col>
      </el-row>

      <!--     列表数据-->
      <el-table :data="userList" border stripe>
        <!--        索引列-->
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <!--作用域插槽-->
          <template v-slot="{row}">
            <el-switch v-model="row.mg_state" @change="userStateChange(row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot="{row}">
            <el-button icon="el-icon-edit" type="primary" size="mini" @click="showEdit(row)"></el-button>
            <el-button icon="el-icon-delete" type="danger" size="mini" @click="handleDelete(row.id)"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button icon="el-icon-setting" type="warning" size="mini" @click="handleDisRole(row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--      分页区域-->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[10,15,20,25]"
                     :page-size="queryInfo.pagesize"
                     layout="total,sizes,prev,pager,next,jumper"
                     :total="total">

      </el-pagination>
    </el-card>

    <!--    添加用户的对话框-->
    <el-dialog title="添加用户" :visible.sync="addDialogUser" width="500px" @close="addDialogClosed">
      <el-form :model="addUserForm" ref="addUserRef" :rules="addUserFormRules" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addDialogUser=false">取消</el-button>
        <el-button type="primary" @click="addUser">确定</el-button>
      </span>
    </el-dialog>

    <!--    编辑用户的对话框-->
    <el-dialog title="修改用户" :visible.sync="showEditDialog" width="500px" @close="resetEditDialog">
      <el-form :model="editUserForm" ref="editUserRef" :rules="editUserFormRule" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editUserForm.username" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="showEditDialog=false">取消</el-button>
        <el-button type="primary" @click="handleConfirmEdit">确定</el-button>
      </span>
    </el-dialog>

    <!--    分配角色的对话框：这个还没有做-->
    <el-dialog title="分配角色"
               :visible.sync="showDistributeRole"
               @close="closeDisRoleCb"
               width="500px">
      <el-form :model="disRoleForm"
               ref="disRoleForm"
               :rules="disRoleFormRules"
               label-width="100px">
        <el-form-item prop="rid" label="角 色">
          <el-select v-model="disRoleForm.rid" style="width: 250px" clearable>
            <el-option v-for="role in roles"
                       :label="role.roleName"
                       :key="role.id"
                       :value="role.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="showDistributeRole = false">取消</el-button>
        <el-button @click="handleDistributeConfirm()" type="primary">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "User",
  data() {
    // 自定义校验规则：邮箱，手机号
    let checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    let checkMobile = (rule, value, cb) => {
      const regEmail = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号码'))
    }
    return {
      //  获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        pagesize: 10
      },
      userList: [],
      total: 0,
      addDialogUser: false,
      // 添加用户的表单数据
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addUserFormRules: {
        username: [
          {required: true, message: '请输入用户名'}, {min: 3, max: 10, message: '用户名的长度在3-10个字符之间', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入密码'}, {min: 6, max: 15, message: '密码的长度在6-15位字符之间', trigger: 'blur'}
        ],
        email: [
          {required: true, message: '请输入邮箱'}, {validator: checkEmail, trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '请输入手机号码'}, {validator: checkMobile, trigger: 'blur'}
        ]
      },
      showEditDialog: false,
      //  编辑用户的信息
      editUserForm: {
        id: '',
        username: '',
        email: '',
        mobile: ''
      },
      //  编辑框中使用的校验规则
      editUserFormRule: {
        username: [
          {required: true, message: '请输入用户名'}, {min: 3, max: 10, message: '用户名的长度在3-10个字符之间', trigger: 'blur'}
        ],
        email: [
          {required: true, message: '请输入邮箱'}, {validator: checkEmail, trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '请输入手机号码'}, {validator: checkMobile, trigger: 'blur'}
        ]
      },
      //  角色数据
      roles: [],
      showDistributeRole: false,
      disRoleForm: {
        rid: ''
      },
      disRoleFormRules: {
        rid: [{required: true, message: '请选择一个角色'}]
      },
      //  当前准备分配的user
      currentUserId: ''
    }
  },
  methods: {
    async getUserList() {
      const {data: res} = await this.$http.get(`users`, {params: this.queryInfo})
      // console.log(res)
      if (res.meta.status === 200) {
        this.userList = res.data.users
        this.total = res.data.total
      } else {
        return this.$message.error('获取用户列表失败')
      }
    },
    // 监听page size变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    //  监听页码值的变化
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    //  修改用户的状态
    async userStateChange(userInfo) {
      const {data: res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status === 200) {
        this.$message.success('状态修改成功')
      } else {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('状态修改失败')
      }
    },
    //  监听对话框关闭事件
    addDialogClosed() {
      this.$refs.addUserRef.resetFields()
    },
    // 确定添加
    addUser() {
      this.$refs.addUserRef.validate(async valid => {
        if (!valid) {
          return
        }
        //  否则，校验通过，发起请求
        const {data: res} = await this.$http.post('users', this.addUserForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        this.addDialogUser = false
        this.getUserList()
      })
    },
    showEdit(row) {
      this.editUserForm.id = row.id
      this.editUserForm.username = row.username
      this.editUserForm.email = row.email
      this.editUserForm.mobile = row.mobile
      this.showEditDialog = true
    },
    resetEditDialog() {
      this.$refs.editUserRef.resetFields()
    },
    handleConfirmEdit() {
      this.$refs.editUserRef.validate(async valid => {
        if (!valid) {
          return
        }
        const {data: res} = await this.$http.put(`users/${this.editUserForm.id}`, {
          email: this.editUserForm.email,
          mobile: this.editUserForm.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败')
        }
        this.showEditDialog = false
        this.getUserList()
        this.$message.success('更新用户信息成功')
      })
    },
    async handleDelete(id) {
      const confirmDeleteRes = await this.$confirm('确定删除该用户吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      // 取消：返回值是cancel
      if (confirmDeleteRes !== 'confirm') {
        return this.$message.info('已经取消删除')
      }

      const {data: res} = await this.$http.delete(`users/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      this.$message.success('删除用户成功')
      await this.getUserList()
    },
    //  获取全部的role
    async getAllRoles() {
      try {
        const {data} = await this.$http.get(`roles`)
        this.roles = data.data
      } catch (error) {
        this.$catchHttpError(error)
      }
    },
    // 显示分配角色的对话框
    handleDisRole(id) {
      this.showDistributeRole = true
      this.currentUserId = id
    },
    // 确定分配权限
    async handleDistributeConfirm() {
      try {
        await this.$refs.disRoleForm.validate()
      } catch (e) {
        return
      }

      try {
        await this.$http.put(`users/${this.currentUserId}/role`, this.disRoleForm)
        this.$message({
          type: 'success',
          message: '修改角色成功'
        })
        await this.getUserList()
      } catch (error) {
        this.$catchHttpError(error)
      } finally {
        this.showDistributeRole = false
      }
    },
    //  关闭分配角色对话框的回调
    closeDisRoleCb() {
      this.disRoleForm.rid = ''
      this.$nextTick(() => this.$refs.disRoleForm.clearValidate())
    }
  },
  created() {
    this.getUserList()
    this.getAllRoles()
  }
}
</script>

<style lang="less">

</style>