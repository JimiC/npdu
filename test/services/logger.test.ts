// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import readline from 'readline';
import sinon from 'sinon';
import { Logger } from '../../src/services';

describe('Logger: tests', function () {

  let logger: Logger;
  let sandbox: sinon.SinonSandbox;

  beforeEach(function () {
    sandbox = sinon.createSandbox();
    logger = new Logger();
  });

  afterEach(function () {
    logger = null;
    sandbox.restore();
  });

  context('expects', function () {

    it('to correctly implement BaseLogger',
      function () {
        expect(logger).to.have.deep.property('constructor');
        expect(logger).to.have.deep.property('log');
        expect(logger).to.have.deep.property('error');
        expect(logger).to.have.deep.property('updateLog');
        expect(logger).to.have.deep.property('spinnerLogStart');
        expect(logger).to.have.deep.property('spinnerLogStop');
      });

    it('to have own \'frames\' property',
      function () {
        expect(logger).to.haveOwnProperty('frames');
      });

    it('to have own \'countLines\' property',
      function () {
        expect(logger).to.haveOwnProperty('countLines');
      });

    context('when calling function \'log\'', function () {

      it('the process stdout write function is called',
        function () {
          const stub = sandbox.stub(process.stdout, 'write');
          logger.log('test');
          stub.restore();
          expect(stub.calledOnce).to.be.true;
          expect(stub.calledWith('test\n')).to.be.true;
        });

      it('the lines count to increase by one',
        function () {
          expect(logger).to.have.property('countLines', 1);
          const stub = sandbox.stub(process.stdout, 'write');
          logger.log('test');
          stub.restore();
          expect(logger).to.have.property('countLines', 2);
          expect(stub.calledWith('test\n')).to.be.true;
        });

      it('to display the \'groupId\' when provided',
        function () {
          const stub = sandbox.stub(process.stdout, 'write');
          logger.log('test', 'Mocha');
          stub.restore();
          expect(stub.calledWith('[Mocha]: test\n')).to.be.true;
        });

    });

    context('when calling function \'error\'', function () {

      it('the process stderr write function is called',
        function () {
          const stub = sandbox.stub(process.stderr, 'write');
          logger.error('test');
          stub.restore();
          expect(stub.calledOnce).to.be.true;
          expect(stub.calledWith('test\n')).to.be.true;
        });

      it('the lines count to increase by one',
        function () {
          expect(logger).to.have.property('countLines', 1);
          const stub = sandbox.stub(process.stderr, 'write');
          logger.error('test');
          stub.restore();
          expect(logger).to.have.property('countLines', 2);
          expect(stub.calledWith('test\n')).to.be.true;
        });

      it('to display the \'groupId\' when provided',
        function () {
          const stub = sandbox.stub(process.stderr, 'write');
          logger.error('test', 'Mocha');
          stub.restore();
          expect(stub.calledWith('[Mocha]: test\n')).to.be.true;
        });

    });

    let isTTY: true | undefined;

    beforeEach(function () {
      isTTY = process.stdout.isTTY;
    });

    afterEach(function () {
      process.stdout.isTTY = isTTY;
    });

    context('when calling function \'updateLog\'', function () {

      it('to display the \'groupId\' when provided',
        function () {
          const stub = sandbox.stub(process.stdout, 'write');
          logger.updateLog('test', 'Mocha');
          stub.restore();
          expect(stub.calledWith('[Mocha]: test\n')).to.be.true;
        });

      context('if the terminal', function () {

        context('is TTY', function () {

          context('the cursor moves', function () {

            it('and returns to the original lines',
              function () {
                process.stdout.isTTY = true;
                const writeStub = sandbox.stub(process.stdout, 'write');
                const moveCursorSpy = sandbox.spy(readline, 'moveCursor');
                const clearLineSpy = sandbox.spy(readline, 'clearLine');
                logger.updateLog('test');
                writeStub.restore();
                expect(clearLineSpy.calledOnce).to.be.true;
                expect(moveCursorSpy.calledTwice).to.be.true;
                expect(moveCursorSpy.firstCall.calledWith(process.stdout, 0, -1)).to.be.true;
                expect(moveCursorSpy.secondCall.calledWith(process.stdout, 0, 1)).to.be.true;
                expect(writeStub.called).to.be.true;
              });

            it('one line when no line parameter is provided',
              function () {
                process.stdout.isTTY = true;
                const stub = sandbox.stub(process.stdout, 'write');
                const moveCursorSpy = sandbox.spy(readline, 'moveCursor');
                logger.updateLog('test');
                stub.restore();
                expect(moveCursorSpy.calledWith(process.stdout, 0, -1)).to.be.true;
                expect(moveCursorSpy.calledWith(process.stdout, 0, 1)).to.be.true;
              });

            it('that much lines when line parameter is provided',
              function () {
                process.stdout.isTTY = true;
                const stub = sandbox.stub(process.stdout, 'write');
                const moveCursorSpy = sandbox.spy(readline, 'moveCursor');
                logger.updateLog('test', 5);
                stub.restore();
                expect(moveCursorSpy.calledWith(process.stdout, 0, -5)).to.be.true;
                expect(moveCursorSpy.calledWith(process.stdout, 0, 5)).to.be.true;
              });

            it('that much lines and groupdId is displayed when both are provided',
              function () {
                process.stdout.isTTY = true;
                const stub = sandbox.stub(process.stdout, 'write');
                const moveCursorSpy = sandbox.spy(readline, 'moveCursor');
                logger.updateLog('test', 5, 'Mocha');
                stub.restore();
                expect(stub.calledWith('[Mocha]: test\n')).to.be.true;
                expect(moveCursorSpy.calledWith(process.stdout, 0, -5)).to.be.true;
                expect(moveCursorSpy.calledWith(process.stdout, 0, 5)).to.be.true;
              });

          });

        });

        context('is not TTY', function () {

          it('the cursor does not move',
            function () {
              process.stdout.isTTY = undefined;
              const writeStub = sandbox.stub(process.stdout, 'write');
              const moveCursorSpy = sandbox.spy(readline, 'moveCursor');
              const clearLineSpy = sandbox.spy(readline, 'clearLine');
              logger.updateLog('test');
              writeStub.restore();
              expect(clearLineSpy.called).to.be.false;
              expect(moveCursorSpy.called).to.be.false;
              expect(writeStub.called).to.be.true;
            });

        });

      });

    });

    let timer: sinon.SinonFakeTimers;

    beforeEach(function () {
      timer = sandbox.useFakeTimers();
    });

    afterEach(function () {
      timer.restore();
    });

    context('when calling function \'spinnerLogStart\'', function () {

      context('if the terminal', function () {

        context('is TTY', function () {

          context('to display the spinner', function () {

            it('before the message',
              function () {
                process.stdout.isTTY = true;
                const stub = sandbox.stub(process.stdout, 'write');
                const logSpy = sandbox.spy(logger, 'log');
                const updateLogSpy = sandbox.spy(logger, 'updateLog');
                const spinner = logger.spinnerLogStart('test');
                timer.tick(logger.spinnerInterval);
                clearInterval(spinner.timer);
                stub.restore();
                expect(updateLogSpy.calledOnce).to.be.true;
                expect(updateLogSpy.calledWith('\\ test', 1)).to.be.true;
                expect(updateLogSpy.calledAfter(logSpy)).to.be.true;
                expect(logSpy.calledOnce).to.be.true;
                expect(logSpy.calledWith('test')).to.be.true;
                expect(stub.calledWith('\u001B[?25l')).to.be.true;
              });

            it('and the \'groupId\' when provided',
              function () {
                process.stdout.isTTY = true;
                const stub = sandbox.stub(process.stdout, 'write');
                const logSpy = sandbox.spy(logger, 'log');
                const updateLogSpy = sandbox.spy(logger, 'updateLog');
                const spinner = logger.spinnerLogStart('test', 'Mocha');
                timer.tick(logger.spinnerInterval);
                clearInterval(spinner.timer);
                stub.restore();
                expect(updateLogSpy.calledOnce).to.be.true;
                expect(updateLogSpy.calledWith('[Mocha]: \\ test', 1)).to.be.true;
                expect(updateLogSpy.calledAfter(logSpy)).to.be.true;
                expect(logSpy.calledOnce).to.be.true;
                expect(logSpy.calledWith('test', 'Mocha')).to.be.true;
                expect(stub.calledWith('\u001B[?25l')).to.be.true;
              });

            it('after the message',
              function () {
                process.stdout.isTTY = true;
                logger.showSpinnerInFront = false;
                const stub = sandbox.stub(process.stdout, 'write');
                const logSpy = sandbox.spy(logger, 'log');
                const updateLogSpy = sandbox.spy(logger, 'updateLog');
                const spinner = logger.spinnerLogStart('test');
                timer.tick(logger.spinnerInterval);
                clearInterval(spinner.timer);
                stub.restore();
                expect(updateLogSpy.calledOnce).to.be.true;
                expect(updateLogSpy.calledWith('test\\ ', 1)).to.be.true;
                expect(updateLogSpy.calledAfter(logSpy)).to.be.true;
                expect(logSpy.calledOnce).to.be.true;
                expect(logSpy.calledWith('test')).to.be.true;
                expect(stub.calledWith('\u001B[?25l')).to.be.true;
              });

            it('and the \'groupId\' when provided',
              function () {
                process.stdout.isTTY = true;
                logger.showSpinnerInFront = false;
                const stub = sandbox.stub(process.stdout, 'write');
                const logSpy = sandbox.spy(logger, 'log');
                const updateLogSpy = sandbox.spy(logger, 'updateLog');
                const spinner = logger.spinnerLogStart('test', 'Mocha');
                timer.tick(logger.spinnerInterval);
                clearInterval(spinner.timer);
                stub.restore();
                expect(updateLogSpy.calledOnce).to.be.true;
                expect(updateLogSpy.calledWith('[Mocha]: test\\ ', 1)).to.be.true;
                expect(updateLogSpy.calledAfter(logSpy)).to.be.true;
                expect(logSpy.calledOnce).to.be.true;
                expect(logSpy.calledWith('test', 'Mocha')).to.be.true;
                expect(stub.calledWith('\u001B[?25l')).to.be.true;
              });

          });
        });

        context('is not TTY', function () {

          it('to not display the spinner',
            function () {
              process.stdout.isTTY = undefined;
              const stub = sandbox.stub(process.stdout, 'write');
              const logSpy = sandbox.spy(logger, 'log');
              const updateLogSpy = sandbox.spy(logger, 'updateLog');
              const spinner = logger.spinnerLogStart('test');
              timer.tick(logger.spinnerInterval);
              clearInterval(spinner.timer);
              stub.restore();
              expect(updateLogSpy.called).to.be.false;
              expect(logSpy.calledWith('test')).to.be.true;
              expect(stub.calledWith('\u001B[?25l')).to.be.false;
            });

        });

      });

    });

    context('when calling function \'spinnerLogStop\'', function () {

      context('if the terminal', function () {

        context('is TTY', function () {

          it('the spinner to be stopped',
            function () {
              process.stdout.isTTY = true;
              const stub = sandbox.stub(process.stdout, 'write');
              const updateLogSpy = sandbox.spy(logger, 'updateLog');
              const spinner = logger.spinnerLogStart('test start');
              timer.tick(logger.spinnerInterval);
              logger.spinnerLogStop(spinner, 'test end');
              stub.restore();
              expect(updateLogSpy.calledTwice).to.be.true;
              expect(updateLogSpy.secondCall.calledWith('test end', 1)).to.be.true;
              expect(stub.calledWith('\u001B[?25h')).to.be.true;
            });

          it('to display the \'groupId\' when provided',
            function () {
              process.stdout.isTTY = true;
              const stub = sandbox.stub(process.stdout, 'write');
              const updateLogSpy = sandbox.spy(logger, 'updateLog');
              const spinner = logger.spinnerLogStart('test start');
              timer.tick(logger.spinnerInterval);
              logger.spinnerLogStop(spinner, 'test end', 'Mocha');
              stub.restore();
              expect(updateLogSpy.calledTwice).to.be.true;
              expect(updateLogSpy.secondCall.calledWith('test end', 1, 'Mocha')).to.be.true;
              expect(stub.calledWith('\u001B[?25h')).to.be.true;
            });

        });

        context('is not TTY', function () {

          it('the cursor indicatior does not change',
            function () {
              process.stdout.isTTY = undefined;
              const stub = sandbox.stub(process.stdout, 'write');
              const spinner = logger.spinnerLogStart('test start');
              timer.tick(logger.spinnerInterval);
              logger.spinnerLogStop(spinner, 'test end', 'Mocha');
              stub.restore();
              expect(stub.calledWith('\u001B[?25l')).to.be.false;
              expect(stub.calledWith('\u001B[?25h')).to.be.false;
            });

        });

      });

    });

  });

});
