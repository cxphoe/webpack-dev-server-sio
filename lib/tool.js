const path = require('path')
const chalk = require('chalk')
const express = require('express')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const httpProxyMiddleware = require('http-proxy-middleware')
const socketIO = require('socket.io')
const http = require('http')
const history = require('connect-history-api-fallback')

const constant = require('./constant')
const check = require('../utils/check')
const logger = require('../utils/logger')
const { addClientEntry } = require('../utils/webpack')

const Me = 'webpack-dev-server-sio'

module.exports = class Tool {
    constructor(webpackConfig) {
        this.config = {
            ...webpackConfig,
            entry: addClientEntry(
                webpackConfig.entry,
                path.resolve(__dirname, './client.js')
            ),
        }

        check.checkDevServerConfig(webpackConfig.devServer)
        this.serverConfig = {
            port: 9001,
            ...webpackConfig.devServer,
        }
        this.compiler = webpack(this.config)
    }

    setupProxy(app) {
        const { proxy } = this.config.devServer
        if (!proxy) {
            return
        }

        for (const path of Object.keys(proxy)) {
            app.use(httpProxyMiddleware(path, proxy[path]))
        }
    }

    setupIOServer(server) {
        const { compiler } = this
        const io = socketIO(server)

        compiler.hooks.compile.tap(
            Me,
            () => {
                io.sockets.emit(constant.REBUILDING)
            }
        )

        compiler.hooks.done.tap(
            Me,
            stats => {
                if (stats.hasErrors()) {
                    io.sockets.emit(constant.COMPILE_FAIL)
                } else {
                    io.sockets.emit(constant.COMPILE_DONE)
                }
            }
        )
    }

    createServer() {
        const app = express()
        this.setupRouters(app)

        const server = http.Server(app)
        this.setupIOServer(server)

        return server
    }

    startServer() {
        const server = this.createServer()
        const { port } = this.serverConfig
        server.listen(port, function () {
            logger.progress(`Project is running at http://127.0.0.1:${port}/`)
        })
    }

    /**
     * @param {import('express').Express} app
     */
    setupRouters(app) {
        const { compiler } = this
        const { headers } = this.config

        if (headers) {
            app.use((req, res, next) => {
                for (const header of Object.keys(headers)) {
                    res.setHeader(header, headers[header])
                }
                return next()
            })
        }

        app.use(history(this.config.historyApiFallback))

        app.use(webpackDevMiddleware(compiler, {
            // 绑定中间件的公共路径,与webpack配置的路径相同
            publicPath: this.config.output.publicPath,
            // 向控制台显示任何内容
            quiet: true,
        }))

        this.setupProxy(app)

        const extTypeMappings = {
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.html': 'text/html',
        }

        // 默认所有路由访问都是获取文件
        app.get('*', (req, res) => {
            const { contentBase } = this.serverConfig
            const filePath = path.join(contentBase, req.url)

            compiler.outputFileSystem.readFile(filePath, (err, result) => {
                if (err) {
                    logger.error(chalk.red(err.message), chalk.cyan(filePath))
                    res.send('')
                    return
                }

                const ext = path.extname(filePath)
                const contentType = extTypeMappings[ext] || 'text/html'
                res.set('content-type', contentType)
                res.send(result)
            })
        })
    }
}
