// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import sinon from 'sinon';
import { Logger, YargsParser } from '../../src/services';
import { validUrlRegEx } from '../../src/utils';

describe('YargsParser: tests', function () {

  let sandbox: sinon.SinonSandbox;
  let argv: sinon.SinonStub;
  let parser: YargsParser;

  beforeEach(function () {
    sandbox = sinon.createSandbox();
    argv = sandbox.stub(process, 'argv');
    parser = new YargsParser();
  });

  afterEach(function () {
    parser = null;
    sandbox.restore();
  });

  context('expects', function () {

    it('the returned parsed arguments object to have the correct properties',
      function () {
        argv.value(['node', 'npdu', 'all']);
        const sut = parser.parse();
        expect(sut).to.be.an('object');
        expect(sut).to.be.haveOwnProperty('command');
        expect(sut).to.be.haveOwnProperty('filePath');
        expect(sut).to.be.haveOwnProperty('keepRange');
        expect(sut).to.be.haveOwnProperty('logger');
        expect(sut).to.be.haveOwnProperty('strategy');
        expect(sut).to.be.haveOwnProperty('registry');
      });

    it('that the \'command\' gets parsed correctly',
      function () {
        const args = ['node', 'npdu', 'all'];
        argv.value(args);
        expect(parser.parse()).to.be.have.property('command', args[2]);
      });

    it('that the \'filePath\' option gets parsed correctly',
      function () {
        const args = ['node', 'npdu', 'all', '-f', '.'];
        argv.value(args);
        expect(parser.parse()).to.be.have.property('filePath', args[4]);
      });

    it('that the \'keepRange\' option gets parsed correctly',
      function () {
        const args = ['node', 'npdu', 'all', '-k', 'false'];
        argv.value(args);
        expect(parser.parse()).to.be.have.property('keepRange', args[4] === 'true');
      });

    it('that the \'logger\' option gets parsed correctly',
      function () {
        const args = ['node', 'npdu', 'all', '-l', 'false'];
        argv.value(args);
        expect(parser.parse()).to.be.have.property('logger', args[4] === 'true');
      });

    it('that the \'strategy\' option gets parsed correctly',
      function () {
        const args = ['node', 'npdu', 'all', '-s', 'latest'];
        argv.value(args);
        expect(parser.parse()).to.be.have.property('strategy', args[4]);
      });

    context('that the \'registry\' option', function () {

      it('gets parsed correctly',
        function () {
          const consoleLogStub = sandbox.stub(console, 'log');
          const stdoutStub = sandbox.stub(process.stdout, 'write');
          const args = ['node', 'npdu', 'all', '-r', 'http://myregistry.yz'];
          argv.value(args);
          expect(parser.parse()).to.be.have.property('registry', args[4]);
          stdoutStub.restore();
          consoleLogStub.restore();
        });

      it('supports valid URL',
        function () {
          const consoleLogStub = sandbox.stub(console, 'log');
          const stdoutStub = sandbox.stub(process.stdout, 'write');
          argv.value(['node', 'npdu', 'all', '-r', 'https://my.registry.yz']);
          expect(parser.parse().registry).to.match(validUrlRegEx);
          argv.value(['node', 'npdu', 'prod', '-r', 'http://myregistry.yz']);
          expect(parser.parse().registry).to.match(validUrlRegEx);
          stdoutStub.restore();
          consoleLogStub.restore();
        });

      it('throws an Error on invalid URL',
        function () {
          const consoleErrorStub = sandbox.stub(console, 'error');
          const stderrStub = sandbox.stub(process.stderr, 'write');
          const exitStub = sandbox.stub(process, 'exit');
          argv.value(['node', 'npdu', 'all', '-r', '//my.registry.yz']);
          parser.parse();
          expect(consoleErrorStub.called).to.be.true;
          expect(exitStub.called).to.be.true;
          stderrStub.restore();
          consoleErrorStub.restore();
          exitStub.restore();
        });

    });

    it('to throw an Error on invalid file path',
      function () {
        const consoleErrorStub = sandbox.stub(console, 'error');
        const stderrStub = sandbox.stub(process.stderr, 'write');
        const exitStub = sandbox.stub(process, 'exit');
        argv.value(['node', 'npdu', 'all', '-f', 'file.io']);
        parser.parse();
        expect(consoleErrorStub.called).to.be.true;
        expect(exitStub.called).to.be.true;
        stderrStub.restore();
        consoleErrorStub.restore();
        exitStub.restore();
      });

    context('when a Logger is provided', function () {

      let logger: any;

      beforeEach(function () {
        logger = sandbox.createStubInstance(Logger);
        parser = new YargsParser(logger);
      });

      afterEach(function () {
        parser = null;
      });

      it('it logs a message for the provided registry',
        function () {
          const consoleLogStub = sandbox.stub(console, 'log');
          const stdoutStub = sandbox.stub(process.stdout, 'write');
          argv.value(['node', 'npdu', 'all', '-r', 'http://some.registry.org']);
          parser.parse();
          const stub: sinon.SinonStub = logger.log;
          expect(stub.calledWith('Using provided registry: \'http://some.registry.org\'')).to.be.true;
          stdoutStub.restore();
          consoleLogStub.restore();
        });

      it('it logs the Error messages to the terminal',
        function () {
          const consoleErrorStub = sandbox.stub(console, 'error');
          const stderrStub = sandbox.stub(process.stderr, 'write');
          const exitStub = sandbox.stub(process, 'exit');
          argv.value(['node', 'npdu', 'all', '-f', 'file.io']);
          parser.parse();
          const stub: sinon.SinonStub = logger.error;
          expect(stub.called).to.be.true;
          stderrStub.restore();
          consoleErrorStub.restore();
          exitStub.restore();
        });

    });

  });

});
