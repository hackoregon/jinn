/**
 * generator/index.js
 *
 * Exports the generators so plop knows them
 */

const viewGenerator = require('./templates/view/index.js')
const stateGenerator = require('./templates/state/index.js')

module.exports = (plop) => {
  plop.addPrompt('directory', require('inquirer-directory'))
  plop.setGenerator('view', viewGenerator)
  plop.setGenerator('state', stateGenerator)
  plop.addHelper('curly', (object, open) => (open ? '{' : '}'))
}
