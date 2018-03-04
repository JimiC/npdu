import { BaseLogger, BaseRegistryManager } from '../abstractions';

export class RegistryManager extends BaseRegistryManager {

  constructor(uri: string, logger?: BaseLogger) {
    super(uri, logger);
  }

  public urlEncode(name: string): string {
    if (this._logger) {
      this._logger.updateLog(`URL encoding package name: '${name}'`);
    }
    const isScoped = name.startsWith('@');
    const resolvedName = isScoped ? name.substr(1) : name;
    const encodedName = `${isScoped ? '@' : ''}${encodeURIComponent(resolvedName)}`;
    return encodedName;
  }
}
