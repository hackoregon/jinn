/**
 * duckExists
 *
 * Check whether the given duck exist in ducks or containers directory
 */

const fs = require('fs')
const path = require('path')
const appName = require('./rootPkgName')
const ducks = fs.readdirSync(path.join(__dirname, '../../src/' + appName + '/state'))

const duckExists = duck => ducks.indexOf(duck) >= 0

module.exports = duckExists
