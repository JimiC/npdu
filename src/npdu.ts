import fs from 'fs';
import { DependenciesFlags } from './common/enumerations';
import { IPackageDependencies, IResolverOptions } from './interfaces';
import {
  Logger,
  PackageFileManager,
  RegistryManager,
  VersionResolver,
  YargsParser,
} from './services';

class NPDU {
  constructor() {
    this._init();
  }

  private async _init() {
    const logger = new Logger();
    const pargs = new YargsParser(logger).parse();
    const spinner = logger.spinnerLogStart('Updating dependencies...');
    logger.log('');
    try {
      const _logger = pargs.logger ? logger : null;
      const document = fs.readFileSync(pargs.filePath, 'utf8');
      const pfm = new PackageFileManager(document, _logger);
      const depFlag = this._getDependenciesFlag(pargs.command);
      const dependencies: IPackageDependencies = pfm.getDependencies(depFlag);
      const rm = new RegistryManager(pargs.registry, _logger);
      const options: IResolverOptions = {
        keepRange: pargs.keepRange,
        policy: pargs.policy,
      };
      const vr = new VersionResolver(options, rm, _logger);
      const resolvedDependencies: IPackageDependencies = await vr.resolve(dependencies);
      await pfm.persist(resolvedDependencies);

      logger.updateLog('');
      logger.spinnerLogStop(spinner, 'Dependencies updated');
    } catch (error) {
      logger.updateLog('');
      logger.spinnerLogStop(spinner, 'NPDU failed to update the dependencies');
      logger.error(error.stack || error.message || error);
    }
  }

  private _getDependenciesFlag(command: string): DependenciesFlags {
    switch (command) {
      case 'all':
        return DependenciesFlags.All;
      case 'prod':
        return DependenciesFlags.Prod;
      case 'dev':
        return DependenciesFlags.Dev;
      case 'peer':
        return DependenciesFlags.Peer;
      case 'optional':
        return DependenciesFlags.Optional;
    }
  }
}

export const npdu = new NPDU();
