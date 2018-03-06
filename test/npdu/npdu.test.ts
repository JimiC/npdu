// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import sinon from 'sinon';
import { IParsedArgs } from '../../src/interfaces';
import npdu from '../../src/npdu';
import {
  Logger,
  PackageFileManager,
  RegistryManager,
  VersionResolver,
  YargsParser,
} from '../../src/services';

describe('CLI: tests', function () {

  let sandbox: sinon.SinonSandbox;
  let pargs: IParsedArgs;
  let vrStub: sinon.SinonStub;

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
    sandbox.stub(YargsParser.prototype, 'parse').returns(pargs);
    sandbox.stub(RegistryManager.prototype, 'getPackageInfo');
    sandbox.stub(PackageFileManager.prototype, 'getDependencies');
    sandbox.stub(PackageFileManager.prototype, 'persist');
    vrStub = sandbox.stub(VersionResolver.prototype, 'resolve');
  });

  afterEach(function () {
    pargs = null;
    sandbox.restore();
  });

  context('expects', function () {

    it('to log process messages',
      async function () {
        const consoleLogStub = sandbox.stub(console, 'log');
        const stdoutStub = sandbox.stub(process.stdout, 'write');
        const spinnerLogStartSpy = sandbox.spy(Logger.prototype, 'spinnerLogStart');
        const spinnerLogStopSpy = sandbox.spy(Logger.prototype, 'spinnerLogStop');
        await npdu();
        expect(spinnerLogStopSpy.calledOnce).to.be.true;
        expect(spinnerLogStopSpy.calledOnce).to.be.true;
        expect(spinnerLogStartSpy.calledBefore(spinnerLogStopSpy)).to.be.true;
        expect(spinnerLogStartSpy.calledWith('Updating dependencies')).to.be.true;
        expect(spinnerLogStopSpy.calledWith(spinnerLogStartSpy.returnValues[0], 'Dependencies updated')).to.be.true;
        stdoutStub.restore();
        consoleLogStub.restore();
      });

    it('to log informative messages',
      async function () {
        pargs.logger = true;
        const consoleLogStub = sandbox.stub(console, 'log');
        const stdoutStub = sandbox.stub(process.stdout, 'write');
        const loggerLogSpy = sandbox.spy(Logger.prototype, 'log');
        const loggerUpdateLogSpy = sandbox.spy(Logger.prototype, 'updateLog');
        await npdu();
        expect(loggerLogSpy.calledTwice).to.be.true;
        expect(loggerUpdateLogSpy.callCount).to.equal(2);
        stdoutStub.restore();
        consoleLogStub.restore();
      });

    it('to log Error messages',
      async function () {
        vrStub.throws(new Error());
        const consoleLogStub = sandbox.stub(console, 'log');
        const stdoutStub = sandbox.stub(process.stdout, 'write');
        const loggerSpinnerLogStopSpy = sandbox.spy(Logger.prototype, 'spinnerLogStop');
        const loggerUpdateLogSpy = sandbox.spy(Logger.prototype, 'updateLog');
        await npdu();
        expect(loggerSpinnerLogStopSpy.calledOnce).to.be.true;
        expect(loggerUpdateLogSpy.calledTwice).to.be.true;
        expect(loggerUpdateLogSpy.secondCall.calledWithMatch('Error: ')).to.be.true;
        stdoutStub.restore();
        consoleLogStub.restore();
      });
  });

});
