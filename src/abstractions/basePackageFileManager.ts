import { BaseLogger } from '.';
import { DependenciesFlags } from '../common/enumerations';
import { IPackageDependencies } from '../interfaces';

export abstract class BasePackageFileManager {
  constructor(protected _logger?: BaseLogger) { }

  public abstract getDependencies(flag: DependenciesFlags): IPackageDependencies;

  public abstract persist(resolvedDependecies: IPackageDependencies): PromiseLike<boolean>;
}
