const promisify = require('pify')
const fs = require('fs')
const mkdirp = require('mkdirp')
const _readFile = promisify(fs.readFile)
const _writeFile = promisify(fs.writeFile)
const _access = promisify(fs.access)
const mkdir = promisify(mkdirp)

const fileExists = path => _access(path).then(() => true, () => false)
const readFile = path => _readFile(path, 'utf8')
const writeFile = (path, data) => _writeFile(path, data, 'utf8')

module.exports = {
  fileExists,
  mkdir,
  readFile,
  writeFile
}
