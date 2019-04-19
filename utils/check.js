const logger = require('./logger')

exports.checkDevServerConfig = config => {
    let error = null
    if (!config) {
        error = 'devServer config has not been found in webpack config'
    } else if (!config.contentBase) {
        error = 'devServer.contentBase is needed in webpack config'
    } else if (config.port && isNaN(Number(config.port))) {
        error = 'devServer.port need to be a number'
    }

    if (error) {
        logger.error(error)
        process.exit(1)
    }
}
