const portfinder = require('portfinder')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

// 配置portfinder插件，若当前端口被占用，会自动使用后续的端口
portfinder.getPort({
    port: 8080,
    stopPort: 8090
}, () => {
})


// 配置webpack
module.exports = {
    // 注意配置的数据结构
    configureWebpack: {
        plugins: [
            // 插件运行端口注意不要和其他服务的端口相冲突
            new BundleAnalyzerPlugin({
                analyzerPort: 9000
            })
        ]
    }
}