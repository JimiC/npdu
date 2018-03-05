import { IDependencies } from './dependencies';

export interface IPackageDependencies {
  dependencies?: IDependencies | undefined;
  devDependencies?: IDependencies | undefined;
  peerDependencies?: IDependencies | undefined;
  optionalDependencies?: IDependencies | undefined;
}
