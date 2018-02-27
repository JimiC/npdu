import { BaseLogger, BasePackageFileManager } from '../abstractions';
import { DependenciesFlags } from '../common/enumerations';
import { IDependencies, IPackageDependencies } from '../interfaces';
import {
  getDependenciesFlagByKey,
  getFinalNewLine,
  getIndentation,
  isValidPath,
  readFileAsync,
  writeFileAsync,
} from '../utils';

export class PackageFileManager extends BasePackageFileManager {

  private _document: string;
  private _filePath: string;
  private _finalNewLine: { has: boolean; type: string; };
  private _indentation: any;
  private _packageFileContent: IPackageDependencies;

  constructor(filePathOrDocument: string, logger?: BaseLogger) {
    super(logger);
    if (isValidPath(filePathOrDocument)) {
      this._filePath = filePathOrDocument;
    } else {
      this._document = filePathOrDocument;
    }
  }

  public get allDependencies(): IPackageDependencies {
    return {
      dependencies: this.dependencies,
      devDependencies: this.devDependencies,
      optionalDependencies: this.optionalDependencies,
      peerDependencies: this.peerDependencies,
    };
  }

  public get dependencies(): IDependencies {
    return this._packageFileContent.dependencies;
  }

  public get devDependencies(): IDependencies {
    return this._packageFileContent.devDependencies;
  }

  public get peerDependencies(): IDependencies {
    return this._packageFileContent.peerDependencies;
  }

  public get optionalDependencies(): IDependencies {
    return this._packageFileContent.optionalDependencies;
  }

  public async getDependencies(flag: string | DependenciesFlags): Promise<IPackageDependencies> {
    if (this._logger) {
      this._logger.updateLog('Getting dependencies of \'package.json\'');
    }
    if (!this._packageFileContent) {
      await this._setDocument();
    }
    if (typeof flag === 'string') {
      flag = getDependenciesFlagByKey(flag);
    }
    switch (flag) {
      case DependenciesFlags.All:
        return this.allDependencies;
      case DependenciesFlags.Prod:
        return { dependencies: this.dependencies };
      case DependenciesFlags.Dev:
        return { devDependencies: this.devDependencies };
      case DependenciesFlags.Peer:
        return { peerDependencies: this.peerDependencies };
      case DependenciesFlags.Optional:
        return { optionalDependencies: this.optionalDependencies };
      default:
        throw new Error('Not Implemented (:getDependencies:)');
    }
  }

  public async persist(
    resolvedDependecies: IPackageDependencies | ((...args: any[]) => Promise<void>),
    filePath?: string,
  ): Promise<void> {
    if (typeof resolvedDependecies === 'function') {
      return resolvedDependecies();
    }
    if (!this._filePath && !filePath) {
      throw new Error('A path to the \'package.json\' file is required (:persist:)');
    }
    if (!Object.keys(resolvedDependecies).length) {
      return;
    }
    if (this._logger) {
      this._logger.updateLog('Updating dependencies in \'package.json\'');
    }
    if (resolvedDependecies.dependencies) {
      this._packageFileContent.dependencies = resolvedDependecies.dependencies;
    }
    if (resolvedDependecies.devDependencies) {
      this._packageFileContent.devDependencies = resolvedDependecies.devDependencies;
    }
    if (resolvedDependecies.peerDependencies) {
      this._packageFileContent.peerDependencies = resolvedDependecies.peerDependencies;
    }
    if (resolvedDependecies.optionalDependencies) {
      this._packageFileContent.optionalDependencies = resolvedDependecies.optionalDependencies;
    }
    let data = JSON.stringify(this._packageFileContent, null, this._indentation.indent || this._indentation.amount);
    if (this._finalNewLine.has) {
      data += this._finalNewLine.type;
    }
    return writeFileAsync(this._filePath || filePath, data);
  }

  private async _setDocument(): Promise<void> {
    const document = this._filePath ? await readFileAsync(this._filePath) : this._document;
    this._packageFileContent = typeof document === 'string' ? JSON.parse(document) : {};
    this._indentation = getIndentation(document);
    this._finalNewLine = getFinalNewLine(document);
  }
}
