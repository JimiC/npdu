// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import sinon from 'sinon';
import { PackageFileManager } from '../../src/services';

describe('PackageFileManager: tests', function () {

  let manager: PackageFileManager;
  let sandbox: sinon.SinonSandbox;

  beforeEach(function () {
    manager = sinon.createStubInstance(PackageFileManager);
    sandbox = sinon.createSandbox();
  });

  afterEach(function () {
    manager = null;
    sandbox.restore();
  });

  context('expects', function () {

    it('to correctly implement BasePackageFileManager',
      function () {
        expect(manager).to.have.deep.property('constructor');
        expect(manager).to.have.deep.property('getDependencies');
        expect(manager).to.have.deep.property('persist');
      });

  });

});
