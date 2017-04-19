const viewGenerator = require('./templates/view/index.js')
const stateGenerator = require('./templates/state/index.js')

module.exports = (plop) => {
  plop.setGenerator('view', viewGenerator)
  plop.setGenerator('state', stateGenerator)
  plop.addHelper('curly', (object, open) => (open ? '{' : '}'))
}
