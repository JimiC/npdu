import semver from 'semver';
import { BaseLogger, BaseRegistryManager, BaseVersionResolver } from '../abstractions';
import { Strategy } from '../common/enumerations';
import {
  IDependencies,
  INodePackage,
  IPackageDependencies,
  IResolverOptions,
} from '../interfaces';

export class VersionResolver extends BaseVersionResolver {

  constructor(
    private _options: IResolverOptions,
    private _registryManager: BaseRegistryManager,
    private _logger?: BaseLogger) {
    super();
  }

  public async resolve(dependencies: IPackageDependencies): Promise<IPackageDependencies> {
    const packages = this._getAggregatedDependencies(dependencies);
    for (const packageName in packages) {
      if (!Reflect.has(packages, packageName)) { continue; }
      if (this._logger) {
        this._logger.updateLog(`Resolving version of package: '${packageName}'`);
      }
      const currentVersion = packages[packageName];
      const newVersion = await this._findNewVersion(packageName, this._options.strategy, currentVersion);
      if (newVersion && currentVersion !== newVersion) {
        const depends = this._getDependenciesOfPackage(dependencies, packageName);
        depends[packageName] = newVersion;
        if (this._logger) {
          this._logger.updateLog(`Found new version: '${newVersion}' for package: '${packageName}'`);
        }
      } else {
        if (this._logger) {
          this._logger.updateLog(`Package: '${packageName}' is already up-to-date (${this._options.strategy})`);
        }
      }
    }
    return Promise.resolve(dependencies);
  }

  private _getAggregatedDependencies(dependencies: IPackageDependencies): IDependencies {
    return Reflect.ownKeys(dependencies)
      .map<IDependencies>(key => dependencies[key])
      .reduce((p: IDependencies, c: IDependencies) => ({ ...p, ...c }), {});
  }

  private async _findNewVersion(packageName: string, strategy: string, currentVersion: string): Promise<string> {
    const info: INodePackage = await this._registryManager.getPackageInfo(packageName);
    if (!info) {
      if (this._logger) {
        this._logger.updateLog(`Unable to get package info of '${packageName}' from registry`);
      }
      return null;
    }
    return this._getVersionFromStrategy(info, strategy, currentVersion);
  }

  private _getVersionFromStrategy(info: INodePackage, strategy: string, currentVersion: string): string {
    switch (Strategy[strategy]) {
      case Strategy.latest:
        return info['dist-tags']
          ? this._getRange(info['dist-tags'].latest, currentVersion)
          : currentVersion;
      case Strategy.semver:
        const newVersion = this._getMaxSatisfiedVersion(info, currentVersion);
        return this._getRange(newVersion, currentVersion);
      default:
        throw new Error('Not Implemented (:getVersionFromStrategy:)');
    }
  }

  private _getRange(newVersion: string, currentVersion: string): string {
    if (!newVersion) { return currentVersion; }
    if (!this._options.keepRange) { return newVersion; }
    // TODO: Implement other range cases
    return currentVersion.replace(/[0-9.]+-*[a-zA-Z0-9]*/g, newVersion);
  }

  private _getMaxSatisfiedVersion(info: INodePackage, range: string): string {
    const aggregator = Reflect.ownKeys(info.versions || {}).reduce((p: string[], c: string) => p.concat(c), []);
    return semver.maxSatisfying(aggregator, range);
  }

  private _getDependenciesOfPackage(dependencies: IPackageDependencies, packageName: string): IDependencies {
    return Reflect.ownKeys(dependencies)
      .map<IDependencies>(key => dependencies[key])
      .find(obj => Reflect.has(obj, packageName));
  }
}
