import semver from 'semver';
import { BaseLogger, BaseRegistryManager, BaseVersionResolver } from '../abstractions';
import { Policy } from '../common/enumerations';
import {
  IDependencies,
  INodePackage,
  IPackageDependencies,
  IResolverOptions,
} from '../interfaces';

export class VersionResolver extends BaseVersionResolver {

  constructor(
    options: IResolverOptions,
    registryManager: BaseRegistryManager,
    logger?: BaseLogger) {
    super(options, registryManager, logger);
  }

  public async resolve(dependencies: IPackageDependencies): Promise<IPackageDependencies> {
    if (this._logger) {
      this._logger.updateLog('Resolving versions');
    }
    const depends = this._getAggregatedDependencies(dependencies);
    for (const dep in depends) {
      if (!Reflect.has(depends, dep)) { continue; }
      depends[dep] = await this._findVersion(dep, this._options.policy, depends[dep]);
    }

    return Promise.resolve(dependencies);
  }

  private async _findVersion(packageName: string, policy: string, defaultVersion: string): Promise<string> {
    const info: INodePackage = await this._registryManager.getPackageInfo(packageName);
    return this._getVersionFromPolicy(info, policy, defaultVersion);
  }

  private _getMaxSatisfiedVersion(info: INodePackage, defaultVersion: string): string {
    const aggregator = Reflect.ownKeys(info.versions).reduce((p: string[], c: string) => p.concat(c), []);
    const maxVersion = semver.maxSatisfying(aggregator, defaultVersion);
    return info.versions ? maxVersion || defaultVersion : defaultVersion;
  }

  private _getRange(newVersion: string, defaultVersion: string): string {
    if (!newVersion || !this._options.keepRange) { return defaultVersion; }

    // TODO: Implement other range cases
    return defaultVersion.replace(/[0-9.]+-*[a-zA-Z0-9]*/g, newVersion);
  }

  private _getVersionFromPolicy(info: INodePackage, policy: string, defaultVersion: string): string {
    switch (Policy[policy]) {
      case Policy.latest:
        return info['dist-tags']
          ? this._getRange(info['dist-tags'].latest, defaultVersion)
          : defaultVersion;
      case Policy.semver:
        return this._getMaxSatisfiedVersion(info, defaultVersion);
      default:
        throw new Error('Not Implemented');
    }
  }

  private _getAggregatedDependencies(dependencies: IPackageDependencies): IDependencies {
    return Reflect.ownKeys(dependencies)
      .filter(key => dependencies[key])
      .map<IDependencies>(key => dependencies[key])
      .reduce((p: IDependencies, c: IDependencies) => ({ ...p, ...c }), {});
  }
}
