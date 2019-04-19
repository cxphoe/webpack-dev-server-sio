#!/usr/bin/env node

const program = require('commander')
const path = require('path')
const chalk = require('chalk')

const pkg = require('../package.json')
const Tool = require('../lib/tool')
const logger = require('../utils/logger')


program
    .version(pkg.version, '-v, --version')
    .usage('[options]')


program
    .description('Start a webpack development server with ie8 compability.')
    .option('-c, --config', 'set up the webpack config file path (relative or absolute)')
    .action((name, cmd) => {
        if (cmd) {
            const filePath = cmd.args[0]
            const configFilePath = path.isAbsolute(filePath)
                ? filePath
                : path.resolve(process.cwd(), filePath)
            const webpackConfig = require(configFilePath)
            if (!webpackConfig) {
                logger.error('There seems to be some error when loading webpack config from path', chalk.cyan(configFilePath))
                process.exit(1)
            }
            new Tool(webpackConfig).startServer()
        } else {
            program.outputHelp()
        }
    })


program.parse(process.argv)
