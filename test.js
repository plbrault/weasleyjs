/* eslint-env node, mocha */
/* eslint-disable import/no-extraneous-dependencies, func-names, prefer-arrow-callback,
no-unused-vars */

import chai, { expect } from 'chai';

import Weasley from './src';

const sampleObj = {
  Gryffindor: 'lion',
  Hufflepuff: 'badger',
  Ravenclaw: 'eagle',
  Slytherin: 'snake',
};

function sampleFuncWithoutParams() {
  return 'horcruxes';
}

function sampleFuncWithParams(harry, ron, hermione) {
  return `${harry}${ron}${hermione}`;
}

class sampleClassWithoutConstructorParams {
  constructor() {
    this.YouKnowWho = 'Lord Voldemort';
  }
}

class sampleClassWithConstructorParams {
  constructor(draco, vincent, gregory) {
    this.draco = draco;
    this.vincent = vincent;
    this.gregory = gregory;
  }
}

describe('Weasley', function () {
  it('should properly register an object dependency under a single-level key', function () {
    const weasley = new Weasley();
    weasley.register('Albus', () => sampleObj);

    const albus = weasley.container.Albus;
    Object.keys(sampleObj).forEach(function (key) {
      expect(albus[key]).to.be.equal(sampleObj[key]);
    });
  });

  it('should properly register an object dependency under a multiple-level key', function () {
    const weasley = new Weasley();
    weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore', () => sampleObj);

    const albus = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore;
    Object.keys(sampleObj).forEach(function (key) {
      expect(albus[key]).to.be.equal(sampleObj[key]);
    });
  });

  it('should be possible to retrieve the same object dependency multiple times', function () {
    const weasley = new Weasley();
    weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore', () => sampleObj);

    const albus1 = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore;
    Object.keys(sampleObj).forEach(function (key) {
      expect(albus1[key]).to.be.equal(sampleObj[key]);
    });

    const albus2 = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore;
    Object.keys(sampleObj).forEach(function (key) {
      expect(albus2[key]).to.be.equal(sampleObj[key]);
    });
  });

  it('should be possible to alter an attribute from an object dependency', function () {
    const weasley = new Weasley();
    weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore', () => sampleObj);

    const albus1 = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore;
    albus1.Ravenclaw = 'Why not a raven?';

    const albus2 = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore;
    expect(albus2.Ravenclaw).to.equal('Why not a raven?');

    expect(sampleObj.Ravenclaw).to.equal('Why not a raven?');
  });
});
