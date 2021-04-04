<template>
  <div>
    <!--    顶部面包屑-->
    <el-breadcrumb separator-class="el-icon-arron-right">
      <el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-button type="primary" @click="handleAdd" class="mg-b-10">添加分类</el-button>
      <zk-table :data="tableData"
                :columns="columns"
                :expand-type="false"
                :selection-type="false"
                show-index
                index-text="#"
                border
                :show-row-hover="false">
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="!scope.row.cat_deleted"></i>
          <i class="el-icon-error" v-else></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag type="primary" size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <template slot="operation" slot-scope="scope">
          <el-button type="primary" size="mini" class="el-icon-edit" @click="handleEdit(scope.row)"></el-button>
          <el-button type="danger" size="mini" class="el-icon-delete" @click="handleDelete(scope.row)"></el-button>
        </template>
      </zk-table>
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[5,10,15,20]"
          :page-size="5"
          layout="total,sizes,prev,pager,next,jumper"
          :total="totalRecords">
      </el-pagination>
    </el-card>
    <!--    添加分类-->
    <el-dialog title="添加商品分类"
               :visible.sync="addDialogVisible"
               @close="addDialogCloseCb"
               width="500px">
      <el-form :rules="rules" ref="addForm" :model="addFormData" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addFormData.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader expand-trigger="hover"
                       :props="catProps"
                       :options="casData"
                       v-model="selectedItems"
                       @change="handleCasChange"
                       style="width:100%"></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible=false">取消</el-button>
        <el-button @click="handleAddConfirm" type="primary">确定</el-button>
      </span>
    </el-dialog>
    <!--    编辑分类-->
    <el-dialog title="编辑分类"
               :visible.sync="editDialogVisible">
      <el-form :rules="rules">
        <el-form-item></el-form-item>
        <el-form-item></el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "GoodsPara",
  data() {
    return {
      // 默认获取全部的三层数据
      type: 3,
      pageData: {
        pagenum: 1,
        pagesize: 5
      },
      currentPage: 1,
      totalRecords: 0,
      tableData: [],
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        }, {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        }, {
          label: '排序',
          type: 'template',
          template: 'order'
        }, {
          label: '操作',
          type: 'template',
          template: 'operation'
        }
      ],
      addDialogVisible: false,
      editDialogVisible: false,
      rules: {
        cat_name: [{required: true, message: '请输入分类名称'}]
      },
      addFormData: {
        //  为了直接匹配后端的接口形式，这里没有使用驼峰
        cat_name: '',
        cat_pid: 0,
        //  添加的登记默认是一级分类
        cat_level: 0
      },
      // 级联选择框的配置
      catProps: {
        checkStrictly: true,
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定的数组
      selectedItems: [],
      casData: []
    }
  },
  methods: {
    handleSizeChange(val) {
      this.pageData.pagesize = val
      this.getTableList()
    },
    handleCurrentChange(val) {
      this.pageData.pagenum = val
      this.getTableList()
    },
    async getTableList() {
      try {
        const {data} = await this.$http.get(`categories`, {params: {type: this.type, ...this.pageData}})
        this.tableData = data.data.result
        this.totalRecords = data.data.total
        this.$message({
          type: 'success',
          message: '商品分类获取成功'
        })
      } catch (error) {
        this.$catchHttpError(error)
      }
    },
    handleAdd() {
      this.getParentData()
      this.addDialogVisible = true
    },
    async handleAddConfirm() {
      try {
        await this.$refs.addForm.validate()
      } catch (e) {
        return
      }

      try {
        await this.$http.post(`categories`, this.addFormData)
        this.$message({
          type: 'success',
          message: '添加商品成功'
        })
        await this.getTableList()
      } catch (error) {
        this.$catchHttpError(error)
      } finally {
        this.addDialogVisible = false
      }
    },
    handleEdit() {
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确定删除该分类吗？', '确认', {
          cancelButtonText: '取消',
          confirmButtonText: '确定'
        })
      } catch (e) {
        return
      }

      try {
        await this.$http.delete(`categories/${row.cat_id}`)
        this.$message({
          type: 'success',
          message: '删除商品分类成功'
        })
        this.getTableList()
      } catch (error) {
        this.$catchHttpError(error)
      }
    },
    //   获取父级数据，用于级联选择框
    async getParentData() {
      try {
        const {data} = await this.$http.get(`categories`, {params: {type: 2}})
        this.casData = data.data
      } catch (error) {
        this.$catchHttpError(error)
      }
    },
    // 级联选择框发生变化时，触发
    handleCasChange() {
      if (this.selectedItems.length > 0) {
        //   说明选中了父级分类
        this.addFormData.cat_pid = this.selectedItems[this.selectedItems.length - 1]
        this.addFormData.cat_level = this.selectedItems.length
      } else {
        this.selectedItems.cat_pid = 0
        this.selectedItems.cat_level = 0
      }
    },
    addDialogCloseCb() {
      this.$refs.addForm.resetFields()
      this.addFormData.cat_pid = 0
      this.addFormData.cat_level = 0
      this.selectedItems = []
    }
  },
  created() {
    this.getTableList()
  }
}
</script>

<style lang="less">

</style>