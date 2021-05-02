<template>
  <div>
    <el-breadcrumb>
      <el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="注意：只允许为第三级分类设置相关参数！"
                type="warning"
                show-icon
                class="mg-b-10"
                :closable="false">
      </el-alert>
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader expand-trigger="hover"
                       :options="cateList"
                       :props="cateProps"
                       v-model="selectedItems"
                       @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="用户管理" name="many">
          <el-button type="primary" size="small" :disabled="selectedItems.length!==3" @click="showDialog">添加参数
          </el-button>
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template v-slot="{row}">
                <el-tag
                    closable
                    v-if="row.attr_vals.trim().length"
                    type="primary"
                    v-for="(item,index) in row.tagArr"
                    :key="item"
                    @close="handleCloseTag(index,row)"
                    class="mg-r-10">
                  {{ item }}
                </el-tag>
                <!--                添加新标签-->
                <el-input
                    ref="saveTagInput"
                    v-if="row.addTagVisible"
                    v-model="row.addTagData"
                    size="small"
                    style="width: 120px"
                    @keyup.enter.native="handleInputAddTag(row)"
                    @blur="handleInputAddTag(row)">
                </el-input>
                <el-button
                    v-else
                    size="small"
                    @click="showAddNewTag(row)">
                  Add New Tag
                </el-button>

              </template>
            </el-table-column>
            <el-table-column label="编号" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="{row}">
                <el-button type="primary" size="small" class="el-icon-edit" @click="showEditDialog(row)"></el-button>
                <el-button type="danger" size="small" class="el-icon-delete" @click="deleteParam(row)"></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="配置管理" name="only">
          <el-button type="primary" size="small" :disabled="selectedItems.length!==3" @click="showDialog">添加属性
          </el-button>
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand"></el-table-column>
            <el-table-column label="编号" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="{row}">
                <el-button type="primary" size="small" class="el-icon-edit" @click="showEditDialog(row)"></el-button>
                <el-button type="danger" size="small" class="el-icon-delete" @click="deleteParam(row)"></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog :title="activeTab==='many'?'添加动态参数':'添加静态属性'"
               :visible.sync="isShowDialog"
               @close="handleCloseDialog"
               width="500px">
      <el-form
          :model="addForm"
          ref="addForm"
          :label="activeTab==='many'?'动态参数':'静态属性'"
          label-width="80px" :rules="addFormRules">
        <el-form-item :label="activeTab==='many'?'动态参数':'静态属性'" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isShowDialog=false">取消</el-button>
        <el-button type="primary" @click="handleAddConfirm">确认</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="activeTab==='many'?'编辑动态参数':'编辑静态属性'"
               :visible.sync="isShowEditDialog"
               @close="handleCloseEditDialog"
               width="500px">
      <el-form
          :model="editForm"
          ref="editForm"
          :label="activeTab==='many'?'动态参数':'静态属性'"
          label-width="80px" :rules="editFormRules">
        <el-form-item :label="activeTab==='many'?'动态参数':'静态属性'" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isShowEditDialog=false">取消</el-button>
        <el-button type="primary" @click="handleEditConfirm">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "ClassPara",
  data() {
    return {
      cateList: [],
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框绑定的数据
      selectedItems: [],
      activeTab: 'many',
      manyTableData: [],
      onlyTableData: [],
      isShowDialog: false,
      label: '静态属性',
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [{required: true, message: '请输入参数名称'}]
      },
      isShowEditDialog: false,
      editForm: {
        attr_name: '',
        attr_id: ''
      },
      editFormRules: {
        attr_name: [{required: true, message: '请输入参数名称'}]
      }
    }
  },
  methods: {
    async getCateList() {
      try {
        const {data: res} = await this.$http.get(`categories`)
        this.cateList = res.data
      } catch (error) {
        this.$catchHttpError(error)
      }
    },
    // 选择框变化的回调，仅仅允许选中三级数据，如果没有选中三级数据，重置，若已经选中三级数据，则获取相应的参数
    handleChange() {
      this.getParamsData()
    },
    handleTabClick() {
      this.getParamsData()
    },
    async getParamsData() {
      if (this.selectedItems.length !== 3) {
        this.selectedItems = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }

      try {
        const id = this.selectedItems[2]
        const {data: res} = await this.$http.get(`categories/${id}/attributes`, {
          params: {
            sel: this.activeTab
          }
        })
        /*
        * 为每一条记录新增字段：
        * 控制是否显示输入框
        * 绑定输入的数据
        * */
        res.data.forEach(item => {
          item.tagArr = item.attr_vals.split(' ')
          item.addTagVisible = false
          item.addTagData = ''
        })

        if (this.activeTab === 'many') {
          this.manyTableData = res.data
        } else {
          this.onlyTableData = res.data
        }
      } catch (error) {
        this.$catchHttpError(error)
      }
    },
    showDialog() {
      this.isShowDialog = true
    },
    async handleAddConfirm() {
      try {
        await this.$refs.addForm.validate()
      } catch (e) {
        return
      }
      try {
        const id = this.selectedItems[this.selectedItems.length - 1]
        await this.$http.post(`categories/${id}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeTab
        })
        this.$message.success('添加参数成功')
        await this.getParamsData()
      } catch (error) {
        this.$catchHttpError(error)
      } finally {
        this.isShowDialog = false
      }
    },
    // 添加参数对话框关闭
    handleCloseDialog() {
      this.$refs.addForm.resetFields()
    },
    showEditDialog(row) {
      this.editForm.attr_name = row.attr_name
      this.editForm.attr_id = row.attr_id
      this.isShowEditDialog = true
    },
    async handleEditConfirm() {
      try {
        this.$refs.editForm.validate()
      } catch (e) {
        return
      }

      try {
        const id = this.selectedItems[this.selectedItems.length - 1]
        await this.$http.put(`categories/${id}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeTab
        })
        this.$message.success('修改参数成功')
        await this.getParamsData()
      } catch (error) {
        this.$catchHttpError(error)
      } finally {
        this.isShowEditDialog = false
      }
    },
    handleCloseEditDialog() {
      this.$refs.editForm.resetFields()
    },
    //   删除对应的参数
    async deleteParam(row) {
      try {
        await this.$confirm('确定删除吗？', '确定', {
          cancelButtonText: '取消',
          confirmButtonText: '确定'
        })
      } catch (e) {
        return
      }

      try {
        const id = this.selectedItems[this.selectedItems.length - 1]
        await this.$http.delete(`categories/${id}/attributes/${row.attr_id}`)
        this.$message.success('删除参数成功')
        await this.getParamsData()
      } catch (error) {
        this.$catchHttpError(error)
      }
    },
    // 添加新的标签
    showAddNewTag(row) {
      row.addTagVisible = true
      /*
      * 当页面上页面元素被重新渲染之后，才会执行其中的回调函数
      * */
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    async handleInputAddTag(row) {
      // 用户输入的是0
      if (row.addTagData.trim().length === 0) {
        row.addTagVisible = false
        row.addTagData = ''
        return
      }
      // 实际输入了内容
      row.tagArr.push(row.addTagData)
      row.addTagVisible = false
      // 并且将数据上传到后台持久化存储
      const id = this.selectedItems[this.selectedItems.length - 1]
      try {
        await this.$http.put(`categories/${id}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.tagArr.join(' ')
        })
        this.$message.success('修改参数成功')
        await this.getParamsData()
      } catch (error) {
        this.$catchHttpError(error)
      }
    },
    async handleCloseTag(index, row) {
      row.tagArr.splice(index, 1)
      const id = this.selectedItems[this.selectedItems.length - 1]
      try {
        await this.$http.put(`categories/${id}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.tagArr.join(' ')
        })
        this.$message.success('删除参数成功')
        await this.getParamsData()
      } catch (error) {
        this.$catchHttpError(error)
      }
    }
  },
  created() {
    this.getCateList()
  }
}
</script>

<style lang="less">

</style>