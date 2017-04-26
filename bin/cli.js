#!/usr/bin/env node

const minimist = require('minimist')
const path = require('path')
const appRoot = require('../lib/utils/appRoot')
const existsSync = require('fs').existsSync
const readFileSync = require('fs').readFileSync
const execSync = require('child_process').execSync
const hb = require('handlebars')
const changeCase = require('change-case')

const log = require('../lib/utils/logger')
const jinnrcDefaults = require('../rcDefaults.js')
const { writeFile, mkdir } = require('../lib/utils/pfs')
const appName = require('../lib/utils/rootPkgName')
const checkDir = require('../lib/utils/checkDir')
const contributor = require('../lib/utils/author')

const minimistOpts = {
  alias: {
    a: 'all',
    c: 'css',
    d: 'duck',
    h: 'help',
    p: 'package',
    r: 'reselect',
    s: 'story',
    v: 'view'
  }
}
const argv = minimist(process.argv.slice(2), minimistOpts)
const pkgVersion = require(path.resolve(__dirname, '../package.json')).version

const helpText = `
    jinn v${pkgVersion}

    Usage
      $ jinn <cmd> <options>
      $ npm run jinn -- <cmd> <options>

    Commands
      -j                            generate .jinnrc file with view and state paths
      -h, --help                    show help menu
      -v, --view <name> <type>      generate <type>[func, class, pure] view template with specified <name>
      -d, --duck <options>          generate duck template with <options>
      --prompt                      generate with prompts
      -version                      get jinn package version

    Options
      -p, --package                 option to generate view as it's own package
      --desc                        add description to package via command line
      -a, --all                     option to generate with story, css and connected version
      -r, --reselect                option to generate duck template with reselect
      -s, --story                   option to add story file to view template
      -c, --css                     option to add css modules file to view template
      -x                            option to add connected version of component to view template

    Examples
      jinn -v Map -p -s             generate boilerplate for a Map component as a package with storybook file included
      jinn -v Button func -a        generate boilerplate for a Button functional component with all options
      jinn -v Cart class -c         generate boilerplate Cart class component with css modules
      jinn -d App                   generate boilerplate for App duck
`

const jinnrcPath = path.resolve(appRoot, '.jinnrc')
const rcExists = existsSync(jinnrcPath)

let viewPath = jinnrcDefaults.viewFolder
let statePath = jinnrcDefaults.stateFolder
let storiesFolder = jinnrcDefaults.storiesFolderName
let testsFolder = jinnrcDefaults.testsFolderName

const logSuccess = (type = 'view', filePath = viewPath) => log.success('Successfully wrote ' + type + ' template to ' + filePath)
const templatePath = (type, file) => path.join(__dirname, '../lib/templates', type, file)
const destPath = (type, name) => {
  switch (type) {
    case 'view': return path.join(viewPath, name)
    case 'state':
    default: return path.join(statePath, name)
  }
}

if (argv.j) {
  log.success(`Writing jinnrc with defaults at ${appRoot}/.jinnrc`)
  return writeFile(jinnrcPath, JSON.stringify(jinnrcDefaults), 'utf-8')
}

if (argv.h) {
  return log.success(helpText)
}

if (argv.prompt) {
  const pathToLib = path.resolve(__dirname, '../lib/index.js')
  const nodePath = path.resolve(__dirname, '../node_modules')
  return execSync(`${nodePath}/.bin/plop --plopfile ${pathToLib}`, {stdio: [0, 1, 2]})
}

if (argv.v || argv.d) {
  hb.registerHelper('upperCase', changeCase.upperCase)
  hb.registerHelper('properCase', changeCase.pascalCase)
  hb.registerHelper('camelCase', changeCase.camelCase)
  hb.registerHelper('paramCase', changeCase.paramCase)
  hb.registerHelper('curly', (object, open) => (open ? '{' : '}'))
}

