import { BaseLogger, BasePackageFileManager } from '../abstractions';
import { DependenciesFlags } from '../common/enumerations';
import { IPackageDependencies } from '../interfaces';
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

  constructor(filePathOrDocument: string, private _logger?: BaseLogger) {
    super();
    if (isValidPath(filePathOrDocument)) {
      this._filePath = filePathOrDocument;
    } else {
      this._document = filePathOrDocument;
    }
  }

  public async getDependencies(flag: string | DependenciesFlags): Promise<IPackageDependencies> {
    if (this._logger) {
      this._logger.updateLog('Getting dependencies of \'package.json\'');
    }
    if (!this._packageFileContent) {
      const document = this._filePath ? await readFileAsync(this._filePath) : this._document;
      try {
        this._packageFileContent = JSON.parse(document);
      } catch (err) {
        throw new Error('Only \'package.json\' files are supported (:getDependencies:)');
      }
      this._indentation = getIndentation(document);
      this._finalNewLine = getFinalNewLine(document);
    }
    if (typeof flag === 'string') {
      flag = getDependenciesFlagByKey(flag);
    }
    switch (flag) {
      case DependenciesFlags.All:
        {
          const deps: IPackageDependencies = {};
          if (this._packageFileContent.dependencies) {
            deps.dependencies = this._packageFileContent.dependencies;
          }
          if (this._packageFileContent.devDependencies) {
            deps.devDependencies = this._packageFileContent.devDependencies;
          }
          if (this._packageFileContent.peerDependencies) {
            deps.peerDependencies = this._packageFileContent.peerDependencies;
          }
          if (this._packageFileContent.optionalDependencies) {
            deps.optionalDependencies = this._packageFileContent.optionalDependencies;
          }
          return deps;
        }
      case DependenciesFlags.Prod:
        return { dependencies: this._packageFileContent.dependencies };
      case DependenciesFlags.Dev:
        return { devDependencies: this._packageFileContent.devDependencies };
      case DependenciesFlags.Peer:
        return { peerDependencies: this._packageFileContent.peerDependencies };
      case DependenciesFlags.Optional:
        return { optionalDependencies: this._packageFileContent.optionalDependencies };
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
}
