module.exports = {
    // 修改的配置
    // 将baseUrl: '/api',改为baseUrl: '/',
    publicPath: '/',
    devServer: {
        proxy: {
            '/data/back': {
                target: 'http://127.0.0.1:8094',
                changeOrigin: true,
                ws: false
            },
            '/internal/dg/findwhyslow': {
                target: 'http://127.0.0.1:8099',
                changeOrigin: true,
                ws: false
            }
        }
    }
}