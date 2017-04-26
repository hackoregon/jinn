const path = require('path')
const readFile = require('./pfs').readFile
const appRoot = require('./appRoot')

module.exports = readFile(path.resolve(appRoot, '.jinnrc')).then(d => d)
