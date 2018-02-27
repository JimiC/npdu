import detectIndent from 'detect-indent';
import fs from 'fs';

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

export const readFileAsync = (path: string, encoding = 'utf8'): Promise<string> => {
  return new Promise((res, rej) => fs.readFile(path, encoding, (err, data) => err ? rej(err) : res(data)));
};

export const writeFileAsync = (path: string, data: any): Promise<void> => {
  return new Promise((res, rej) => fs.writeFile(path, data, err => err ? rej(err) : res()));
};

export const getFinalNewLine = (text: string): { has: boolean, type: string } => {
  const eol = (text.match(/(?:\r?\n)/g) || [])[0];
  return { has: !!eol, type: eol || '' };
};

export const getIndentation = (text: string): { amount: number, indent: string; type: string } => {
  return detectIndent(text);
};
