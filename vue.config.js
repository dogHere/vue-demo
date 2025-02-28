module.exports = {
    // 修改的配置
    // 将baseUrl: '/api',改为baseUrl: '/',
    publicPath: process.env.NODE_ENV === 'production'?'/internal/dg/findwhyslow/index':'/',
    devServer: {
        proxy: {
            
            '/data/back': {
                // target: 'http://rc-data.corp.kuaishou.com',
                target: 'http://127.0.0.1:8094',
                changeOrigin: true,
                ws: false
            },
            '/internal/dg/findwhyslow': {
                target: 'http://127.0.0.1:8099',
                changeOrigin: true,
                ws: false
            },
            '/internal/dg/transformsql': {
                target: 'http://127.0.0.1:8098',
                changeOrigin: true,
                ws: false
            }
        }
    }
}