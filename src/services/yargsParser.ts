import y = require('yargs');
import { BaseLogger } from '../abstractions';
import { IParsedArgs } from '../interfaces';

export class YargsParser {
  private readonly allowedPolicies = ['semver', 'latest'];

  constructor(private _logger?: BaseLogger) {
    const options: { [key: string]: y.Options } = {
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
        description: 'Whether the range comparators are kept',
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

    y
      .usage('Usage: $0 command [options]')
      .command('all', 'Update all dependecies')
      .command('prod', 'Update dependecies only')
      .command('dev', 'Update devDependecies only')
      .command('peer', 'Update peerDependecies only')
      .command('optional', 'Update optionalDependecies only')
      .demandCommand(1, 'Missing command')
      .recommendCommands()
      .options(options)
      .choices('policy', this.allowedPolicies)
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
      policy: pargs.policy,
      registry: pargs.registry,
    };
  }

  private validate(pargs: y.Arguments): boolean {
    if (pargs.registry) {
      const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
      if (!regex.test(pargs.registry)) {
        y.showHelp();
        if (this._logger) {
          this._logger.error(`Invalid argument: 'registry'`);
        }
        process.exit(1);
      }
    }
    return true;
  }
}
