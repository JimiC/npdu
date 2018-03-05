module.exports = (wallaby) => ({
  files: [
    "src/**/*.ts",
    {
      "pattern": "test/fixtures/*.json",
      "instrument": false,
      "load": false
    },
    {
      "pattern": "./package.json",
      "instrument": true,
      "load": false
    }
  ],
  tests: [
    "test/**/*.test.ts"
  ],
  filesWithNoCoverageCalculated: [
    "src/*.ts"
  ],
  hints: {
    ignoreCoverage: /wallaby:ignore next/
  },
  testFramework: "mocha",
  env: {
    type: "node",
    runner: `${require('os').homedir()}/.nvm/versions/node/v6.13.0/bin/node`
  },
  delays: {
    run: 500
  },
  debug: true,
  reportConsoleErrorAsError: true,
});
