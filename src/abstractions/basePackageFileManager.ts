import { DependenciesFlags } from '../common/enumerations';
import { IPackageDependencies } from '../interfaces';

export abstract class BasePackageFileManager {
  public abstract async getDependencies(flag: DependenciesFlags, document?: string): Promise<IPackageDependencies>;

  public abstract async persist(
    resolvedDependecies: IPackageDependencies | ((...args: any[]) => Promise<void>),
    filePath?: string,
  ): Promise<void>;
}