if (!rcExists) {
  log.warn('No .jinnrc file exists. Create one with -j flag. Modify as needed.')

  if (argv.v) {
    const type = 'view'
    const name = argv.v
    const description = argv.desc || 'Meh'
    const hbData = { name, contributor, description }

    const dirExists = checkDir(viewPath, name)
    if (dirExists) {
      log.warn(`${name} exists already at ${viewPath}`)
      process.exit(1)
    } else {
      let templateFile = 'functional.js.hbs'
      switch (argv._[0]) {
        case 'class': templateFile = 'class.js.hbs'; break
        case 'pure': templateFile = 'pure.js.hbs'; break
        case 'func':
        default: templateFile = 'functional.js.hbs'; break
      }

      const filesToWrite = [
        // { source: templatePath(type, templateFile), dest: destPath(type, `${name}/component.js`) },
        // { source: templatePath(type, 'test.js.hbs'), dest: destPath(type, `${name}/test.js`) }
      ]

      if (argv.p) {
        filesToWrite.push({ source: templatePath('package', 'package.json.hbs'), dest: destPath(type, `${name}/package.json`) })
        filesToWrite.push({ source: templatePath('view', templateFile), dest: destPath('view', `${name}/src/component.js`) })
      } else {
        filesToWrite.push({ source: templatePath('view', templateFile), dest: destPath('view', `${name}/component.js`) })
      }

      if ((argv.x || argv.a) && !argv.p) {
        filesToWrite.push({ source: templatePath(type, 'index.js.hbs'), dest: destPath(type, `${name}/index.js`) })
        filesToWrite.push({ source: templatePath(type, 'props.js.hbs'), dest: destPath(type, `${name}/props.js`) })
      } else {
        if (argv.p) {
          filesToWrite.push({ source: templatePath(type, 'stateless-index.js.hbs'), dest: destPath(type, `${name}/src/index.js`) })
        } else {
          filesToWrite.push({ source: templatePath(type, 'stateless-index.js.hbs'), dest: destPath(type, `${name}/index.js`) })
        }
      }
      if (argv.c || argv.a) {
        if (argv.p) {
          filesToWrite.push({ source: templatePath(type, 'styles.css.hbs'), dest: destPath(type, `${name}/src/styles.css`) })
        } else {
          filesToWrite.push({ source: templatePath(type, 'styles.css.hbs'), dest: destPath(type, `${name}/styles.css`) })
        }
      }

      if ((argv.s || argv.a) && !argv.p) {
        if (argv.p && storiesFolder.length) {
          filesToWrite.push({ source: templatePath('view', 'story.js.hbs'), dest: destPath(type, path.join(name, 'src', storiesFolder, `${name}.story.js`)) })
        } else {
          filesToWrite.push({ source: templatePath('view', 'story.js.hbs'), dest: destPath(type, `${name}/story.js`) })
        }
      }

      filesToWrite.forEach(({ source, dest }) => {
        mkdir(path.dirname(dest))
        .then(hb.compile(require(source)(hbData)))
        .then(code => writeFile(dest, code))
        .then(() => logSuccess(type, dest))
      })
    }
  }

  if (argv.d) {
    const type = 'state'
    const name = argv.d
    const hbData = { name, appName }
    const dirExists = checkDir(statePath, name)
    if (dirExists) {
      log.warn(`${name} exists already at ${statePath}. Aborting...`)
      process.exit(1)
    } else {
      const filesToWrite = [
        { source: templatePath(type, 'actions.js.hbs'), dest: destPath(type, `${name}/actions.js`) },
        { source: templatePath(type, 'constants.js.hbs'), dest: destPath(type, `${name}/constants.js`) },
        { source: templatePath(type, 'index.js.hbs'), dest: destPath(type, `${name}/index.js`) },
        { source: templatePath(type, 'reducer.js.hbs'), dest: destPath(type, `${name}/reducer.js`) },
        { source: templatePath(type, 'test.js.hbs'), dest: destPath(type, `${name}/test.js`) }
      ]
      if (argv.r || argv.a) {
        filesToWrite.push({ source: templatePath(type, 'reselectors.js.hbs'), dest: destPath(type, `${name}/selectors.js`) })
      } else {
        filesToWrite.push({ source: templatePath(type, 'selectors.js.hbs'), dest: destPath(type, `${name}/selectors.js`) })
      }

      filesToWrite.forEach(({ source, dest }) => {
        mkdir(path.dirname(dest))
          .then(() => hb.compile(require(source)(hbData))())
          .then(code => writeFile(dest, code))
          .then(() => logSuccess(type, dest))
      })
    }
  }
}

