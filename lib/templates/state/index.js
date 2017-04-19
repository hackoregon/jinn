/**
 * Container Generator
 */

const duckExists = require('../../utils/duckExists')
const rootPkgName = require('../../utils/rootPkgName')

const defaultPath = `../src/${rootPkgName}/state/`

module.exports = {
  description: 'Add a duck',
  prompts: [{
    type: 'input',
    name: 'name',
    message: 'Set the name',
    default: 'Form',
    validate: (value) => {
      if ((/.+/).test(value)) {
        return duckExists(value) ? 'A duck with this name already exists' : true
      }

      return 'The name is required'
    }
  }, {
    type: 'confirm',
    name: 'wantReselect',
    message: 'Do you use reselect for selectors?',
    default: false
  }],
  actions: data => {
    const actions = [
      {
        type: 'add',
        path: `${defaultPath}/{{properCase name}}/index.js`,
        templateFile: './templates/state/index.js.hbs',
        abortOnFail: true
      }, {
        type: 'add',
        path: `${defaultPath}/{{properCase name}}/test.js`,
        templateFile: './templates/state/test.js.hbs',
        abortOnFail: true
      }, {
        type: 'add',
        path: `${defaultPath}/{{properCase name}}/actions.js`,
        templateFile: './templates/state/actions.js.hbs',
        abortOnFail: true
      }, {
        type: 'add',
        path: `${defaultPath}/{{properCase name}}/constants.js`,
        templateFile: './templates/state/constants.js.hbs',
        abortOnFail: true
      }, {
        type: 'add',
        path: `${defaultPath}/{{properCase name}}/reducer.js`,
        templateFile: './templates/state/reducer.js.hbs',
        abortOnFail: true
      }
    ]
    if (data.wantReselect) {
      actions.push({
        type: 'add',
        path: `${defaultPath}/{{properCase name}}/selectors.js`,
        templateFile: './templates/state/reselectors.js.hbs',
        abortOnFail: true
      })
    } else {
      actions.push({
        type: 'add',
        path: `${defaultPath}/{{properCase name}}/selectors.js`,
        templateFile: './templates/state/selectors.js.hbs',
        abortOnFail: true
      })
    }
    return actions
  }
}
