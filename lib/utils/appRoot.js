const path = require('path')
const existsSync = require('fs').existsSync
const appRootPath = require('app-root-path')
const log = require('./logger')

const cwd = process.cwd()
const checkForPkg = dirpath => existsSync(path.resolve(dirpath, 'package.json'))

const ROOT = path.resolve(__dirname, '..' + path.sep + '..')

try {
  if (checkForPkg(ROOT)) {
    appRootPath.setPath(ROOT)
    if (ROOT !== cwd && checkForPkg(cwd)) {
      appRootPath.setPath(cwd)
    }
  }
} catch (e) {
  log.warn('No package.json found at root of project', e)
}

const appRoot = appRootPath.path

module.exports = appRoot
