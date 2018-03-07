// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import sinon from 'sinon';
import { INodePackage, IPackageDependencies, IResolverOptions } from '../../src/interfaces';
import { Logger, RegistryManager, VersionResolver } from '../../src/services';

describe('VersionResolver: tests', function () {

  const packageName = '@types/node';

  let sandbox: sinon.SinonSandbox;
  let options: IResolverOptions;
  let resolver: VersionResolver;
  let registryManager: RegistryManager;
  let packageJson: IPackageDependencies;
  let data: INodePackage;

  beforeEach(function () {
    sandbox = sinon.createSandbox();
    options = { keepRange: true, strategy: 'something' };
    resolver = sinon.createStubInstance(VersionResolver);
    registryManager = new RegistryManager('http://fakeRegistry.yz');
    packageJson = { dependencies: { '@types/node': '^8.0.0' } };
    data = {
      'dist-tags': { latest: '9.4.6' },
      'versions': {
        '8.9.2': { name: `${packageName}` },
        '8.9.3': { name: `${packageName}` },
        '8.9.4': { name: `${packageName}` },
      },
    };
    sandbox.stub(registryManager, 'getPackageInfo').resolves(data);
  });

  afterEach(function () {
    packageJson = null;
    data = null;
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

      it('to not change the version when unable to get the package info',
        async function () {
          delete data['dist-tags'];
          delete data.versions;
          const result = await resolver.resolve(packageJson);
          expect(data['dist-tags']).to.be.undefined;
          expect(data.versions).to.be.undefined;
          expect(result.dependencies[packageName]).to.be.equal('^8.0.0');
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

        context('to log a message about ', function () {

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
              await resolver.resolve(packageJson);
              const stub: sinon.SinonStub = logger.updateLog;
              expect(stub.calledWithMatch(`Resolving version of package: '${packageName}'`)).to.be.true;
            });

          it('founding a new package version',
            async function () {
              await resolver.resolve(packageJson);
              const stub: sinon.SinonStub = logger.updateLog;
              const msg = `Found new version: '^8.9.4' for package: '${packageName}'`;
              expect(stub.calledWithMatch(msg)).to.be.true;
            });

          it('the package version being up-to-date',
            async function () {
              packageJson.dependencies[packageName] = '^8.9.4';
              await resolver.resolve(packageJson);
              const stub: sinon.SinonStub = logger.updateLog;
              const msg = `Package: '${packageName}' is already up-to-date (${options.strategy})`;
              expect(stub.calledWithMatch(msg)).to.be.true;
            });

          it('being unable to get the package info',
            async function () {
              delete data['dist-tags'];
              delete data.versions;
              await resolver.resolve(packageJson);
              const stub: sinon.SinonStub = logger.updateLog;
              const msg = `Unable to get package info of '${packageName}' from registry`;
              expect(data['dist-tags']).to.be.undefined;
              expect(data.versions).to.be.undefined;
              expect(stub.calledWithMatch(msg)).to.be.true;
            });

        });

      });

      context('when startegy is \'semver\'', function () {

        beforeEach(function () {
          options.strategy = 'semver';
        });

        afterEach(function () {
          options = null;
        });

        it('the current version when \'versions\' info is absent',
          async function () {
            delete data.versions;
            const result = await resolver.resolve(packageJson);
            expect(data.versions).to.be.undefined;
            expect(result.dependencies[packageName]).to.be.equal('^8.0.0');
          });

        it('to keep the semver range',
          async function () {
            packageJson.dependencies[packageName] = '>=8.0.0';
            const result = await resolver.resolve(packageJson);
            expect(result.dependencies[packageName]).to.be.equal('>=8.9.4');
          });

        it('to not keep the semver range',
          async function () {
            options.keepRange = false;
            const result = await resolver.resolve(packageJson);
            expect(result.dependencies[packageName]).to.be.equal('8.9.4');
          });

        context('to resolve to', function () {

          it('the current version when new version does not satisfies semver',
            async function () {
              packageJson.dependencies[packageName] = '^6.0.0';
              const result = await resolver.resolve(packageJson);
              expect(result.dependencies[packageName]).to.be.equal('^6.0.0');
            });

          it('the maximum semver version when new version satisfies semver',
            async function () {
              const result = await resolver.resolve(packageJson);
              expect(result.dependencies[packageName]).to.be.equal('^8.9.4');
            });

        });

      });

      context('when startegy is \'latest\'', function () {

        beforeEach(function () {
          options.strategy = 'latest';
        });

        afterEach(function () {
          options = null;
        });

        it('the latest version when \'versions\' info is absent',
          async function () {
            delete data.versions;
            const result = await resolver.resolve(packageJson);
            expect(data.versions).to.be.undefined;
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
              delete data['dist-tags'];
              packageJson.dependencies[packageName] = '^6.0.0';
              const result = await resolver.resolve(packageJson);
              expect(result.dependencies[packageName]).to.be.equal('^6.0.0');
            });

        });

      });

    });

  });

});
