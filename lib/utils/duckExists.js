/**
 * Check whether the given duck exist in ducks or containers directory
 */

const fs = require('fs')
const path = require('path')
const appName = require('./rootPkgName')
const appRoot = require('app-root-dir').get()
const ducks = fs.readdirSync(path.join(appRoot, 'src', appName, 'state'))

const duckExists = duck => ducks.indexOf(duck) >= 0

module.exports = duckExists
