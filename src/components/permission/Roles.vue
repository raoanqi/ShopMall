<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-button type="primary" @click="isShowAddDialog=true">添加角色</el-button>
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1, index1) in scope.row.children" :key="item1.id"
                    :class="['bdbottom', index1===0?'bdtop':'','vertical-center']">
              <!--              一级权限-->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--              二级三级权限-->
              <el-col :span="19">
                <el-row v-for="(item2, index2) in item1.children" :key="item2.id"
                        :class="[index2!==0?'bdtop':'','vertical-center']">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{
                        item2.authName
                      }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag v-for="(item3, index3) in item2.children" :key="index3" type="warning" closable
                            @close="removeRightById(scope.row, item3.id)">{{
                        item3.authName
                      }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!--            <pre>{{ scope.row }}</pre>-->
          </template>
        </el-table-column>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="设置" width="300px">
          <template v-slot="{row}">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(row)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDeleteRoleConfirm(row)">删除
            </el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(row)">分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--    分配权限-->
    <el-dialog title="分配权限" :visible.sync="showSetRightDialogVisible" width="500px" @close="closeSetRightsDialog">
      <el-tree :data="rightsList" :props="treeProps" show-checkbox default-expand-all node-key="id"
               :default-checked-keys="defaultKeys" ref="treeRef">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showSetRightDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="setRightsForRole">确定</el-button>
      </span>
    </el-dialog>
    <!--    添加角色-->
    <el-dialog title="添加角色" :visible.sync="isShowAddDialog" width="500px" @close="closeAddRoleCb">
      <el-form :model="addRoleForm" label-width="100px" ref="addRoleForm" :rules="addRoleRules">
        <el-form-item prop="roleName" label="角色名称">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item prop="roleDesc" label="角色描述">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
          <el-button @click="isShowAddDialog=false">取消</el-button>
          <el-button @click="handleAddRoleConfirm" type="primary">确定</el-button>
        </span>
    </el-dialog>
    <!--    编辑角色-->
    <el-dialog title="编辑角色" :visible.sync="isShowEditDialog" width="500px" @close="closeEditRoleCb">
      <el-form :model="editRoleForm" label-width="100px" ref="editRoleForm" :rules="editRoleRules">
        <el-form-item prop="roleName" label="角色名称">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item prop="roleDesc" label="角色描述">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
          <el-button @click="isShowEditDialog=false">取消</el-button>
          <el-button @click="handleEditRoleConfirm" type="primary">确定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Roles",
  data() {
    return {
      //  角色列表
      roleList: [],
      showSetRightDialogVisible: false,
      rightsList: [],
      // 树形控件的对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      defaultKeys: [],
      // 当前即将分配权限的role
      roleId: '',
      isShowAddDialog: false,
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      addRoleRules: {
        roleName: [{required: true, message: '请输入角色名称'}],
        roleDesc: [{required: true, message: '请输入角色描述'}]
      },
      isShowEditDialog: false,
      editRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      editRoleRules: {
        roleName: [{required: true, message: '请输入角色名称'}],
        roleDesc: [{required: true, message: '请输入角色描述'}]
      },
      currentRoleId: ''
    }
  },
  methods: {
    async getRoleList() {
      const {data: res} = await this.$http.get(`roles`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = res.data
    },
    //  删除role的right
    async removeRightById(role, rightId) {
      const confirmRes = await this.$confirm('确认删除该权限吗？', '确认', {
        confirmButtonText: '确认',
        cancelButtonClass: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmRes !== 'confirm') {
        return this.$message.info('删除取消')
      }
      const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      this.$message.success('删除权限成功')
      role.children = res.data
      // this.getRoleList()
    },
    // 展示分配权限的对话框
    // 当前角色就是根节点
    async showSetRightDialog(role) {
      this.roleId = role.id
      const {data: res} = await this.$http.get(`rights/tree`)
      if (res.meta.status !== 200) {
        this.$message.error('获取权限失败')
      }
      this.rightsList = res.data
      this.getLeafKeys(role, this.defaultKeys)
      this.showSetRightDialogVisible = true
    },
    // 通过递归的方式获取全部的id，并保存到数组中
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 关闭分配权限对话框
    closeSetRightsDialog() {
      this.defaultKeys = []
    },
    // 确定分配权限
    async setRightsForRole() {
      //   调用两个方法获取全部选中的节点
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      //  发送请求
      const idStr = keys.join(',')
      const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idStr
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      await this.getRoleList()
      this.showSetRightDialogVisible = false
    },
    //  关闭添加角色的对话框时的回调函数
    closeAddRoleCb() {
      this.addRoleForm = {
        roleName: '',
        roleDesc: ''
      }
      this.$nextTick(() => this.$refs.addRoleForm.clearValidate())
    },
    //  确定添加角色
    async handleAddRoleConfirm() {
      try {
        await this.$refs.addRoleForm.validate()
      } catch (e) {
        return
      }

      try {
        await this.$http.post(`roles`, this.addRoleForm)
        this.$message({
          type: 'success',
          message: '添加角色成功'
        })
        await this.getRoleList()
      } catch (error) {
        this.$catchHttpError(error)
      } finally {
        this.isShowAddDialog = false
      }
    },
    showEditDialog(row) {
      this.editRoleForm = {
        roleName: row.roleName,
        roleDesc: row.roleDesc
      }
      this.currentRoleId = row.id
      this.isShowEditDialog = true
    },
    //  确定编辑角色
    async handleEditRoleConfirm() {
      try {
        await this.$refs.editRoleForm.validate()
      } catch (e) {
        return
      }

      try {
        await this.$http.put(`roles/${this.currentRoleId}`, this.editRoleForm)
        this.$message({
          type: 'success',
          message: '编辑成功'
        })
        await this.getRoleList()
      } catch (error) {
        this.$catchHttpError(error)
      } finally {
        this.isShowEditDialog = false
      }
    },
    closeEditRoleCb() {
      this.editRoleForm = {
        roleName: '',
        roleDesc: ''
      }
      this.currentRoleId = ''
      this.$nextTick(() => this.$refs.editRoleForm.clearValidate())
    },
    async handleDeleteRoleConfirm(row) {
      try {
        await this.$confirm('确定删除该角色吗？', '确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
      } catch (e) {
        return
      }
      try {
        await this.$http.delete(`roles/${row.id}`)
        this.$message({
          type: 'success',
          message: '删除成功'
        })
        await this.getRoleList()
      } catch (error) {
        this.$catchHttpError(error)
      }
    }
  },
  created() {
    this.getRoleList()
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vertical-center {
  display: flex;
  align-items: center;
}
</style>