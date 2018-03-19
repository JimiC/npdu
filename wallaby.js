module.exports = (wallaby) => ({
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
  hints: {
    ignoreCoverage: /\/* wallaby ignore next\/*/
  },
  testFramework: "mocha",
  env: {
    type: "node",
    runner: process.platform === 'win32'
      ? `${process.env.APPDATA}\\nvm\\v6.13.0\\node`
      : `${require('os').homedir()}/.nvm/versions/node/v6.13.0/bin/node`
  },
  delays: {
    run: 500
  },
  debug: true,
  reportConsoleErrorAsError: true,
  setup: (wallaby) => wallaby.testFramework.ui('bdd')
});
