import http from 'http';
import url from 'url';
import { INodePackage } from '../interfaces';
import { Logger } from '../services';

export abstract class BaseRegistryManager {

  private readonly _registryUrl: url.Url;

  constructor(private _uri: string, protected _logger?: Logger) {
    this._registryUrl = url.parse(this._uri);
  }

  public abstract urlEncode(name: string): string;

  public async getPackageInfo(packageName: string): Promise<INodePackage> {
    const _address = url.resolve(this._registryUrl.href, this.urlEncode(packageName));
    if (this._logger) {
      this._logger.updateLog(`Getting package info of '${packageName}' from registry`);
    }
    const _protocol = require(this._registryUrl.protocol.slice(0, -1));
    const onResponce = (responce: http.IncomingMessage, res, rej) => {
      if (responce.statusCode && responce.statusMessage !== http.STATUS_CODES[200]) {
        return rej(new Error(responce.statusMessage));
      }
      let data = '';
      responce
        .on('error', error => rej(error))
        .on('data', (chunk: any) => data += chunk)
        .on('end', _ => res(JSON.parse(data))).setEncoding('utf8');
    };
    return new Promise<INodePackage>((res, rej) =>
      _protocol
        .get(_address, responce => onResponce(responce, res, rej))
        .on('error', error => rej(error)));
  }
}
