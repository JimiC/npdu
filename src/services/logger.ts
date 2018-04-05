import readline, { ReadLine } from 'readline';
import { BaseLogger } from '../abstractions';
import { ISpinner } from '../interfaces';

export class Logger extends BaseLogger {

  public eventEmitter: ReadLine;
  public frames: string[];
  public showSpinnerInFront: boolean;
  public spinnerInterval: number;

  private _countLines: number;

  constructor() {
    super();
    this.eventEmitter = readline.createInterface(process.stdin, process.stdout);
    this.frames = ['- ', '\\ ', '| ', '/ '];
    this.showSpinnerInFront = true;
    this.spinnerInterval = 80;
    this._countLines = 1;
  }

  public log(message: string, groupId?: string): void {
    process.stdout.write(`${this.getHeader(groupId)}${message}\n`);
    this._countLines++;
  }

  public error(message: string, groupId?: string): void {
    process.stderr.write(`${this.getHeader(groupId)}${message}\n`);
    this._countLines++;
  }

  public updateLog(message: string, groupId?: string): void;
  public updateLog(message: string, line: number, groupId?: string): void;
  public updateLog(message: string, lineOrGroupId?: number | string, groupId?: string): void {
    groupId = (typeof lineOrGroupId === 'string' && Number.isNaN(Number.parseInt(lineOrGroupId)))
      ? lineOrGroupId
      : groupId;

    if (!process.stdout.isTTY) {
      process.stdout.write(`${this.getHeader(groupId)}${message}\n`);
      return;
    }

    const line = (typeof lineOrGroupId === 'number' && !Number.isNaN(lineOrGroupId)) ? lineOrGroupId : 1;
    this.moveCursorTo(-line);
    readline.clearLine(process.stdout, 0);
    process.stdout.write(`${this.getHeader(groupId)}${message}`);
    this.moveCursorTo(line);
  }

  public spinnerLogStart(message: string, groupId?: string): ISpinner {
    const line = this._countLines;
    this.log(message, groupId);
    return { timer: this.spin(message, groupId, line), line };
  }

  public spinnerLogStop(spinner: ISpinner, message?: string, groupId?: string): void {
    clearInterval(spinner.timer);
    this.updateLog(message, this._countLines - spinner.line, groupId);
    if (!process.stdout.isTTY) { return; }
    this.cursorShow();
  }

  public handleForcedExit(hasInfoLogging: boolean): void {
    if (!process.stdout.isTTY) { return process.exit(); }
    const moveAndClear = () => {
      this.moveCursorTo(-1);
      readline.clearLine(process.stdout, 0);
    };
    readline.clearLine(process.stdout, 0);
    this.updateLog('');
    if (hasInfoLogging) {
      this.updateLog('', 2);
      moveAndClear();
    }
    moveAndClear();
    this.cursorShow();
    process.exit();
  }

  public moveCursorTo(line: number): void {
    if (!process.stdout.isTTY) { return; }
    readline.cursorTo(process.stdout, 0);
    readline.moveCursor(process.stdout, 0, line);
  }

  private spin(message: string, groupId?: string, line?: number): NodeJS.Timer {
    if (!process.stdout.isTTY) { return; }
    let i = 0;
    this.cursorHide();
    const iteration = () => {
      const frame = this.frames[i = ++i % this.frames.length];
      const msg = this.showSpinnerInFront
        ? `${this.getHeader(groupId)}${frame}${message}`
        : `${this.getHeader(groupId)}${message}${frame}`;
      this.updateLog(msg, this._countLines - line);
    };
    iteration();
    return setInterval(iteration, this.spinnerInterval);
  }

  private cursorShow(): void {
    process.stdout.write('\u001B[?25h');
  }

  private cursorHide(): void {
    process.stdout.write('\u001B[?25l');
  }

  private getHeader(groupId: string): string {
    return groupId ? `[${groupId}]: ` : '';
  }
}
