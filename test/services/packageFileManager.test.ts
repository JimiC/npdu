// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import sinon from 'sinon';
import { DependenciesFlags } from '../../src/common/enumerations';
import { Logger, PackageFileManager } from '../../src/services';
import * as utils from '../../src/utils';

describe('PackageFileManager: tests', function () {

  let sandbox: sinon.SinonSandbox;
  let manager: PackageFileManager;
  let packageJson: any;

  before(function () {
    packageJson = {
      dependencies: {
        'detect-indent': '^5.0.0',
        'semver': '^5.5.0',
      },
      devDependencies: {
        '@types/chai': '^4.1.2',
        'chai': '^4.1.2',
      },
      optionalDependencies: {},
      peerDependencies: {},
    };
  });

  after(function () {
    packageJson = null;
  });

  beforeEach(function () {
    sandbox = sinon.createSandbox();
    manager = sandbox.createStubInstance(PackageFileManager);
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

    context('function \'getDependencies\'', function () {

      it('to log a message when a Logger is provided',
        async function () {
          const logger = sandbox.createStubInstance(Logger);
          manager = new PackageFileManager('{}', logger);
          await manager.getDependencies('all');
          const stub: sinon.SinonStub = logger.updateLog;
          expect(stub.called).to.be.true;
        });

      context('to throw an Error', function () {

        it('when provided flag is unknown',
          async function () {
            try {
              manager = new PackageFileManager('{}');
              await manager.getDependencies('test');
            } catch (err) {
              expect(err).to.be.an.instanceof(Error);
              expect(err).to.match(/Not Implemented/);
            }
          });

        it('when the provided file path is not of a \'package.json\'',
          async function () {
            try {
              manager = new PackageFileManager('./package.test.json');
              await manager.getDependencies('all');
            } catch (err) {
              expect(err).to.be.an.instanceof(Error);
              expect(err).to.match(/Only \'package\.json\' files are supported/);
            }
          });

      });

      context('to read the content of a \'package.json\' file', function () {

        beforeEach(function () {
          manager = new PackageFileManager('./package.json');
        });

        afterEach(function () {
          manager = null;
        });

        it('correctly',
          async function () {
            const result = await manager.getDependencies('all');
            expect(result).to.haveOwnProperty('dependencies');
            expect(result).to.haveOwnProperty('devDependencies');
          });

        it('once',
          async function () {
            const readFileStub = sandbox.spy(utils, 'readFileAsync');
            await manager.getDependencies('optional');
            await manager.getDependencies('peer');
            expect(readFileStub.calledOnce).to.be.true;
          });

      });

      context('when passing parameter', function () {

        beforeEach(function () {
          manager = new PackageFileManager(JSON.stringify(packageJson));
        });

        afterEach(function () {
          manager = null;
        });

        it('flag \'All\' to return all dependencies',
          async function () {
            expect(await manager.getDependencies(DependenciesFlags.All))
              .to.deep.equal(packageJson);
          });

        it('string \'all\' to return all dependencies',
          async function () {
            expect(await manager.getDependencies('all'))
              .to.deep.equal(packageJson);
          });

        it('flag \'Prod\' to return production dependencies',
          async function () {
            expect(await manager.getDependencies(DependenciesFlags.Prod))
              .to.deep.equal({ dependencies: packageJson.dependencies });
          });

        it('string \'prod\' to return production dependencies',
          async function () {
            expect(await manager.getDependencies('prod'))
              .to.deep.equal({ dependencies: packageJson.dependencies });
          });

        it('flag \'Dev\' to return development dependencies',
          async function () {
            expect(await manager.getDependencies(DependenciesFlags.Dev))
              .to.deep.equal({ devDependencies: packageJson.devDependencies });
          });

        it('string \'dev\' to return development dependencies',
          async function () {
            expect(await manager.getDependencies('dev'))
              .to.deep.equal({ devDependencies: packageJson.devDependencies });
          });

        it('flag \'Peer\' to return peer dependencies',
          async function () {
            expect(await manager.getDependencies(DependenciesFlags.Peer))
              .to.deep.equal({ peerDependencies: packageJson.peerDependencies });
          });

        it('string \'peer\' to return peer dependencies',
          async function () {
            expect(await manager.getDependencies('peer'))
              .to.deep.equal({ peerDependencies: packageJson.peerDependencies });
          });

        it('flag \'Optional\' to return optional dependencies',
          async function () {
            expect(await manager.getDependencies(DependenciesFlags.Optional))
              .to.deep.equal({ optionalDependencies: packageJson.optionalDependencies });
          });

        it('string \'optional\' to return optional dependencies',
          async function () {
            expect(await manager.getDependencies('optional'))
              .to.deep.equal({ optionalDependencies: packageJson.optionalDependencies });
          });

      });

    });

    context('function \'persist\'', function () {

      context('to throw an Error', function () {

        it('if a file path is not provided at the constructor and as a parameter',
          async function () {
            manager = new PackageFileManager(JSON.stringify(packageJson));
            try {
              await manager.persist(packageJson);
            } catch (err) {
              expect(err).to.be.an.instanceof(Error);
              expect(err).to.match(/A path to the \'package\.json\' file is required/);
            }
          });

        it('if a \'getDependencies\' has not been called first',
          async function () {
            manager = new PackageFileManager('./package.json');
            try {
              await manager.persist(packageJson);
            } catch (err) {
              expect(err).to.be.an.instanceof(Error);
              expect(err).to.match(/Prior call to \'getDependencies\' is required/);
            }
          });

      });
      context('to not throw an Error', function () {

        it('if a file path is NOT provided at the constructor and provided as a parameter',
          async function () {
            const stub = sandbox.stub(utils, 'writeFileAsync').resolves();
            manager = new PackageFileManager(JSON.stringify(packageJson));
            const resolvedDependencies = await manager.getDependencies('all');
            await manager.persist(resolvedDependencies, './package.json');
            expect(stub.called).to.be.true;
          });

        it('if a file path is provided at the constructor and not as a parameter',
          async function () {
            const stub = sandbox.stub(utils, 'writeFileAsync').resolves();
            manager = new PackageFileManager('./package.json');
            const resolvedDependencies = await manager.getDependencies('all');
            await manager.persist(resolvedDependencies);
            expect(stub.called).to.be.true;
          });

      });

      it('to log a message when a Logger is provided',
        async function () {
          const logger = sandbox.createStubInstance(Logger);
          sandbox.stub(utils, 'writeFileAsync').resolves();
          manager = new PackageFileManager('./package.json', logger);
          const resolvedDependencies = await manager.getDependencies('all');
          await manager.persist(resolvedDependencies);
          const stub: sinon.SinonStub = logger.updateLog;
          expect(stub.called).to.be.true;
        });

      it('when passing a function as \'resolvedDependencies\', that function gets called',
        async function () {
          const writeFileAsyncStub = sandbox.stub(utils, 'writeFileAsync').resolves();
          const spy = sandbox.spy(() => Promise.resolve());
          manager = new PackageFileManager(JSON.stringify(packageJson));
          await manager.persist(spy);
          expect(spy.called).to.be.true;
          expect(writeFileAsyncStub.calledOnce).to.be.false;
        });

      context('to not call function \'writeFileAsync\'', function () {

        it('when no resolved dependencies are provived',
          async function () {
            const writeFileAsyncStub = sandbox.stub(utils, 'writeFileAsync').resolves();
            manager = new PackageFileManager('./package.json');
            await manager.getDependencies('all');
            await manager.persist(null);
            expect(writeFileAsyncStub.calledOnce).to.be.false;
          });

        it('when provided resolved dependencies is empty',
          async function () {
            const writeFileAsyncStub = sandbox.stub(utils, 'writeFileAsync').resolves();
            manager = new PackageFileManager('./package.json');
            await manager.getDependencies('all');
            await manager.persist({});
            expect(writeFileAsyncStub.calledOnce).to.be.false;
          });

      });

      context('to call function \'writeFileAsync\'', function () {

        it('when passing a document at the constructor',
          async function () {
            const writeFileAsyncStub = sandbox.stub(utils, 'writeFileAsync').resolves();
            manager = new PackageFileManager(JSON.stringify(packageJson));
            const resolvedDependencies = await manager.getDependencies('all');
            await manager.persist(resolvedDependencies, './package.json');
            expect(writeFileAsyncStub.calledOnce).to.be.true;
          });

        it('when passing a file path at the constructor',
          async function () {
            const writeFileAsyncStub = sandbox.stub(utils, 'writeFileAsync').resolves();
            manager = new PackageFileManager('./package.json');
            const resolvedDependencies = await manager.getDependencies('all');
            await manager.persist(resolvedDependencies);
            expect(writeFileAsyncStub.calledOnce).to.be.true;
          });

        it('even with no dependencies',
          async function () {
            const writeFileAsyncStub = sandbox.stub(utils, 'writeFileAsync').resolves();
            manager = new PackageFileManager('./package.json');
            const resolvedDependencies = await manager.getDependencies('all');
            resolvedDependencies.dependencies = undefined;
            resolvedDependencies.devDependencies = undefined;
            resolvedDependencies.peerDependencies = undefined;
            resolvedDependencies.optionalDependencies = undefined;
            await manager.persist(resolvedDependencies, './package.json');
            expect(writeFileAsyncStub.calledOnce).to.be.true;
          });

      });

    });

  });

});
