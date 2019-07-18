# NodeMCU TypeScript

This is a template for developing [NodeMCU](https://www.nodemcu.com/) via
TypeScript.

This project intends to use [TypeScriptToLua](https://typescripttolua.github.io/)
to compile TypeScript code into Lua and deploy it to NodeMCU.

This project is still a WIP and under development. Issues and pull requests are
welcome.

## Get started

Prepare by run:
```
yarn
```

Compile your code by run:
```
yarn build
```

Start develop mode (watch and compile)
```
yarn watch
```

## Current decleration file for NodeMCU modules

- adc
- gpio
- net
- node
- tmr
- wifi(`wifi.ap` not implements yet)

## To Do
- Deploy compiled lua file to nodemcu (manual or auto)
- More modules declaretion file in NodeMCU
