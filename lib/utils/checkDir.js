/**
 * Check whether the given dir name exists already
 */

const fs = require('fs')
const log = require('./logger')
const appRoot = require('./appRoot')

const checkDir = (dirPath = appRoot, name) => {
  try {
    const dirs = fs.readdirSync(dirPath)
    return dirs.indexOf(name) >= 0
  } catch (e) {
    return log.warn(`${dirPath} did not exist, creating...`)
  }
}

module.exports = checkDir
