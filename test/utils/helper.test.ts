// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import fs from 'fs';
import os from 'os';
import path from 'path';
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

    context('function \'isNullOrUndefind\' returns', function () {

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

      it('returns the file content',
        async function () {
          expect(await utils.readFileAsync(filePath)).to.equal(fileContent);
        });

      it('throws an Error when file does not exists',
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

      it('writes the file content',
        async function () {
          expect(await utils.writeFileAsync(filePath, fileContent)).to.be.undefined;
        });

      it('throws an Error when anything goes wrong',
        async function () {
          try {
            await utils.writeFileAsync('', fileContent);
          } catch (err) {
            expect(err).to.be.an.instanceof(Error);
          }
        });
    });

    context('function \'getFinalNewLine\' detects', function () {

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

      it('returns the correct type',
      function () {
        const sut = utils.getIndentation(JSON.stringify(data, null, 2));
        expect(sut).to.be.an('object');
        expect(sut).to.have.property('amount');
        expect(sut).to.have.property('indent');
        expect(sut).to.have.property('type');
      });

      it('detects spacing indentation',
        function () {
          const sut = utils.getIndentation(JSON.stringify(data, null, 2));
          expect(sut.amount).to.equal(2);
          expect(sut.indent).to.equal('  ');
          expect(sut.type).to.equal('space');
        });

      it('detects tab indentation',
        function () {
          const sut = utils.getIndentation(JSON.stringify(data, null, '\t'));
          expect(sut.amount).to.equal(1);
          expect(sut.indent).to.equal('\t');
          expect(sut.type).to.equal('tab');
        });

      it('detects no indentation',
        function () {
          const sut = utils.getIndentation(JSON.stringify(data, null, ''));
          expect(sut.amount).to.equal(0);
          expect(sut.indent).to.equal('');
          expect(sut.type).to.be.null;
        });

      it('detects same indentations',
        function () {
          const sut = utils.getIndentation(JSON.stringify(data, null, 2));
          expect(sut.amount).to.equal(2);
          expect(sut.indent).to.equal('  ');
          expect(sut.type).to.equal('space');
        });

      it('ignores empty lines',
        function () {
          const text = `{

            obj: 'test',
          }`;
          const sut = utils.getIndentation(text);
          expect(sut.amount).to.equal(12);
          expect(sut.indent).to.equal('            ');
          expect(sut.type).to.equal('space');
        });

      it('throws an Error if paramemter is not of type \'string\'',
        function () {
          expect(utils.getIndentation.bind(utils, data)).to.throw(/Expected a string/);
        });

    });

  });

});
