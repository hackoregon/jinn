#!/usr/bin/env node
const minimist = require('minimist')
const changeCase = require('change-case')
const hb = require('handlebars')
const promisify = require('pify')
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const execSync = require('child_process').execSync

const _readFile = promisify(fs.readFile)
const _writeFile = promisify(fs.writeFile)
const _access = promisify(fs.access)
const mkdir = promisify(mkdirp)

const appName = require('./lib/utils/rootPkgName')
const appRoot = require('app-root-dir').get()
const log = require('./logger.js')

const pkgVersion = require(path.resolve(__dirname, 'package.json')).version

const helpText = `
    jinn v${pkgVersion}

    Usage
      $ jinn <cmd> <options>

    Commands
      -g                        generate .jinnrc file with view and state paths
      -h, --help                show help menu
      -v, --view <name> <type>  generate <type>[func, class, pure] view template with specified <name>
      -d, --duck <options>      generate duck template with <options>
      -version                  get jinn package version

    Options
      -a, --all                 option to generate with story, css and connected version
      -r, --reselect            option to generate duck template with reselect
      -s, --story               option to add story file to view template
      -c, --css                 option to add css modules file to view template
      -x                        option to add connected version of component to view template

    Examples
      jinn -v Button func -a     generate boilerplate for a Button functional component with all options
      jinn -v Cart class -c      generate boilerplate Cart class component with css modules
      jinn -d App                generate boilerplate for App duck
`

const minimistOpts = {
  alias: {
    a: 'all',
    c: 'css',
    d: 'duck',
    h: 'help',
    r: 'reselect',
    s: 'story',
    v: 'view'
  }
}

const argv = minimist(process.argv.slice(2), minimistOpts)
const fileExists = path => _access(path).then(() => true, () => false)
const readFile = path => _readFile(path, 'utf8')
const writeFile = (path, data) => _writeFile(path, data, 'utf8')

const jinnrcDefault = {
  viewFolder: path.resolve(appRoot, `src/${appName}/view`),
  stateFolder: path.resolve(appRoot, `src/${appName}/state`)
}

const jinnrcPath = path.resolve(appRoot, '.jinnrc')

let viewPath = jinnrcDefault.viewFolder
let statePath = jinnrcDefault.stateFolder

if (argv.p) {
  execSync('./node_modules/.bin/plop --plopfile ./lib/index.js', {stdio: [0, 1, 2]})
}

if (argv.h || argv.help) {
  log.success(helpText)
}

if (argv.j) {
  log.info(`Writing jinnrc with defaults at ${appRoot}/.jinnrc`)
  writeFile(jinnrcPath, JSON.stringify(jinnrcDefault), 'utf-8')
}

if (argv.v || argv.d) {
  hb.registerHelper('upperCase', changeCase.upperCase)
  hb.registerHelper('properCase', changeCase.pascalCase)
  hb.registerHelper('camelCase', changeCase.camelCase)
  hb.registerHelper('curly', (object, open) => (open ? '{' : '}'))
}

const destPath = (type, name) => {
  switch (type) {
    case 'view': return path.join(viewPath, name)
    case 'state':
    default: return path.join(statePath, name)
  }
}

const templatePath = (type, file) => path.join(__dirname, 'lib/templates', type, file)
const logSuccess = (type, filePath) => log.success(`Succesfully wrote ${type} boilerplate to ${filePath}`)

