import http from 'http';
import url from 'url';
import { INodePackage } from '../interfaces';
import { Logger } from '../services';
import { isValidUri } from '../utils';

export abstract class BaseRegistryManager {

  private readonly _registryUrl: url.Url;

  constructor(private _uri: string, protected _logger?: Logger) {
    this._registryUrl = url.parse(this._uri);
  }

  public abstract urlEncode(name: string): string;

  public async getPackageInfo(packageName: string): Promise<INodePackage> {
    if (!isValidUri(this._registryUrl.href)) {
      throw new Error(`Invalid Uri: ${this._registryUrl.href} (:getPackageInfo:)`);
    }
    const _address = url.resolve(this._registryUrl.href, this.urlEncode(packageName));
    if (this._logger) {
      this._logger.updateLog(`Getting package info of '${packageName}' from registry`);
    }
    const _protocol = require(this._registryUrl.protocol.slice(0, -1));
    const onResponse = (
      response: http.IncomingMessage,
      res: (value?: INodePackage | PromiseLike<INodePackage>) => void,
      rej: (reason?: any) => void) => {
      if (!response || (response.statusCode && response.statusMessage !== http.STATUS_CODES[200])) {
        const errMsg = `${(response ? response.statusMessage : 'No response received')} (:getPackageInfo:)`;
        return rej(new Error(errMsg));
      }
      let data: any = '';
      response
        .on('error', error => rej(error))
        .on('data', (chunk: any) => data += chunk)
        .on('end', _ => response.headers['content-type'].includes('application/json') && data
          ? res(JSON.parse(data))
          : rej(new Error('Registry returned incompatible data (:getPackageInfo:)')));
    };
    return new Promise<INodePackage>((
      res: (value?: INodePackage | PromiseLike<INodePackage>) => void,
      rej: (reason?: any) => void) =>
      _protocol
        .get(_address, response => onResponse(response, res, rej))
        .on('error', error => rej(error)));
  }
}
