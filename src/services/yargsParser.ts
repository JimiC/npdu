import fs from 'fs';
import y = require('yargs');
import { BaseLogger } from '../abstractions';
import { IParsedArgs } from '../interfaces';

export class YargsParser {
  private readonly _allowedPolicies = ['semver', 'latest'];

  private readonly _options: { [key: string]: y.Options } = {
    filePath: {
      alias: 'f',
      default: './package.json',
      demandOption: true,
      description: 'The path to the \'package.json\' file',
      type: 'string',
    },
    keepRange: {
      alias: 'k',
      default: true,
      description: 'Keep range comparators',
      type: 'boolean',
    },
    logger: {
      alias: 'l',
      default: false,
      description: 'Use the built-in logger',
      type: 'boolean',
    },
    policy: {
      alias: 'p',
      default: 'semver',
      description: 'The policy on how the dependency version gets resolved',
      type: 'string',
    },
    registry: {
      alias: 'r',
      default: 'https://registry.npmjs.org',
      description: 'The URL of the NPM registry to use',
      type: 'string',
    },
  };

  constructor(private _logger?: BaseLogger) {
    y
      .usage('Usage: $0 command [options]')
      .command('all', 'Update all dependecies')
      .command('prod', 'Update dependecies only')
      .command('dev', 'Update devDependecies only')
      .command('peer', 'Update peerDependecies only')
      .command('optional', 'Update optionalDependecies only')
      .demandCommand(1, 'Missing command')
      .recommendCommands()
      .options(this._options)
      .choices('policy', this._allowedPolicies)
      .help()
      .alias('help', 'h')
      .version()
      .alias('version', 'V')
      .check((argv: y.Arguments) => this.validate(argv))
      .strict();
  }

  public parse(): IParsedArgs {
    const pargs = y.parse(process.argv.splice(2));
    return {
      command: pargs._[0],
      filePath: pargs.filePath,
      keepRange: pargs.keepRange,
      logger: pargs.logger,
      policy: pargs.policy,
      registry: pargs.registry,
    };
  }

  private validate(argv: y.Arguments): boolean {
    let errorMsg: string;
    const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
    if (!regex.test(argv.registry)) {
      errorMsg = 'Invalid argument: \'registry\'';
    }
    if (!fs.existsSync(argv.filePath)) {
      errorMsg = `File not found: '${argv.filePath}'`;
    }
    if (errorMsg) {
      if (this._logger) {
        this._logger.error(errorMsg);
      }
      throw new Error(errorMsg);
    }
    if (argv.registry !== this._options.registry.default) {
      if (this._logger) {
        this._logger.log(`Using provided registry: '${argv.registry}'`);
      }
    }
    return true;
  }
}
