/**
 * Component Generator
 */

const componentExists = require('../../utils/componentExists')
const rootPkgName = require('../../utils/rootPkgName')

module.exports = {
  description: 'Add a component',
  prompts: [{
    type: 'list',
    name: 'type',
    message: 'Select the type of component',
    default: 'Stateless Function',
    choices: () => ['Class', 'React.PureComponent', 'Stateless/Functional']
  }, {
    type: 'input',
    name: 'name',
    message: 'Name the component',
    default: 'SizePicker',
    validate: (value) => {
      if ((/.+/).test(value)) {
        return componentExists(value) ? 'A component with this name already exists' : true
      }

      return 'Name is a required'
    }
  }, {
    type: 'confirm',
    name: 'wantConnected',
    default: true,
    message: 'Do you want to add a connected version of this component (i.e. index.js will bind component with connect)?'
  }, {
    type: 'confirm',
    name: 'wantStory',
    default: true,
    message: 'Do you want to add a story file (i.e. will this component use storybook)?'
  },
  {
    type: 'confirm',
    name: 'wantCss',
    default: true,
    message: 'Do you want to add a CSS file (i.e. will this component use CSS modules)?'
  }, {
    type: 'confirm',
    name: 'finalConfirm',
    message: 'Does everything look ok? -- Will write files if so...',
    default: true
  }
  ],
  actions: (data) => {
    let componentTemplate

    switch (data.type) {
      case 'Class': {
        componentTemplate = './templates/view/class.js.hbs'
        break
      }
      case 'React.PureComponent': {
        componentTemplate = './templates/view/pure.js.hbs'
        break
      }
      case 'Stateless/Functional': {
        componentTemplate = './templates/view/functional.js.hbs'
        break
      }
      default: {
        componentTemplate = './templates/view/class.js.hbs'
      }
    }

    const actions = [{
      type: 'add',
      path: `../src/${rootPkgName}/view/{{properCase name}}/component.js`,
      templateFile: componentTemplate,
      abortOnFail: true
    }, {
      type: 'add',
      path: `../src/${rootPkgName}/view/{{properCase name}}/test.js`,
      templateFile: './templates/view/test.js.hbs',
      abortOnFail: true
    }]

    // If they want a connected version
    if (data.wantConnected) {
      actions.push({
        type: 'add',
        path: `../src/${rootPkgName}/view/{{properCase name}}/index.js`,
        templateFile: './templates/view/index.js.hbs',
        abortOnFail: true
      })
      actions.push({
        type: 'add',
        path: `../src/${rootPkgName}/view/{{properCase name}}/props.js`,
        templateFile: './templates/view/props.js.hbs',
        abortOnFail: true
      })
    }
    // If they want a storybook story file
    if (data.wantStory) {
      actions.push({
        type: 'add',
        path: `../src/${rootPkgName}/view/{{properCase name}}/story.js`,
        templateFile: './templates/view/story.js.hbs',
        abortOnFail: true
      })
    }
    // If they want a css file
    if (data.wantStyles) {
      actions.push({
        type: 'add',
        path: `../src/${rootPkgName}/view/{{properCase name}}/styles.css`,
        templateFile: './templates/view/styles.css.hbs',
        abortOnFail: true
      })
    }

    return actions
  }
}
