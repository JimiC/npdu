import { IPackageDependencies } from '../interfaces';

export abstract class BaseVersionResolver {

  public abstract async resolve(dependencies: IPackageDependencies): Promise<IPackageDependencies>;
}
