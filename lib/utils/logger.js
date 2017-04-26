const chalk = require('chalk')

const jinn = chalk.magenta.bold('Jinn ::')

const warn = t => console.log(jinn, chalk.red.bold(t))
const info = t => console.log(jinn, chalk.blue(t))
const success = t => console.log(jinn, chalk.green.bold(t))

module.exports = {
  warn,
  info,
  success
}
