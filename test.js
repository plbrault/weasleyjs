/* eslint-env node, mocha */
/* eslint-disable import/no-extraneous-dependencies, func-names, prefer-arrow-callback,
no-unused-vars */

import chai, { expect } from 'chai';

import Weasley from './src';

let altSampleObj;
let sampleObj;
let sampleFuncWithoutParams;
let sampleFuncWithParams;
let sampleClassWithoutConstructorParams;
let sampleClassWithConstructorParams;

beforeEach(function () {
  sampleObj = {
    Gryffindor: 'lion',
    Hufflepuff: 'badger',
    Ravenclaw: 'eagle',
    Slytherin: 'snake',
  };

  altSampleObj = {
    Gryffindor: 'red and ore',
    Hufflepuff: 'yellow and black',
    Ravenclaw: 'blue and bronze',
    Slytherin: 'green and silver',
  };  

  sampleFuncWithoutParams = function () {
    return 'horcruxes';
  };

  sampleFuncWithParams = function (harry, ron, hermione) {
    return `${harry}${ron}${hermione}`;
  };

  sampleClassWithoutConstructorParams = class {
    constructor() {
      this.YouKnowWho = 'Lord Voldemort';
    }
  };

  sampleClassWithConstructorParams = class {
    constructor(draco, vincent, gregory) {
      this.draco = draco;
      this.vincent = vincent;
      this.gregory = gregory;
    }
  };
});

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

it('should be possible to add an attribute to an object dependency', function () {
  const weasley = new Weasley();
  weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore', () => sampleObj);

  const albus1 = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore;
  albus1.password = 'Caput Draconis';

  const albus2 = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore;
  expect(albus2.password).to.equal('Caput Draconis');

  expect(sampleObj.password).to.equal('Caput Draconis');
});

it('should be possible to override an object dependency under a single-level key', function () {
  const weasley = new Weasley();
  weasley.register('Albus', () => sampleObj);

  const albus1 = weasley.container.Albus;
  Object.keys(sampleObj).forEach(function (key) {
    expect(albus1[key]).to.be.equal(sampleObj[key]);
  });

  weasley.register('Albus', () => altSampleObj);

  const albus2 = weasley.container.Albus;
  Object.keys(altSampleObj).forEach(function (key) {
    expect(albus2[key]).to.be.equal(altSampleObj[key]);
  });
});

it('should be possible to override an object dependency under a multiple-level key', function () {
  const weasley = new Weasley();
  weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore', () => sampleObj);

  const albus1 = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore;
  Object.keys(sampleObj).forEach(function (key) {
    expect(albus1[key]).to.be.equal(sampleObj[key]);
  });

  weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore', () => altSampleObj);

  const albus2 = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore;
  Object.keys(altSampleObj).forEach(function (key) {
    expect(albus2[key]).to.be.equal(altSampleObj[key]);
  });
});

it('should keep old references up to date when an object dependency is overriden', function () {
  const weasley = new Weasley();
  weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore', () => sampleObj);

  const albus = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore;
  Object.keys(sampleObj).forEach(function (key) {
    expect(albus[key]).to.be.equal(sampleObj[key]);
  });

  weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore', () => altSampleObj);

  Object.keys(altSampleObj).forEach(function (key) {
    expect(albus[key]).to.be.equal(altSampleObj[key]);
  });
});
