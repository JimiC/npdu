// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import sinon from 'sinon';
import data from '../../../test/fixtures/response.json';
import { IPackageDependencies, IResolverOptions } from '../../src/interfaces';
import { RegistryManager, VersionResolver } from '../../src/services';

describe.skip('SemVer \'Hyphen\' Range (-): tests', function () {

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

  context(' - ', function () {

    it('',
      async function () {
        packageJson.dependencies[packageName] = '7 - 8';
        const result = await resolver.resolve(packageJson);
        expect(result.dependencies[packageName]).to.be.equal('');
      });

    it('',
      async function () {
        packageJson.dependencies[packageName] = '7 - 9';
        const result = await resolver.resolve(packageJson);
        expect(result.dependencies[packageName]).to.be.equal('^9.4.6');
      });

    it('',
      async function () {
        packageJson.dependencies[packageName] = '7.2 - 8';
        const result = await resolver.resolve(packageJson);
        expect(result.dependencies[packageName]).to.be.equal('');
      });

    it('',
      async function () {
        packageJson.dependencies[packageName] = '7.2 - 9';
        const result = await resolver.resolve(packageJson);
        expect(result.dependencies[packageName]).to.be.equal('^9.4.6');
      });

    it('',
      async function () {
        packageJson.dependencies[packageName] = '7.x - 8';
        const result = await resolver.resolve(packageJson);
        expect(result.dependencies[packageName]).to.be.equal('');
      });

    it('',
      async function () {
        packageJson.dependencies[packageName] = '7.x - 9';
        const result = await resolver.resolve(packageJson);
        expect(result.dependencies[packageName]).to.be.equal('^9.4.6');
      });

    it('',
      async function () {
        packageJson.dependencies[packageName] = '7.2.1 - 8';
        const result = await resolver.resolve(packageJson);
        expect(result.dependencies[packageName]).to.be.equal('');
      });

    it('',
      async function () {
        packageJson.dependencies[packageName] = '7.2.1 - 9';
        const result = await resolver.resolve(packageJson);
        expect(result.dependencies[packageName]).to.be.equal('^9.4.6');
      });

    it('',
      async function () {
        packageJson.dependencies[packageName] = '7.2.x - 8';
        const result = await resolver.resolve(packageJson);
        expect(result.dependencies[packageName]).to.be.equal('');
      });

    it('',
      async function () {
        packageJson.dependencies[packageName] = '7.2.x - 9';
        const result = await resolver.resolve(packageJson);
        expect(result.dependencies[packageName]).to.be.equal('^9.4.6');
      });

  });

});
