### Jinn
---
Jinn is a boilerplate generator for react components and redux ducks.
Thanks to node-plop & plop, this cli boilerplate generator also has prompts via inquirer.

#### Install
` $ npm install @hackoregon/jinn --save-dev`

#### Docs
```bash
Usage
      $ jinn <cmd> <options>

    Commands
      -g                        generate .genrc file with view and state paths
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
```