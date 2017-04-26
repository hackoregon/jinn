const existsSync = require('fs').existsSync
const readFileSync = require('fs').readFileSync
const appRoot = require('../../utils/appRoot')
const author = require('../../utils/author')
const checkDir = require('../../utils/checkDir')
const { join, resolve } = require('path')
const jinnrcPath = resolve(appRoot, '.jinnrc')
const defaultRc = require('../../../rcDefaults')
const rcExists = existsSync(jinnrcPath)

module.exports = (rootPath) => {
  return {
    description: 'Add a component',
    prompts: [
      {
        type: 'list',
        name: 'type',
        message: 'Select the type of component',
        default: 'Stateless/Functional',
        choices: () => ['Stateless/Functional', 'Class', 'React.PureComponent']
      }, {
        type: 'input',
        name: 'name',
        message: 'Name the component',
        default: 'SizePicker',
        validate: (value) => {
          if ((/.+/).test(value)) {
            return checkDir(rootPath, value) ? 'A directory with this name already exists' : true
          }

          return 'Name is a required'
        }
      },
      {
        type: 'directory',
        name: 'packagePath',
        message: 'where would you like to put this component?',
        basePath: appRoot
      },
      {
        type: 'input',
        name: 'description',
        message: 'How about a description?',
        default: 'Let me tell you... We have the best components.. they are just faaaantastic.. the best fantastic components!'
      },
      {
        type: 'input',
        name: 'contributor',
        message: 'And your name/email?',
        default: author
      },
      {
        type: 'confirm',
        name: 'wantCss',
        default: true,
        message: 'Do you want to add a CSS file (i.e. will this component use CSS modules)?'
      },
      {
        type: 'confirm',
        name: 'finalConfirm',
        message: 'Does everything look ok? -- Will write files if so...',
        default: true
      }],
    actions: data => {
      if (!data.finalConfirm) return []
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
      let storiesFolder = defaultRc.storiesFolderName
      let testsFolder = defaultRc.testsFolderName
      if (rcExists) {
        const rcData = readFileSync(appRoot + '/.jinnrc')
        const data = JSON.parse(rcData)
        storiesFolder = data.storiesFolderName
        testsFolder = data.testsFolderName
      }

      const destPath = name => join(appRoot, '{{ packagePath }}', '{{ properCase name }}', 'src', name)
      const storiesPath = name => destPath(join(storiesFolder, name))
      const testsPath = name => destPath(join(testsFolder, name))
      const actions = [{
        type: 'add',
        path: join(appRoot, '{{ packagePath}}', '{{properCase name}}', 'package.json'),
        templateFile: './templates/package/package.json.hbs',
        abortOnFail: true
      },
      {
        type: 'add',
        path: destPath('index.js'),
        templateFile: './templates/view/stateless-index.js.hbs',
        abortOnFail: true
      },
      {
        type: 'add',
        path: destPath('component.js'),
        templateFile: componentTemplate,
        abortOnFail: true
      }]

      if (testsFolder.length) {
        actions.push({
          type: 'add',
          path: testsPath('{{properCase name}}.test.js'),
          templateFile: './templates/view/test.js.hbs',
          abortOnFail: true
        })
      } else {
        actions.push({
          type: 'add',
          path: destPath('test.js'),
          templateFile: './templates/view/test.js.hbs',
          abortOnFail: true
        })
      }

      if (storiesFolder.length) {
        actions.push({
          type: 'add',
          path: storiesPath('{{properCase name}}.story.js'),
          templateFile: './templates/view/story.js.hbs',
          abortOnFail: true
        })
      } else {
        actions.push({
          type: 'add',
          path: destPath('story.js'),
          templateFile: './templates/view/story.js.hbs',
          abortOnFail: true
        })
      }

      // If they want a css file
      if (data.wantCss) {
        actions.push({
          type: 'add',
          path: destPath('styles.css'),
          templateFile: './templates/view/styles.css.hbs',
          abortOnFail: true
        })
      }

      return actions
    }
  }
}
