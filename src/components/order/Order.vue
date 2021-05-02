<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-input style="width: 400px" v-model="queryInfo.query" placeholder="Keyword">
        <el-button slot="append" class="el-icon-search" @click="getTableList"></el-button>
      </el-input>
      <el-table :data="tableData" border stripe>
        <el-table-column label="#" type="index" width="50px"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="70px"></el-table-column>
        <el-table-column label="是否付款" width="100px">
          <template v-slot="{row}">
            <el-tag type="warning" size="small" v-if="row.order_pay==='0'">未付款</el-tag>
            <el-tag type="success" size="small" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" width="100px">
          <template v-slot="{row}">
            <el-tag type="warning" size="small" v-if="row.is_send==='否'">未发货</el-tag>
            <el-tag type="success" size="small" v-else>已发货</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" prop="create_time"></el-table-column>
        <el-table-column label="操作">
          <template v-slot="{row}">
            <el-button type="primary" size="mini" class="el-icon-edit" @click="handleEdit(row)"></el-button>
            <el-button type="success" size="mini" class="el-icon-location" @click="handleLocation(row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10,15,20,25]"
          :page-size="10"
          layout="total,sizes,pager,next,jumper"
          :total="totalRecords"></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Order",
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      totalRecords: 0,
      currentPage: 1,
      tableData: []
    }
  },
  methods: {
    async getTableList() {
      try {
        const {data} = await this.$http.get(`orders`, {params: this.queryInfo})
        this.tableData = data.data.goods
        this.totalRecords = data.data.total
        this.$message({
          type: 'success',
          message: '获取订单数据成功'
        })
      } catch (error) {
        this.$catchHttpError(error)
      }
    },
    handleSizeChange(val) {
      this.queryInfo.pagesize = val
      this.getTableList()
    },
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val
      this.getTableList()
    },
    handleEdit() {
    },
    handleLocation() {
    }
  },
  created() {
    this.getTableList()
  }
}
</script>

<style lang="less">

</style>