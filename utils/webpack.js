const logger = require('./logger')

exports.addClientEntry = (entries, path, inner = false) => {
    if (typeof entries === 'string') {
        return [path, entries]
    } else if (entries instanceof Array) {
        return [path, ...entries]
    }

    if (inner) {
        logger.error('The format of entry in webpack config is invalid. Please check before you restart.')
        process.exit(1)
    }

    const result = {}
    for (const name of Object.keys(entries)) {
        result[name] = exports.addClientEntry(entries[name], path, true)
    }
    return result
}
