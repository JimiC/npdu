// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { DependenciesFlags } from '../../src/common/enumerations';
import * as utils from '../../src/utils';

describe('Utils: tests', function () {

  context('expects', function () {

    let data: any;

    beforeEach(function () {
      data = {

        obj1: {
          obj2: {
            obj3: 'just',
          },
        },
        obj4: 'another',
        obj5: 'test',
      };
    });

    context('function \'isNullOrUndefind\' to return', function () {

      it('\'true\', when object path results to \'null\' or \'undefined\'',
        function () {
          data.obj1.obj2.obj3 = undefined;
          expect(utils.isNullOrUndefind(data, 'obj1', 'obj2', 'obj3')).to.be.true;

          data.obj1.obj2 = null;
          expect(utils.isNullOrUndefind(data, 'obj1', 'obj2', 'obj3')).to.be.true;

          data.obj1 = undefined;
          expect(utils.isNullOrUndefind(data, 'obj1', 'obj2', 'obj3')).to.be.true;

          data = null;
          expect(utils.isNullOrUndefind(data, 'obj1', 'obj2', 'obj3')).to.be.true;
        });

      it('\'false\', when object path does not result to \'null\' or \'undefined\'',
        function () {
          expect(utils.isNullOrUndefind(data, 'obj1', 'obj2', 'obj3')).to.be.false;
        });

    });

    context('function \'readFileAsync\'', function () {

      let filePath: string;
      let fileContent: string;
      before(function () {
        const tempFolderPath = os.tmpdir();
        filePath = path.posix.join(tempFolderPath, 'test');
        fileContent = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, fileContent, 'utf8');
      });

      after(function () {
        fs.unlinkSync(filePath);
      });

      it('to return the file content',
        async function () {
          expect(await utils.readFileAsync(filePath)).to.equal(fileContent);
        });

      it('to throw an Error when file does not exists',
        async function () {
          try {
            await utils.readFileAsync('');
          } catch (err) {
            expect(err).to.be.an.instanceof(Error);
          }
        });
    });

    context('function \'writeFileAsync\'', function () {

      let filePath: string;
      let fileContent: string;
      before(function () {
        const tempFolderPath = os.tmpdir();
        filePath = path.posix.join(tempFolderPath, 'test');
        fileContent = JSON.stringify(data, null, 2);
      });

      after(function () {
        fs.unlinkSync(filePath);
      });

      it('to write the file content to the provided file path',
        async function () {
          expect(await utils.writeFileAsync(filePath, fileContent)).to.be.undefined;
        });

      it('to throw an Error when anything goes wrong',
        async function () {
          try {
            await utils.writeFileAsync('', fileContent);
          } catch (err) {
            expect(err).to.be.an.instanceof(Error);
          }
        });
    });

    context('function \'getFinalNewLine\' to detect', function () {

      it('LF as the EOL',
        function () {
          const sut = utils.getFinalNewLine('text\n');
          expect(sut).to.be.an('object');
          expect(sut).to.have.property('has', true);
          expect(sut).to.have.property('type', '\n');
        });

      it('CRLF as the EOL',
        function () {
          const sut = utils.getFinalNewLine('text\r\n');
          expect(sut).to.be.an('object');
          expect(sut).to.have.property('has', true);
          expect(sut).to.have.property('type', '\r\n');
        });

      it('no EOL',
        function () {
          const sut = utils.getFinalNewLine('text');
          expect(sut).to.be.an('object');
          expect(sut).to.have.property('has', false);
          expect(sut).to.have.property('type', '');
        });

    });

    context('function \'getIndentation\'', function () {

      it('to return the correct type',
        function () {
          const sut = utils.getIndentation(JSON.stringify(data, null, 2));
          expect(sut).to.be.an('object');
          expect(sut).to.have.property('amount');
          expect(sut).to.have.property('indent');
          expect(sut).to.have.property('type');
        });

      it('to detect spacing indentation',
        function () {
          const sut = utils.getIndentation(JSON.stringify(data, null, 2));
          expect(sut.amount).to.equal(2);
          expect(sut.indent).to.equal('  ');
          expect(sut.type).to.equal('space');
        });

      it('to detect tab indentation',
        function () {
          const sut = utils.getIndentation(JSON.stringify(data, null, '\t'));
          expect(sut.amount).to.equal(1);
          expect(sut.indent).to.equal('\t');
          expect(sut.type).to.equal('tab');
        });

      it('to detect no indentation',
        function () {
          const sut = utils.getIndentation(JSON.stringify(data, null, ''));
          expect(sut.amount).to.equal(0);
          expect(sut.indent).to.equal('');
          expect(sut.type).to.be.null;
        });

      it('to detect same indentations',
        function () {
          const sut = utils.getIndentation(JSON.stringify(data, null, 2));
          expect(sut.amount).to.equal(2);
          expect(sut.indent).to.equal('  ');
          expect(sut.type).to.equal('space');
        });

      it('to ignore empty lines',
        function () {
          const text = `{

            obj: 'test',
          }`;
          const sut = utils.getIndentation(text);
          expect(sut.amount).to.equal(12);
          expect(sut.indent).to.equal('            ');
          expect(sut.type).to.equal('space');
        });

      it('to throw an Error if paramemter is not of type \'string\'',
        function () {
          expect(() => utils.getIndentation(data)).to.throw(/Expected a string/);
        });

    });

    context('function \'isValidPath\' to return', function () {

      it('\'true\' when provided parameter is a path',
        function () {
          expect(utils.isValidPath('./package.json')).to.be.true;
          expect(utils.isValidPath('package.json')).to.be.true;
        });

      it('\'false\' when provided parameter is not a path',
        function () {
          expect(utils.isValidPath(JSON.stringify(data))).to.be.false;
        });

    });

    context('function \'getDependenciesFlagByKey\'', function () {

      it('to return the correct enumeration member',
        function () {
          expect(utils.getDependenciesFlagByKey('all')).to.equal(DependenciesFlags.All);
          expect(utils.getDependenciesFlagByKey('prod')).to.equal(DependenciesFlags.Prod);
          expect(utils.getDependenciesFlagByKey('dev')).to.equal(DependenciesFlags.Dev);
          expect(utils.getDependenciesFlagByKey('peer')).to.equal(DependenciesFlags.Peer);
          expect(utils.getDependenciesFlagByKey('optional')).to.equal(DependenciesFlags.Optional);
        });

      it('to throw an Error when an enumeration member does not exists',
        function () {
          expect(() => utils.getDependenciesFlagByKey('test')).to.throw(/Not Implemented/);
        });

    });

    context('function \'isValidUri\'', function () {

      it('to return \'true\' when provided \'uri\' is valid',
        function () {
          expect(utils.isValidUri('http://some.domain.yz')).to.be.true;
        });

      it('to return \'false\' when provided \'uri\' is invalid',
        function () {
          expect(utils.isValidUri('test')).to.be.false;
        });

    });

  });

});
