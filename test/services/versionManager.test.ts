// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import sinon from 'sinon';
import { VersionResolver } from '../../src/services';

describe('VersionResolver: tests', function () {

  let resolver: VersionResolver;
  let sandbox: sinon.SinonSandbox;

  beforeEach(function () {
    resolver = sinon.createStubInstance(VersionResolver);
    sandbox = sinon.createSandbox();
  });

  afterEach(function () {
    resolver = null;
    sandbox.restore();
  });

  context('expects', function () {

    it('to correctly implement BaseVersionResolver',
      function () {
        expect(resolver).to.have.deep.property('constructor');
        expect(resolver).to.have.deep.property('resolve');
      });

  });

});
