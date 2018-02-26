import { BaseLogger } from '.';
import { DependenciesFlags } from '../common/enumerations';
import { IPackageDependencies } from '../interfaces';

export abstract class BasePackageFileManager {
  constructor(protected _logger?: BaseLogger) { }

  public abstract async getDependencies(flag: DependenciesFlags, document?: string): Promise<IPackageDependencies>;

  public abstract async persist(
    resolvedDependecies: IPackageDependencies | ((...args: any[]) => Promise<void>),
  ): Promise<void>;
}
