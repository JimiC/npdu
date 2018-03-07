// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import https from 'https';
import sinon from 'sinon';
import { PassThrough } from 'stream';
import { Logger, RegistryManager } from '../../src/services';

class FakeIncomingMessage extends PassThrough {
  public headers: { [key: string]: any } = { 'content-type': 'application/json' };
  public statusCode: number = 200;
  public statusMessage: string = 'OK';
  constructor(body) {
    super();
    this.write(body);
    this.end();
  }
}

describe('RegistryManager: tests', function () {

  let sandbox: sinon.SinonSandbox;
  let manager: RegistryManager;
  let data: any;

  before(function () {
    data = {
      'dist-tags': { latest: '9.4.6' },
      'versions': { '8.9.2': {}, '8.9.3': {}, '8.9.4': {} },
    };
  });

  after(function () {
    data = null;
  });

  beforeEach(function () {
    sandbox = sinon.createSandbox();
    manager = new RegistryManager('https://some.registry.yz');
  });

  afterEach(function () {
    manager = null;
    sandbox.restore();
  });

  context('expects', function () {

    it('to correctly implement BaseRegistryManager',
      function () {
        expect(manager).to.have.deep.property('constructor');
        expect(manager).to.have.deep.property('urlEncode');
        expect(manager).to.have.deep.property('getPackageInfo');
      });

    it('to correctly url encode the package name',
      function () {
        expect(manager.urlEncode('npdu')).to.equal('npdu');
        expect(manager.urlEncode('@types/node')).to.equal('@types%2Fnode');
      });

    it('to throw an Error when the provide uri is invalid',
      async function () {
        manager = new RegistryManager('invalidUri');
        try {
          await manager.getPackageInfo('package');
        } catch (err) {
          expect(err).to.be.an.instanceof(Error);
        }
      });

    context('function \'getPackageInfo\'', function () {

      let request: sinon.SinonStub;

      beforeEach(function () {
        request = sandbox.stub(https, 'get').returns(new PassThrough());
      });

      afterEach(function () {
        request.restore();
      });

      it('to log a message when a Logger is provided',
        async function () {
          const logger = sandbox.createStubInstance(Logger);
          request.yields(new FakeIncomingMessage(JSON.stringify(data)));
          manager = new RegistryManager('https://some.registry.yz', logger);
          await manager.getPackageInfo('@types/node');
          const stub: sinon.SinonStub = logger.updateLog;
          expect(stub.called).to.be.true;
        });

      it('to get the package info from the registry (JSON)',
        async function () {
          request.yields(new FakeIncomingMessage(JSON.stringify(data)));
          const result = await manager.getPackageInfo('@types/node');
          expect(request.calledOnce).to.be.true;
          expect(result).to.deep.equal(data);
        });

      it('to get the package info from the registry (Buffer)',
        async function () {
          request.yields(new FakeIncomingMessage(Buffer.from(JSON.stringify(data))));
          const result = await manager.getPackageInfo('@types/node');
          expect(request.calledOnce).to.be.true;
          expect(result).to.deep.equal(data);
        });

      context('to throw an Error', function () {

        it('if the request fails',
          function (done) {
            const req = new PassThrough();
            request.returns(req);
            manager.getPackageInfo('@types/node')
              .catch(err => {
                expect(err).to.be.an.instanceof(Error);
                expect(err).to.match(/Network Issues/);
                done();
              });
            req.emit('error', new Error('Network Issues'));
          });

        it('if the response fails',
          function (done) {
            const response = new FakeIncomingMessage('');
            request.yields(response);
            manager.getPackageInfo('@types/node')
              .catch(err => {
                expect(err).to.be.an.instanceof(Error);
                expect(err).to.match(/Stream Reading Issues/);
                done();
              });
            response.emit('error', new Error('Stream Reading Issues'));
          });

        it('if the response is not OK',
          async function () {
            const response = new FakeIncomingMessage('');
            response.statusCode = 404;
            response.statusMessage = 'Not Found';
            request.yields(response);
            try {
              await manager.getPackageInfo('@types/node');
            } catch (err) {
              expect(err).to.be.an.instanceof(Error);
              expect(err).to.match(/Not Found/);
            }
          });

        it('if no response is received',
          async function () {
            request.yields(null);
            try {
              await manager.getPackageInfo('@types/node');
            } catch (err) {
              expect(err).to.be.an.instanceof(Error);
              expect(err).to.match(/No response received/);
            }
          });

        it('if the response is not a JSON',
          async function () {
            const response = new FakeIncomingMessage('test');
            response.headers['content-type'] = 'text/plain';
            request.yields(response);
            try {
              await manager.getPackageInfo('@types/node');
            } catch (err) {
              expect(err).to.be.an.instanceof(Error);
              expect(err).to.match(/Registry returned incompatible data/);
            }
          });

      });

    });

  });

});
