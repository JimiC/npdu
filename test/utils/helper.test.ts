// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import * as utils from '../../src/utils';

describe('Utils: tests', function () {

  context('function \'isNullOrUndefind\' returns', function () {

    let sut;

    beforeEach(function () {
      sut = {
        obj1: {
          obj2: {
            obj3: 'test',
          },
        },
      };
    });

    it('\'true\', when object path results to \'null\' or \'undefined\'',
      function () {
        sut.obj1.obj2.obj3 = undefined;
        expect(utils.isNullOrUndefind(sut, 'obj1', 'obj2', 'obj3')).to.be.true;

        sut.obj1.obj2 = null;
        expect(utils.isNullOrUndefind(sut, 'obj1', 'obj2', 'obj3')).to.be.true;

        sut.obj1 = undefined;
        expect(utils.isNullOrUndefind(sut, 'obj1', 'obj2', 'obj3')).to.be.true;

        sut = null;
        expect(utils.isNullOrUndefind(sut, 'obj1', 'obj2', 'obj3')).to.be.true;
      });

    it('\'false\', when object path does not result to \'null\' or \'undefined\'',
      function () {
        expect(utils.isNullOrUndefind(sut, 'obj1', 'obj2', 'obj3')).to.be.false;
      });

  });

});
