#!/usr/bin/env node
const minimist = require('minimist')
const changeCase = require('change-case')
const hb = require('handlebars')
const promisify = require('pify')
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')

const _readFile = promisify(fs.readFile)
const _writeFile = promisify(fs.writeFile)
const _access = promisify(fs.access)
const mkdir = promisify(mkdirp)

const appName = require('./lib/utils/rootPkgName')
const appRoot = require('app-root-dir').get()

const pkgVersion = require(path.resolve(__dirname, 'package.json')).version

const helpText = `
    react-ducks-gen v${pkgVersion}

    Usage
      $ gen <cmd> <options>

    Commands
      -g                        generate .genrc file with view and state paths
      -h, --help                show help menu
      -v, --view <name> <type>  generate <type>[func, class, pure] view template with specified <name>
      -d, --duck <options>      generate duck template with <options>
      -version                  get gen package version

    Options
      -a, --all                 option to generate with story, css and connected version
      -r, --reselect            option to generate duck template with reselect
      -s, --story               option to add story file to view template
      -c, --css                 option to add css modules file to view template
      -x                        option to add connected version of component to view template

    Examples
      gen -v Button func -a     generate boilerplate for a Button functional component with all options
      gen -v Cart class -c      generate boilerplate Cart class component with css modules
      gen -d App                generate boilerplate for App duck
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

const genrcDefault = {
  viewFolder: path.resolve(appRoot, `src/${appName}/view`),
  stateFolder: path.resolve(appRoot, `src/${appName}/state`)
}

const genrcPath = path.resolve(appRoot, '.genrc')

let viewPath = genrcDefault.viewFolder
let statePath = genrcDefault.stateFolder

fileExists(genrcPath)
    .then(exists => {
      if (!exists) {
        console.log('No .genrc file exists. Create one with -g flag. Modify as needed.')
        console.log('Writing view files to ', viewPath)
        console.log('Writing state files to ', statePath)
        if (argv.h || argv.help) {
          console.log(helpText)
        }

        if (argv.g) {
          console.log('Writing genrc with defaults at ', `${appRoot}/.genrc`)
          writeFile(genrcPath, JSON.stringify(genrcDefault), 'utf-8')
        }

        const destPath = (type, name) => {
          switch (type) {
            case 'view': return path.join(viewPath, name)
            case 'state':
            default: return path.join(statePath, name)
          }
        }

        if (argv.v || argv.d) {
          hb.registerHelper('upperCase', changeCase.upperCase)
          hb.registerHelper('properCase', changeCase.pascalCase)
          hb.registerHelper('camelCase', changeCase.camelCase)
          hb.registerHelper('curly', (object, open) => (open ? '{' : '}'))
        }

        let templateFile = 'functional.js.hbs'
        let templatePath = (type, file) => path.join(__dirname, 'lib/templates', type, file)

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
          })
        }
      }

      if (exists) {
        readFile(genrcPath).then(d => {
          const data = JSON.parse(d)
          const { viewFolder, stateFolder } = data

          viewPath = viewFolder
          statePath = stateFolder

          if (argv.h || argv.help) {
            console.log(helpText)
          }

          if (argv.g) {
            console.log('Writing genrc with defaults at ', `${appRoot}/.genrc`)
            writeFile(genrcPath, JSON.stringify(genrcDefault), 'utf-8')
          }

          const destPath = (type, name) => {
            switch (type) {
              case 'view': return path.join(viewPath, name)
              case 'state':
              default: return path.join(statePath, name)
            }
          }

          if (argv.v || argv.d) {
            hb.registerHelper('upperCase', changeCase.upperCase)
            hb.registerHelper('properCase', changeCase.pascalCase)
            hb.registerHelper('camelCase', changeCase.camelCase)
            hb.registerHelper('curly', (object, open) => (open ? '{' : '}'))
          }

          let templateFile = 'functional.js.hbs'
          let templatePath = (type, file) => path.join(__dirname, 'lib/templates', type, file)

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
            // console.log('FROM WITHIN', destPath(type, name))
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
            })
          }
        })
      }
    })
