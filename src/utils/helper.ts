import detectIndent from 'detect-indent';
import fs from 'fs';
import path from 'path';
import { DependenciesFlags } from '../common/enumerations';

export const validUrlRegEx =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

export const isNullOrUndefind = (obj: any, ...args: any[]): boolean => {
  let _isNullOrUndefind = !obj;
  if (!_isNullOrUndefind) {
    args.some(arg => {
      obj = obj[arg];
      return _isNullOrUndefind = !obj;
    });
  }
  return _isNullOrUndefind;
};

export const readFileAsync = (filePath: string, encoding = 'utf8'): Promise<string> => {
  return new Promise((res, rej) => fs.readFile(filePath, encoding, (err, data) => err ? rej(err) : res(data)));
};

export const writeFileAsync = (filePath: string, data: any): Promise<void> => {
  return new Promise((res, rej) => fs.writeFile(filePath, data, err => err ? rej(err) : res()));
};

export const getFinalNewLine = (text: string): { has: boolean, type: string } => {
  const eol = (text.match(/(?:\r?\n)/g) || [])[0];
  return { has: !!eol, type: eol || '' };
};

export const getIndentation = (text: string): { amount: number, indent: string; type: string } => {
  return detectIndent(text);
};

export const isValidPath = (filePath: string): boolean => {
  return path.basename(filePath) === 'package.json';
};

export const getDependenciesFlagByKey = (key: string): DependenciesFlags => {
  switch (key) {
    case 'all':
      return DependenciesFlags.All;
    case 'prod':
      return DependenciesFlags.Prod;
    case 'dev':
      return DependenciesFlags.Dev;
    case 'peer':
      return DependenciesFlags.Peer;
    case 'optional':
      return DependenciesFlags.Optional;
    default:
      throw new Error('Not Implemented (:getDependenciesFlagByKey:)');
  }
};

export const isValidUri = (uri: string): boolean => {
  return validUrlRegEx.test(uri);
};
