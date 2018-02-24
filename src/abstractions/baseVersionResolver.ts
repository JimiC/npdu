import { BaseLogger, BaseRegistryManager } from '.';
import { IPackageDependencies, IResolverOptions } from '../interfaces';

export abstract class BaseVersionResolver {

  constructor(
    protected _options: IResolverOptions,
    protected _registryManager: BaseRegistryManager,
    protected _logger?: BaseLogger) {
  }

  public abstract async resolve(dependencies: IPackageDependencies): Promise<IPackageDependencies>;
}
