// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import sinon from 'sinon';
import data from '../../../test/fixtures/response.json';
import { IPackageDependencies, IResolverOptions } from '../../src/interfaces';
import { RegistryManager, VersionResolver } from '../../src/services';

describe.skip('SemVer \'Less Than\' Range (<): tests', function () {

  const packageName = '@types/node';

  let sandbox: sinon.SinonSandbox;
  let options: IResolverOptions;
  let resolver: VersionResolver;
  let registryManager: RegistryManager;
  let packageJson: IPackageDependencies;

  beforeEach(function () {
    sandbox = sinon.createSandbox();
    options = { keepRange: true, strategy: 'semver' };
    resolver = new VersionResolver(options, registryManager);
    registryManager = new RegistryManager('http://fakeRegistry.yz');
    packageJson = { dependencies: { '@types/node': '^8.0.0' } };
    sandbox.stub(registryManager, 'getPackageInfo').resolves(data);
  });

  afterEach(function () {
    packageJson = null;
    resolver = null;
    options = null;
    registryManager = null;
    sandbox.restore();
  });

  context(' < /', function () {

    it('',
      async function () {
        packageJson.dependencies[packageName] = '<9';
        const result = await resolver.resolve(packageJson);
        expect(result.dependencies[packageName]).to.be.equal('^8.9.4');
      });

    it('',
      async function () {
        packageJson.dependencies[packageName] = '<8.9';
        const result = await resolver.resolve(packageJson);
        expect(result.dependencies[packageName]).to.be.equal('>=8.2.2 <8.9.0');
      });

    it('',
      async function () {
        packageJson.dependencies[packageName] = '<8.x';
        const result = await resolver.resolve(packageJson);
        expect(result.dependencies[packageName]).to.be.equal('^7.5.2');
      });

    it('',
      async function () {
        packageJson.dependencies[packageName] = '<8.0.3';
        const result = await resolver.resolve(packageJson);
        expect(result.dependencies[packageName]).to.be.equal('8.0.2');
      });

    it('',
      async function () {
        packageJson.dependencies[packageName] = '<8.1.x';
        const result = await resolver.resolve(packageJson);
        expect(result.dependencies[packageName]).to.be.equal('8.0.3');
      });

  });

});
