/**
 * getPkgName
 *
 * get package.json name to determine possible folder name - definitely if vega architecture
 */

const appRoot = require('app-root-dir').get()
const path = require('path')
const pkgPath = path.resolve(appRoot, 'package.json')
const pkg = require(pkgPath)

const name = pkg.name.split('/').pop()
module.exports = name
