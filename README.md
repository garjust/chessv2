# chessv2

## Dev setup

- With NVM installed the correct version of node will be autoselected. If not `.nvmrc` contains the correct node version.
- Enable corepack `corepack enable` to automatically install the preffered bundling tool `yarn`
- `yarn start`

### Testing

- Run `yarn test` from CLI to run test suite
- If using VSCode install the Vitest extension and enable watch mode!

## Installing cutechess-cli (OSX)

### Compile from source

> `brew install qt`
> `git clone https://github.com/cutechess/cutechess.git`
> `cd cutechess`
> `qmake -spec macx-clang -config static`
> `make`

### Move compiled binary to vendor/

> `mv projects/cli/cutechess-cli <chessv2>/vendor`
