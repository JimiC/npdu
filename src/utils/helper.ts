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
  const regex = /(?:\r?\n)/g;
  const EOL = (text.match(regex) || [])[0];
  return { has: !!EOL, type: EOL || '' };
};

// Taken from <https://github.com/sindresorhus/detect-indent>
export const getIndentation = (str: string): any => {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }
  // Detect either spaces or tabs but not both to properly handle tabs for indentation and spaces for alignment
  const indentRegex = /^(?:( )+|\t+)/;
  // Used to see if tabs or spaces are the most used
  let tabs = 0;
  let spaces = 0;
  // Remember the size of previous line's indentation
  let prev = 0;
  // Remember how many indents/unindents as occurred for a given size and how much lines follow a given indentation
  //
  // indents = {
  //    3: [1, 0],
  //    4: [1, 5],
  //    5: [1, 0],
  //   12: [1, 0],
  // }
  const indents = new Map<number, number[]>();
  // Pointer to the array of last used indent
  let current: number[];
  // Whether the last action was an indent (opposed to an unindent)
  let isIndent: boolean;
  for (const line of str.split(/\n/g)) {
    if (!line) {
      // Ignore empty lines
      continue;
    }
    let ind;
    const matches = line.match(indentRegex);
    if (matches) {
      ind = matches[0].length;
      if (matches[1]) {
        spaces++;
      } else {
        tabs++;
      }
    } else {
      ind = 0;
    }
    const diff = ind - prev;
    prev = ind;
    if (diff) {
      // An indent or unindent has been detected
      isIndent = diff > 0;
      current = indents.get(isIndent ? diff : -diff);
      if (current) {
        current[0]++;
      } else {
        current = [1, 0];
        indents.set(diff, current);
      }
    } else if (current) {
      // If the last action was an indent, increment the weight
      current[1] += Number(isIndent);
    }
  }
  const getMostUsed = (entries: Map<number, number[]>) => {
    let result = 0;
    let maxUsed = 0;
    let maxWeight = 0;
    for (const entry of Array.from(entries)) {
      const [key, val] = entry;
      const [u, w] = val;
      if (u > maxUsed || (u === maxUsed && w > maxWeight)) {
        maxUsed = u;
        maxWeight = w;
        result = Number(key);
      }
    }
    return result;
  };
  const amount = getMostUsed(indents);
  let type;
  let indent;
  if (!amount) {
    type = null;
    indent = '';
  } else if (spaces >= tabs) {
    type = 'space';
    indent = ' '.repeat(amount);
  } else {
    type = 'tab';
    indent = '\t'.repeat(amount);
  }
  return { amount, indent, type };
};
