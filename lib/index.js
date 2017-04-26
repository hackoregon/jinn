const appRoot = require('./utils/appRoot')
const existsSync = require('fs').existsSync
const readFileSync = require('fs').readFileSync
const viewGenerator = require('./templates/view/index.js')
const stateGenerator = require('./templates/state/index.js')
const pkgGenerator = require('./templates/package/index.js')
const rcDefaults = require('../rcDefaults.js')
const { join } = require('path')
const changeCase = require('change-case')

module.exports = (plop) => {
  const exists = existsSync(appRoot + '/.jinnrc')
  plop.addHelper('paramCase', changeCase.paramCase)
  plop.addPrompt('directory', require('inquirer-directory'))
  if (exists) {
    const rcData = readFileSync(appRoot + '/.jinnrc')
    const data = JSON.parse(rcData)
    plop.setGenerator('package', pkgGenerator(join(appRoot, data.viewFolder)))
    plop.setGenerator('view', viewGenerator(join(appRoot, data.viewFolder)))
    plop.setGenerator('state', stateGenerator(join(appRoot, data.stateFolder)))
  } else {
    plop.setGenerator('package', pkgGenerator(join(appRoot, rcDefaults.viewFolder)))
    plop.setGenerator('view', viewGenerator(join(appRoot, rcDefaults.viewFolder)))
    plop.setGenerator('state', stateGenerator(join(appRoot, rcDefaults.stateFolder)))
  }
}
