const path = require('path')
const appName = require('./lib/utils/rootPkgName')
const appRoot = require('./lib/utils/appRoot')

module.exports = {
  viewFolder: `src/${appName}/view`,
  stateFolder: `src/${appName}/state`,
  storiesFolderName: '',
  testsFolderName: ''
}
