/**
 * get package.json name to determine possible folder name - definitely if vega architecture
 */

const path = require('path')
const appRoot = require('./appRoot.js')
const pkgPath = path.resolve(appRoot, 'package.json')

const pkg = require(pkgPath); // eslint-disable-line
const name = pkg.name ? pkg.name.split('/').pop() : path.parse(appRoot).name

module.exports = name
