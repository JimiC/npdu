// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import semver from 'semver';
import sinon from 'sinon';
import data from '../../../test/fixtures/response.json';
import { IPackageDependencies, IResolverOptions } from '../../src/interfaces';
import { Logger, RegistryManager, VersionResolver } from '../../src/services';

describe('VersionResolver: tests', function () {

  const packageName = '@types/node';

  let sandbox: sinon.SinonSandbox;
  let options: IResolverOptions;
  let resolver: VersionResolver;
  let registryManager: RegistryManager;
  let packageJson: IPackageDependencies;
  let registryManagerStub: sinon.SinonStub;

  beforeEach(function () {
    sandbox = sinon.createSandbox();
    options = { keepRange: true, strategy: 'something' };
    resolver = sinon.createStubInstance(VersionResolver);
    registryManager = new RegistryManager('http://fakeRegistry.yz');
    packageJson = { dependencies: { '@types/node': '^8.0.0' } };
    registryManagerStub = sandbox.stub(registryManager, 'getPackageInfo').resolves(data);
  });

  afterEach(function () {
    packageJson = null;
    resolver = null;
    options = null;
    registryManager = null;
    sandbox.restore();
  });

  context('expects', function () {

    it('to correctly implement BaseVersionResolver',
      function () {
        expect(resolver).to.have.deep.property('constructor');
        expect(resolver).to.have.deep.property('resolve');
      });

    context('function \'resolve\'', function () {

      beforeEach(function () {
        resolver = new VersionResolver(options, registryManager);
      });

      afterEach(function () {
        resolver = null;
      });

      it('to throw an Error when provided strategy is not supported',
        async function () {
          try {
            await resolver.resolve(packageJson);
          } catch (err) {
            expect(err).to.be.an.instanceof(Error);
            expect(err).to.match(/Not Implemented/);
          }
        });

      context('when a Logger is provided', function () {

        context('to log a message about', function () {

          let logger: any;

          beforeEach(function () {
            options.strategy = 'semver';
            logger = sandbox.createStubInstance(Logger);
            resolver = new VersionResolver(options, registryManager, logger);
          });

          afterEach(function () {
            options.strategy = '';
            logger = null;
            resolver = null;
          });

          it('resolving the package version',
            async function () {
              const stub: sinon.SinonStub = logger.updateLog;
              await resolver.resolve(packageJson);
              expect(stub.calledWithMatch(`Resolving version of package: '${packageName}'`)).to.be.true;
            });

          it('finding a new package version',
            async function () {
              const stub: sinon.SinonStub = logger.updateLog;
              const msg = `Found new version: '8.9.4' for package: '${packageName}'`;
              await resolver.resolve(packageJson);
              expect(stub.calledWithMatch(msg)).to.be.true;
            });

          it('the package version being up-to-date',
            async function () {
              packageJson.dependencies[packageName] = '^8.9.4';
              const stub: sinon.SinonStub = logger.updateLog;
              const msg = `Package: '${packageName}' is already up-to-date (${options.strategy})`;
              await resolver.resolve(packageJson);
              expect(stub.calledWithMatch(msg)).to.be.true;
            });

          it('being unable to get the package info',
            async function () {
              registryManagerStub.resolves(null);
              const stub: sinon.SinonStub = logger.updateLog;
              const msg = `Unable to get package info of '${packageName}' from registry`;
              await resolver.resolve(packageJson);
              expect(stub.calledWithMatch(msg)).to.be.true;
            });

        });

      });

      context('when strategy is \'semver\'', function () {

        beforeEach(function () {
          options.strategy = 'semver';
        });

        afterEach(function () {
          options = null;
        });

        it('to not change the version when version is not valid',
          async function () {
            packageJson.dependencies[packageName] = 'a.b.c';
            registryManagerStub.resolves(null);
            const result = await resolver.resolve(packageJson);
            expect(result.dependencies[packageName]).to.be.equal('a.b.c');
          });

        it('to not change the version when unable to get the package info',
          async function () {
            registryManagerStub.resolves(null);
            const result = await resolver.resolve(packageJson);
            expect(result.dependencies[packageName]).to.be.equal('^8.0.0');
          });

        it('to return the current version when \'versions\' info is absent',
          async function () {
            const response = JSON.parse(JSON.stringify(data));
            delete response.versions;
            registryManagerStub.resolves(response);
            const result = await resolver.resolve(packageJson);
            expect(response.versions).to.be.undefined;
            expect(result.dependencies[packageName]).to.be.equal('^8.0.0');
          });

        it('to keep the semver range when said option is \'true\'',
          async function () {
            packageJson.dependencies[packageName] = '>=8.0.0';
            const range = new semver.Range(packageJson.dependencies[packageName]);
            const result = await resolver.resolve(packageJson);
            const resultRange = new semver.Range(result.dependencies[packageName]);
            expect(range.set[0][0].operator).to.be.equal(resultRange.set[0][0].operator);
          });

        it('to not keep the semver range when said option is \'false\'',
          async function () {
            options.keepRange = false;
            const range = new semver.Range(packageJson.dependencies[packageName]);
            const result = await resolver.resolve(packageJson);
            const resultRange = new semver.Range(result.dependencies[packageName]);
            expect(range.set[0][0].operator).to.not.be.equal(resultRange.set[0][0].operator);
          });

        it('to return the current version when \'versions\' info is absent'
          + ' without the range when said option is \'false\'',
          async function () {
            options.keepRange = false;
            const response = JSON.parse(JSON.stringify(data));
            delete response.versions;
            registryManagerStub.resolves(response);
            const range = new semver.Range(packageJson.dependencies[packageName]);
            const result = await resolver.resolve(packageJson);
            const resultRange = new semver.Range(result.dependencies[packageName]);
            expect(response.versions).to.be.undefined;
            expect(range.set[0][0].operator).to.not.be.equal(resultRange.set[0][0].operator);
          });

        context('to resolve to', function () {

          it('the current version when new version does not satisfies semver',
            async function () {
              packageJson.dependencies[packageName] = '^6.0.200';
              const result = await resolver.resolve(packageJson);
              expect(result.dependencies[packageName]).to.be.equal('^6.0.200');
            });

          it('the maximum semver version when new version satisfies semver',
            async function () {
              const result = await resolver.resolve(packageJson);
              expect(result.dependencies[packageName]).to.be.equal('^8.9.4');
            });

        });

      });

      context('when strategy is \'latest\'', function () {

        beforeEach(function () {
          options.strategy = 'latest';
        });

        afterEach(function () {
          options = null;
        });

        it('the latest version when \'versions\' info is absent',
          async function () {
            const response = JSON.parse(JSON.stringify(data));
            delete response.versions;
            registryManagerStub.resolves(response);
            const result = await resolver.resolve(packageJson);
            expect(response.versions).to.be.undefined;
            expect(result.dependencies[packageName]).to.be.equal('^9.4.6');
          });

        it('to keep the semver range',
          async function () {
            packageJson.dependencies[packageName] = '>=8.0.0';
            const result = await resolver.resolve(packageJson);
            expect(result.dependencies[packageName]).to.be.equal('>=9.4.6');
          });

        it('to not keep the semver range',
          async function () {
            options.keepRange = false;
            const result = await resolver.resolve(packageJson);
            expect(result.dependencies[packageName]).to.be.equal('9.4.6');
          });

        context('to resolve to', function () {

          it('the latest version',
            async function () {
              packageJson.dependencies[packageName] = '^6.0.0';
              const result = await resolver.resolve(packageJson);
              expect(result.dependencies[packageName]).to.be.equal('^9.4.6');
            });

          it('the current version when \'dist-tags\' info is absent',
            async function () {
              const response = JSON.parse(JSON.stringify(data));
              delete response['dist-tags'];
              registryManagerStub.resolves(response);
              packageJson.dependencies[packageName] = '^6.0.0';
              const result = await resolver.resolve(packageJson);
              expect(response['dist-tags']).to.be.undefined;
              expect(result.dependencies[packageName]).to.be.equal('^6.0.0');
            });

        });

      });

    });

  });

});
