import { IDependencies } from './dependencies';

export interface IPackageDependencies {
  dependencies?: IDependencies;
  devDependencies?: IDependencies;
  peerDependencies?: IDependencies;
  optionalDependencies?: IDependencies;
}
