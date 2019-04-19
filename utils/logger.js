const chalk = require('chalk')

exports.error = (...args) => {
    console.log(chalk.bgRed(' ERROR '), ...args)
}

exports.debug = (...args) => {
    console.log(chalk.bgBlack(' DEBUG ', ...args))
}

exports.progress = (...args) => {
    console.log('｢sio｣:', ...args)
}
