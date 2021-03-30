<template>
  <div>
    <!--    顶部面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--    card区域-->
    <el-card>
      <el-row>
        <el-input v-model="searchPara" style="width: 400px;margin-right: 20px" clearable>
          <el-button slot="append" icon="el-icon-search"></el-button>
        </el-input>
        <el-button type="primary">添加商品</el-button>
      </el-row>
      <!--      商品列表-->
      <el-table :data="goodsList" border stripe>
        <el-table-column label="#" type="index" width="50px"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格（元）" prop="goods_price" width="120px"></el-table-column>
        <el-table-column label="商品重量（克）" prop="goods_weight" width="120px"></el-table-column>
        <el-table-column label="添加时间" prop="add_time" width="200px"></el-table-column>
        <el-table-column label="操作" width="120px">
          <template>
            <el-button class="el-icon-edit" size="mini" type="primary"></el-button>
            <el-button class="el-icon-delete" size="mini" type="danger"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--      分页-->
      <el-pagination
          layout="total,sizes, pager, next, jumper"
          :page-sizes="[5,10,15,20]"
          :page-size="5"
          :current-page.sync="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Goods",
  data() {
    return {
      searchPara: '',
      goodsList: [],
      pageData: {
        pagenum: 1,
        pagesize: 5
      },
      currentPage: 1,
      total: 0
    }
  },
  methods: {
    async getGoodsList() {
      try {
        const {data} = await this.$http.get(`goods`, {
          params: {
            query: this.searchPara,
            ...this.pageData
          }
        })
        this.goodsList = data.data.goods
        this.total = data.data.total
        this.$message({
          type: 'success',
          message: '获取商品成功'
        })
      } catch (error) {
        this.$catchHttpError(error)
      }
    },
    handleSizeChange(val) {
      this.pageData.pagesize = val
      this.getGoodsList()
    },
    handleCurrentChange(val) {
      this.pageData.pagenum = val
      this.getGoodsList()
    }
  },
  created() {
    this.getGoodsList()
  }
}
</script>

<style lang="less">

</style>