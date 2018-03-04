// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
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

      it('displays the \'groupId\' if provided',
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

      it('displays the \'groupId\' if provided',
      function () {
        const stub = sandbox.stub(process.stderr, 'write');
        logger.error('test', 'Mocha');
        stub.restore();
        expect(stub.calledWith('[Mocha]: test\n')).to.be.true;
      });

    });

    // context('when calling function \'updateLog\'', function () {

    //   it('',
    //     function () {
    //     });

    //   it('',
    //     function () {
    //     });

    // });

    // it('',
    //  function () {

    // });

  });

});
