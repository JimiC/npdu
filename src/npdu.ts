import { IPackageDependencies, IResolverOptions } from './interfaces';
import {
  Logger,
  PackageFileManager,
  RegistryManager,
  VersionResolver,
  YargsParser,
} from './services';

export = (async (): Promise<void> => {
  const logger = new Logger();
  const pargs = new YargsParser(logger).parse();
  const spinner = logger.spinnerLogStart('Updating dependencies');
  try {
    const _logger = pargs.logger ? logger : null;
    if (_logger) {
      logger.log('');
    }
    const pfm = new PackageFileManager(pargs.filePath, _logger);
    const dependencies: IPackageDependencies = await pfm.getDependencies(pargs.command);
    const rm = new RegistryManager(pargs.registry, _logger);
    const options: IResolverOptions = { keepRange: pargs.keepRange, strategy: pargs.strategy };
    const vr = new VersionResolver(options, rm, _logger);
    const resolvedDependencies: IPackageDependencies = await vr.resolve(dependencies);
    await pfm.persist(resolvedDependencies);

    logger.spinnerLogStop(spinner, 'Dependencies updated');
    if (_logger) {
      logger.updateLog('');
    }
  } catch (error) {
    logger.spinnerLogStop(spinner, 'NPDU failed to update the dependencies');
    logger.updateLog(`Error: ${error.message || error}`);
  }
});
