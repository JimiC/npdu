import { IPackageDependencies, IResolverOptions } from './interfaces';
import {
  Logger,
  PackageFileManager,
  RegistryManager,
  VersionResolver,
  YargsParser,
} from './services';

export = (async (): Promise<void> => {
  const id = 'npdu';
  const logger = new Logger();
  const pargs = new YargsParser(logger).parse();
  const _logger = pargs.logger ? logger : null;
  logger.eventEmitter.on('SIGINT', () => logger.handleForcedExit(!!_logger));
  const spinner = logger.spinnerLogStart('Updating dependencies', id);
  if (_logger) { logger.log(''); }
  try {
    const pfm = new PackageFileManager(pargs.filePath, _logger);
    const dependencies: IPackageDependencies = await pfm.getDependencies(pargs.command);
    const rm = new RegistryManager(pargs.registry, _logger);
    const options: IResolverOptions = { keepRange: pargs.keepRange, strategy: pargs.strategy };
    const vr = new VersionResolver(options, rm, _logger);
    const resolvedDependencies: IPackageDependencies = await vr.resolve(dependencies);
    await pfm.persist(resolvedDependencies);
    logger.spinnerLogStop(spinner, 'Dependencies updated', id);
    if (_logger) {
      logger.updateLog('');
      logger.moveCursorTo(-1);
    }
  } catch (error) {
    logger.spinnerLogStop(spinner, 'Failed to update the dependencies', id);
    logger.updateLog(`Error: ${error.message || error}`);
  } finally {
    process.exit();
  }
});
