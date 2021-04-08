<template>
  <div>
    <el-breadcrumb>
      <el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <div id="pic" style="height: 300px"></div>
    </el-card>
  </div>
</template>

<script>
import * as  echarts from 'echarts'

export default {
  name: "Statistics",
  data() {
    return {
      options: {}
    }
  },
  methods: {
    async initPic() {
      let area = echarts.init(document.getElementById('pic'))
      const {data} = await this.$http.get(`reports/type/1`)
      area.setOption(data.data)
    }
  },
  mounted() {
    this.initPic()
  }
}
</script>

<style lang="less">

</style>