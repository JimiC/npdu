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
