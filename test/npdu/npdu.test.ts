// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import { EventEmitter } from 'events';
import readline from 'readline';
import * as sinon from 'sinon';
import { IParsedArgs } from '../../src/interfaces';
import npdu from '../../src/npdu';
import {
  Logger,
  PackageFileManager,
  RegistryManager,
  VersionResolver,
  YargsParser,
} from '../../src/services';

describe('NPDU: tests', function () {

  let sandbox: sinon.SinonSandbox;
  let pargs: IParsedArgs;
  let ypParseStub: sinon.SinonStub;
  let pfmGetDepepndenciesStub: sinon.SinonStub;
  let pfmPersistStub: sinon.SinonStub;
  let vrResolveStub: sinon.SinonStub;

  beforeEach(function () {
    pargs = {
      command: 'all',
      filePath: './package.json',
      keepRange: true,
      logger: false,
      registry: 'https://registry.npmjs.org',
      strategy: 'semver',
    };
    sandbox = sinon.createSandbox();
    ypParseStub = sandbox.stub(YargsParser.prototype, 'parse').returns(pargs);
    sandbox.stub(RegistryManager.prototype, 'getPackageInfo');
    pfmGetDepepndenciesStub = sandbox.stub(PackageFileManager.prototype, 'getDependencies');
    pfmPersistStub = sandbox.stub(PackageFileManager.prototype, 'persist');
    vrResolveStub = sandbox.stub(VersionResolver.prototype, 'resolve');
    process.stdout.setMaxListeners(Infinity);
    process.stdin.setMaxListeners(Infinity);
  });

  afterEach(function () {
    pargs = null;
    sandbox.restore();
  });

  context('expects', function () {

    context('to log', function () {

      it('process messages',
        async function () {
          const exitStub = sandbox.stub(process, 'exit');
          const consoleLogStub = sandbox.stub(console, 'log');
          const stdoutStub = sandbox.stub(process.stdout, 'write');
          const spinnerLogStartSpy = sandbox.spy(Logger.prototype, 'spinnerLogStart');
          const spinnerLogStopSpy = sandbox.spy(Logger.prototype, 'spinnerLogStop');
          await npdu();
          stdoutStub.restore();
          consoleLogStub.restore();
          exitStub.restore();
          expect(spinnerLogStopSpy.calledOnce).to.be.true;
          expect(spinnerLogStopSpy.calledOnce).to.be.true;
          expect(spinnerLogStartSpy.calledBefore(spinnerLogStopSpy)).to.be.true;
          expect(spinnerLogStartSpy.calledWith('Updating dependencies')).to.be.true;
          expect(spinnerLogStopSpy.calledWith(spinnerLogStartSpy.returnValues[0], 'Dependencies updated')).to.be.true;
        });

      it('informative messages',
        async function () {
          pargs.logger = true;
          const exitStub = sandbox.stub(process, 'exit');
          const consoleLogStub = sandbox.stub(console, 'log');
          const stdoutStub = sandbox.stub(process.stdout, 'write');
          const loggerLogSpy = sandbox.spy(Logger.prototype, 'log');
          const loggerUpdateLogSpy = sandbox.spy(Logger.prototype, 'updateLog');
          await npdu();
          stdoutStub.restore();
          consoleLogStub.restore();
          exitStub.restore();
          expect(loggerLogSpy.calledTwice).to.be.true;
          expect(loggerUpdateLogSpy.callCount).to.equal(2);
        });

      it('Error messages',
        async function () {
          vrResolveStub.throws(new Error());
          const exitStub = sandbox.stub(process, 'exit');
          const consoleLogStub = sandbox.stub(console, 'log');
          const stdoutStub = sandbox.stub(process.stdout, 'write');
          const loggerSpinnerLogStopSpy = sandbox.spy(Logger.prototype, 'spinnerLogStop');
          const loggerUpdateLogSpy = sandbox.spy(Logger.prototype, 'updateLog');
          await npdu();
          stdoutStub.restore();
          consoleLogStub.restore();
          exitStub.restore();
          expect(loggerSpinnerLogStopSpy.calledOnce).to.be.true;
          expect(loggerUpdateLogSpy.callCount).to.equal(2);
          expect(loggerUpdateLogSpy.secondCall.calledWithMatch(/Error: /)).to.be.true;
        });

    });

    context('to call', function () {

      it('the YargsParser \'parse\' function',
        async function () {
          const exitStub = sandbox.stub(process, 'exit');
          const consoleLogStub = sandbox.stub(console, 'log');
          const stdoutStub = sandbox.stub(process.stdout, 'write');
          await npdu();
          stdoutStub.restore();
          consoleLogStub.restore();
          exitStub.restore();
          expect(ypParseStub.calledOnce).to.be.true;
        });

      it('the PackageFileManager \'getDepepndencies\' function',
        async function () {
          const exitStub = sandbox.stub(process, 'exit');
          const consoleLogStub = sandbox.stub(console, 'log');
          const stdoutStub = sandbox.stub(process.stdout, 'write');
          await npdu();
          stdoutStub.restore();
          consoleLogStub.restore();
          exitStub.restore();
          expect(pfmGetDepepndenciesStub.calledOnce).to.be.true;
        });

      it('the PackageFileManager \'persist\' function',
        async function () {
          const exitStub = sandbox.stub(process, 'exit');
          const consoleLogStub = sandbox.stub(console, 'log');
          const stdoutStub = sandbox.stub(process.stdout, 'write');
          await npdu();
          stdoutStub.restore();
          consoleLogStub.restore();
          exitStub.restore();
          expect(pfmPersistStub.calledOnce).to.be.true;
        });

      it('the VersionResolver \'resolve\' function',
        async function () {
          const exitStub = sandbox.stub(process, 'exit');
          const consoleLogStub = sandbox.stub(console, 'log');
          const stdoutStub = sandbox.stub(process.stdout, 'write');
          await npdu();
          stdoutStub.restore();
          consoleLogStub.restore();
          exitStub.restore();
          expect(vrResolveStub.calledOnce).to.be.true;
        });

    });

    context('when signaled to exit', function () {

      it('to call \'handleForcedExit\'',
        function () {
          const exitStub = sandbox.stub(process, 'exit');
          const consoleLogStub = sandbox.stub(console, 'log');
          const stdoutStub = sandbox.stub(process.stdout, 'write');
          const handleForcedExitStub = sandbox.stub(Logger.prototype, 'handleForcedExit');
          const emitter = new EventEmitter();
          sandbox.stub(readline, 'createInterface').returns(emitter);
          const promise = npdu().then(() => {
            consoleLogStub.restore();
            stdoutStub.restore();
            exitStub.restore();
            expect(handleForcedExitStub.called).to.be.true;
          });
          emitter.emit('SIGINT');
          return promise;
        });

    });

  });

});