fileExists(jinnrcPath)
    .then(exists => {
      if (!exists) {
        log.warn('No .jinnrc file exists. Create one with -g flag. Modify as needed.')

        let templateFile = 'functional.js.hbs'

        if (argv.v) {
          const type = 'view'
          const name = argv.v
          const hbData = { name, appName }
          let indexFile = 'stateless-index.js.hbs'
          switch (argv._[0]) {
            case 'class': templateFile = 'class.js.hbs'; break
            case 'pure': templateFile = 'pure.js.hbs'; break
            case 'func':
            default: templateFile = 'functional.js.hbs'; break
          }

          const filesToWrite = [
            { source: templatePath('view', templateFile), dest: destPath('view', `${name}/component.js`) },
            { source: templatePath(type, 'test.js.hbs'), dest: destPath(type, `${name}/test.js`) }
          ]

          if (argv.x) {
            indexFile = 'index.js.hbs'
            filesToWrite.push({ source: templatePath(type, indexFile), dest: destPath(type, `${name}/index.js`) })
            filesToWrite.push({ source: templatePath(type, 'props.js.hbs'), dest: destPath(type, `${name}/props.js`) })
          } else {
            filesToWrite.push({ source: templatePath(type, indexFile), dest: destPath(type, `${name}/index.js`) })
          }

          if (argv.c) {
            filesToWrite.push({ source: templatePath(type, 'styles.css.hbs'), dest: destPath(type, `${name}/styles.css`) })
          }

          if (argv.s) {
            filesToWrite.push({ source: templatePath('view', 'story.js.hbs'), dest: destPath(type, `${name}/story.js`) })
          }

          if (argv.a) {
            indexFile = 'index.js.hbs'
            filesToWrite.push({ source: templatePath(type, indexFile), dest: destPath(type, `${name}/index.js`) })
            filesToWrite.push({ source: templatePath(type, 'props.js.hbs'), dest: destPath(type, `${name}/props.js`) })
            filesToWrite.push({ source: templatePath(type, 'styles.css.hbs'), dest: destPath(type, `${name}/styles.css`) })
            filesToWrite.push({ source: templatePath('view', 'story.js.hbs'), dest: destPath(type, `${name}/story.js`) })
          }

          filesToWrite.forEach(({ source, dest }) => {
            console.log('Writing to ', dest)
            mkdir(path.dirname(dest))
            .then(hb.compile(require(source)(hbData)))
            .then(code => writeFile(dest, code))
              .then(() => logSuccess(type, dest))
          })
        }

        if (argv.d) {
          const type = 'state'
          const name = argv.d
          const hbData = { name, appName }
          let selectorFile = 'selectors.js.hbs'
          const filesToWrite = [
            { source: templatePath(type, 'actions.js.hbs'), dest: destPath(type, `${name}/actions.js`) },
            { source: templatePath(type, 'constants.js.hbs'), dest: destPath(type, `${name}/constants.js`) },
            { source: templatePath(type, 'index.js.hbs'), dest: destPath(type, `${name}/index.js`) },
            { source: templatePath(type, 'reducer.js.hbs'), dest: destPath(type, `${name}/reducer.js`) },
            { source: templatePath(type, 'test.js.hbs'), dest: destPath(type, `${name}/test.js`) }
          ]
          if (argv.r || argv.a) {
            selectorFile = 'reselectors.js.hbs'
            filesToWrite.push({ source: templatePath(type, selectorFile), dest: destPath(type, `${name}/selectors.js`) })
          } else {
            filesToWrite.push({ source: templatePath(type, selectorFile), dest: destPath(type, `${name}/selectors.js`) })
          }

          filesToWrite.forEach(({ source, dest }) => {
            console.log('Writing to ', dest)
            mkdir(path.dirname(dest))
              .then(() => hb.compile(require(source)(hbData))())
              .then(code => writeFile(dest, code))
              .then(() => logSuccess(type, dest))
          })
        }
      }

      if (exists) {
        readFile(jinnrcPath).then(d => {
          const data = JSON.parse(d)
          const { viewFolder, stateFolder } = data

          viewPath = viewFolder
          statePath = stateFolder

          if (argv.v || argv.d) {
            hb.registerHelper('upperCase', changeCase.upperCase)
            hb.registerHelper('properCase', changeCase.pascalCase)
            hb.registerHelper('camelCase', changeCase.camelCase)
            hb.registerHelper('curly', (object, open) => (open ? '{' : '}'))
          }

          let templateFile = 'functional.js.hbs'

          if (argv.v) {
            const type = 'view'
            const name = argv.v
            const hbData = { name, appName }
            let indexFile = 'stateless-index.js.hbs'
            switch (argv._[0]) {
              case 'class': templateFile = 'class.js.hbs'; break
              case 'pure': templateFile = 'pure.js.hbs'; break
              case 'func':
              default: templateFile = 'functional.js.hbs'; break
            }

            const filesToWrite = [
              { source: templatePath('view', templateFile), dest: destPath('view', `${name}/component.js`) },
              { source: templatePath(type, 'test.js.hbs'), dest: destPath(type, `${name}/test.js`) }
            ]

            if (argv.x) {
              indexFile = 'index.js.hbs'
              filesToWrite.push({ source: templatePath(type, indexFile), dest: destPath(type, `${name}/index.js`) })
              filesToWrite.push({ source: templatePath(type, 'props.js.hbs'), dest: destPath(type, `${name}/props.js`) })
            } else {
              filesToWrite.push({ source: templatePath(type, indexFile), dest: destPath(type, `${name}/index.js`) })
            }

            if (argv.c) {
              filesToWrite.push({ source: templatePath(type, 'styles.css.hbs'), dest: destPath(type, `${name}/styles.css`) })
            }

            if (argv.s) {
              filesToWrite.push({ source: templatePath('view', 'story.js.hbs'), dest: destPath(type, `${name}/story.js`) })
            }

            if (argv.a) {
              indexFile = 'index.js.hbs'
              filesToWrite.push({ source: templatePath(type, indexFile), dest: destPath(type, `${name}/index.js`) })
              filesToWrite.push({ source: templatePath(type, 'props.js.hbs'), dest: destPath(type, `${name}/props.js`) })
              filesToWrite.push({ source: templatePath(type, 'styles.css.hbs'), dest: destPath(type, `${name}/styles.css`) })
              filesToWrite.push({ source: templatePath('view', 'story.js.hbs'), dest: destPath(type, `${name}/story.js`) })
            }

            filesToWrite.forEach(({ source, dest }) => {
              mkdir(path.dirname(dest))
              .then(hb.compile(require(source)(hbData)))
              .then(code => writeFile(dest, code))
              .then(() => logSuccess(type, dest))
            })
          }

          if (argv.d) {
            const type = 'state'
            const name = argv.d
            const hbData = { name, appName }
            let selectorFile = 'selectors.js.hbs'
            const filesToWrite = [
              { source: templatePath(type, 'actions.js.hbs'), dest: destPath(type, `${name}/actions.js`) },
              { source: templatePath(type, 'constants.js.hbs'), dest: destPath(type, `${name}/constants.js`) },
              { source: templatePath(type, 'index.js.hbs'), dest: destPath(type, `${name}/index.js`) },
              { source: templatePath(type, 'reducer.js.hbs'), dest: destPath(type, `${name}/reducer.js`) },
              { source: templatePath(type, 'test.js.hbs'), dest: destPath(type, `${name}/test.js`) }
            ]

            if (argv.r || argv.a) {
              selectorFile = 'reselectors.js.hbs'
              filesToWrite.push({ source: templatePath(type, selectorFile), dest: destPath(type, `${name}/selectors.js`) })
            } else {
              filesToWrite.push({ source: templatePath(type, selectorFile), dest: destPath(type, `${name}/selectors.js`) })
            }

            filesToWrite.forEach(({ source, dest }) => {
              mkdir(path.dirname(dest))
                .then(() => hb.compile(require(source)(hbData))())
                .then(code => writeFile(dest, code))
              .then(() => logSuccess(type, dest))
            })
          }
        })
      }
    })
