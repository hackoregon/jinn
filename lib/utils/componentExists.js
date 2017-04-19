/**
 * componentExists
 *
 * Check whether the given component exist in either the components or containers directory
 */

const fs = require('fs')
const path = require('path')
const appName = require('./rootPkgName')
const components = fs.readdirSync(path.join(__dirname, '../../src/' + appName + '/view'))

const componentExists = comp => components.indexOf(comp) >= 0

module.exports = componentExists