if (rcExists) {
  const rcData = readFileSync(appRoot + '/.jinnrc')
  const data = JSON.parse(rcData)
  const { viewFolder, stateFolder } = data

  viewPath = viewFolder
  statePath = stateFolder
  storiesFolder = data.storiesFolderName
  testsFolder = data.testsFolderName

  let templateFile = 'functional.js.hbs'

  if (argv.v) {
    const type = 'view'
    const name = argv.v
    const description = argv.desc || 'Meh'
    const hbData = { name, contributor, description }
    const dirExists = checkDir(viewPath, name)
    if (dirExists) {
      log.warn(`${name} exists already at ${viewPath}`)
      process.exit(1)
    } else {
      switch (argv._[0]) {
        case 'class': templateFile = 'class.js.hbs'; break
        case 'pure': templateFile = 'pure.js.hbs'; break
        case 'func':
        default: templateFile = 'functional.js.hbs'; break
      }

      const filesToWrite = []
      if (argv.p) {
        filesToWrite.push({ source: templatePath('package', 'package.json.hbs'), dest: destPath(type, `${name}/package.json`) })
        filesToWrite.push({ source: templatePath('view', templateFile), dest: destPath('view', `${name}/src/component.js`) })
      } else {
        filesToWrite.push({ source: templatePath('view', templateFile), dest: destPath('view', `${name}/component.js`) })
      }

      if (argv.p && testsFolder.length) {
        filesToWrite.push({ source: templatePath('view', 'test.js.hbs'), dest: destPath(type, path.join(name, 'src', testsFolder, `${name}.test.js`)) })
      } else {
        filesToWrite.push({ source: templatePath(type, 'test.js.hbs'), dest: destPath(type, `${name}/test.js`) })
      }

      if ((argv.x || argv.a) && !argv.p) {
        filesToWrite.push({ source: templatePath(type, 'index.js.hbs'), dest: destPath(type, `${name}/index.js`) })
        filesToWrite.push({ source: templatePath(type, 'props.js.hbs'), dest: destPath(type, `${name}/props.js`) })
      } else {
        if (argv.p) {
          filesToWrite.push({ source: templatePath(type, 'stateless-index.js.hbs'), dest: destPath(type, `${name}/src/index.js`) })
        } else {
          filesToWrite.push({ source: templatePath(type, 'stateless-index.js.hbs'), dest: destPath(type, `${name}/index.js`) })
        }
      }

      if (argv.c || argv.a) {
        if (argv.p) {
          filesToWrite.push({ source: templatePath(type, 'styles.css.hbs'), dest: destPath(type, `${name}/src/styles.css`) })
        } else {
          filesToWrite.push({ source: templatePath(type, 'styles.css.hbs'), dest: destPath(type, `${name}/styles.css`) })
        }
      }

      if (argv.s || argv.a) {
        if (argv.p && storiesFolder.length) {
          filesToWrite.push({ source: templatePath('view', 'story.js.hbs'), dest: destPath(type, path.join(name, 'src', storiesFolder, `${name}.story.js`)) })
        } else {
          filesToWrite.push({ source: templatePath('view', 'story.js.hbs'), dest: destPath(type, `${name}/story.js`) })
        }
      }

      filesToWrite.forEach(({ source, dest }) => {
        mkdir(path.dirname(dest))
        .then(hb.compile(require(source)(hbData)))
        .then(code => writeFile(dest, code))
        .then(() => logSuccess(type, dest))
      })
    }
  }

  if (argv.d) {
    const type = 'state'
    const name = argv.d
    const hbData = { name, appName }
    const dirExists = checkDir(statePath, name)
    if (dirExists) {
      log.warn(`${name} exists already at ${statePath}`)
      process.exit(1)
    } else {
      const filesToWrite = [
        { source: templatePath(type, 'actions.js.hbs'), dest: destPath(type, `${name}/actions.js`) },
        { source: templatePath(type, 'constants.js.hbs'), dest: destPath(type, `${name}/constants.js`) },
        { source: templatePath(type, 'index.js.hbs'), dest: destPath(type, `${name}/index.js`) },
        { source: templatePath(type, 'reducer.js.hbs'), dest: destPath(type, `${name}/reducer.js`) },
        { source: templatePath(type, 'test.js.hbs'), dest: destPath(type, `${name}/test.js`) }
      ]
      if (argv.r || argv.a) {
        filesToWrite.push({ source: templatePath(type, 'reselectors.js.hbs'), dest: destPath(type, `${name}/selectors.js`) })
      } else {
        filesToWrite.push({ source: templatePath(type, 'selectors.js.hbs'), dest: destPath(type, `${name}/selectors.js`) })
      }

      filesToWrite.forEach(({ source, dest }) => {
        mkdir(path.dirname(dest))
        .then(() => hb.compile(require(source)(hbData))())
        .then(code => writeFile(dest, code))
        .then(() => logSuccess(type, dest))
      })
    }
  }
}
