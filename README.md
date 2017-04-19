### React Ducks Gen
---

#### Install
` $ npm install react-ducks-gen `


#### Docs
```bash
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
```