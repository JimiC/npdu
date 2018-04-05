module.exports = {
  files: [
    "src/**/*.ts",
    "test/fixtures/*.json",
    "package.json"
  ],
  tests: [
    "test/**/*.test.ts"
  ],
  filesWithNoCoverageCalculated: [
    "src/cli.ts"
  ],
  preprocessors: {
    "**/test/fixtures/*.json": (file, done) => done(file.rename(`../${file.path}`).content)
  },
  hints: {
    ignoreCoverage: /\/* wallaby ignore next\/*/
  },
  testFramework: "mocha",
  env: {
    type: "node",
    runner: process.platform === "win32" ? `${process.env.APPDATA}\\nvm\\v6.14.1\\node` : `${require('os').homedir()}/.nvm/versions/node/v6.14.1/bin/node`
  },
  delays: {
    run: 500
  },
  debug: true,
  reportConsoleErrorAsError: true,
  setup: (wallaby) => wallaby.testFramework.ui("bdd")
};
