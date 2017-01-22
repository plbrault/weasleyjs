/* eslint-env node, mocha */
/* eslint-disable import/no-extraneous-dependencies, func-names, prefer-arrow-callback,
no-unused-vars */

import chai, { expect } from 'chai';

import Weasley, { lazyLoad } from './src';

describe('Weasley', function () {
  const sampleDependency1 = {
    speak: () => 'Dark times lie ahead of us and there will be a time when we must choose between what is easy and what is right.',
  };
  const sampleDependency2 = {
    speak: () => 'Of course it is happening inside your head, Harry, but why on earth should that mean that it is not real?',
  };
  const sampleDependency3 = {
    speak: () => 'Words are, in my not-so-humble opinion, our most inexhaustible source of magic. Capable of both inflicting injury, and remedying it.',
  };
  const sampleDependencyWithNamedExports = {
    default: {
      speak: () => 'Nitwit! Blubber! Oddment! Tweak!',
    },
    alt: {
      speak: () => 'It does not do to dwell on dreams and forget to live.',
    },
  };

  it('should properly register a dependency under a single-level key', function () {
    const weasley = new Weasley();
    weasley.register('Albus', () => sampleDependency1);

    const albus = weasley.container.Albus;
    expect(albus).to.be.equal(sampleDependency1);
  });

  it('should properly register a dependency under a multiple-level key', function () {
    const weasley = new Weasley();
    weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore', () => sampleDependency1);

    const albus = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore;
    expect(albus).to.be.equal(sampleDependency1);
  });

  it('should be possible to retrieve the same dependency multiple times', function () {
    const weasley = new Weasley();
    weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore', () => sampleDependency1);

    const albus1 = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore;
    expect(albus1).to.be.equal(sampleDependency1);

    const albus2 = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore;
    expect(albus2).to.be.equal(sampleDependency1);
  });

  it('should be possible to override a dependency under a single-level key', function () {
    const weasley = new Weasley();
    weasley.register('Albus', () => sampleDependency1);

    const albus1 = weasley.container.Albus;
    expect(albus1).to.be.equal(sampleDependency1);

    weasley.register('Albus', () => sampleDependency2);

    const albus2 = weasley.container.Albus;
    expect(albus2).to.be.equal(sampleDependency2);
  });

  it('should be possible to override a dependency under a multiple-level key', function () {
    const weasley = new Weasley();
    weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore', () => sampleDependency1);

    const albus1 = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore;
    expect(albus1).to.be.equal(sampleDependency1);

    weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore', () => sampleDependency2);

    const albus2 = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore;
    expect(albus2).to.be.equal(sampleDependency2);
  });

  it('should be possible to override a dependency before its first use', function () {
    const weasley = new Weasley();

    weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore', () => ({}));
    weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore', () => sampleDependency1);

    const albus = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore;
    expect(albus).to.be.equal(sampleDependency1);
  });

  it('should be possible to register two dependencies under different subkeys of a same key', function () {
    const weasley = new Weasley();
    weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore.Rules', () => sampleDependency1);

    const albusRules = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore.Rules;
    expect(albusRules).to.be.equal(sampleDependency1);

    weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore.Rocks', () => sampleDependency2);
    const albusRocks = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore.Rocks;
    expect(albusRocks).to.be.equal(sampleDependency2);

    const albusRulesAgain = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore.Rules;
    expect(albusRulesAgain).to.be.equal(sampleDependency1);

    const albusRocksAgain = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore.Rocks;
    expect(albusRocksAgain).to.be.equal(sampleDependency2);
  });

  it('should be possible to override a dependency without effecting on its siblings', function () {
    const weasley = new Weasley();
    weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore.Rules', () => sampleDependency1);

    const albusRules = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore.Rules;
    expect(albusRules).to.be.equal(sampleDependency1);

    weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore.Rocks', () => sampleDependency2);
    const albusRocks = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore.Rocks;
    expect(albusRocks).to.be.equal(sampleDependency2);

    weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore.Rules', () => sampleDependency3);
    const albusRulesAgain = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore.Rules;
    expect(albusRulesAgain).to.be.equal(sampleDependency3);

    const albusRocksAgain = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore.Rocks;
    expect(albusRocks).to.be.equal(sampleDependency2);
  });

  it('should throw an exception when trying to override a container with a dependency', function () {
    const weasley = new Weasley();
    weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore', () => sampleDependency1);

    const albus = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore;
    expect(albus).to.be.equal(sampleDependency1);

    let exceptionThrown = false;
    try {
      weasley.register('Albus', () => sampleDependency1);
    } catch (err) {
      exceptionThrown = true;
    }
    expect(exceptionThrown).to.be.equal(true);
  });

  it('should throw an exception when trying to register a dependency as a child of an existing dependency', function () {
    const weasley = new Weasley();
    weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore', () => sampleDependency1);

    const albus = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore;
    expect(albus).to.be.equal(sampleDependency1);

    let exceptionThrown = false;
    try {
      weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore.Rocks', () => sampleDependency2);
    } catch (err) {
      exceptionThrown = true;
    }
    expect(exceptionThrown).to.be.equal(true);
  });

  it('should use the default import when available', function () {
    const weasley = new Weasley();
    weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore', () => sampleDependencyWithNamedExports);

    const albus = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore;
    expect(albus).to.be.equal(sampleDependencyWithNamedExports.default);
  });

  it('should not use the default import when nameOfExport is `*`', function () {
    const weasley = new Weasley();
    weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore', () => sampleDependencyWithNamedExports, '*');

    const albus = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore;
    expect(albus).to.be.equal(sampleDependencyWithNamedExports);
  });

  it('should use the specified export if any', function () {
    const weasley = new Weasley();
    weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore', () => sampleDependencyWithNamedExports, 'alt');

    const albus = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore;
    expect(albus).to.be.equal(sampleDependencyWithNamedExports.alt);
  });
});

describe('lazyLoad', function () {
  const sampleDependency = {
    name: 'Albus Dumbledore',
    speak: () => 'Dark times lie ahead of us and there will be a time when we must choose between what is easy and what is right.',
  };

  const weasleyModule = () => {
    const weasley = new Weasley();
    weasley.register('sample.dependency', () => sampleDependency);
    return weasley;
  };

  const sampleObjModule = () => {
    const weasley = weasleyModule();
    const someDependency = weasley.container.sample.dependency;

    return {
      albus: someDependency,
    };
  };

  const sampleObjModuleWithNamedExports = () => {
    const weasley = weasleyModule();
    const someDependency = weasley.container.sample.dependency;

    return {
      albus: someDependency,
      default: {
        quote: someDependency.speak(),
      },
      albusQuote: someDependency.speak(),
    };
  };

  const sampleFuncModule = () => {
    const weasley = weasleyModule();
    const someDependency = weasley.container.sample.dependency;

    return function (...args) {
      return {
        albusQuote: someDependency.speak(),
        passedArgs: arguments, // eslint-disable-line prefer-rest-params
      };
    };
  };

  const sampleClassModule = () => {
    const weasley = weasleyModule();
    const someDependency = weasley.container.sample.dependency;

    return class {
      constructor(...args) {
        this.albusQuote = someDependency.speak();
        this.constructorArgs = arguments; // eslint-disable-line prefer-rest-params
      }
    };
  };

  it('should be possible to access properties from a lazy-loaded object', function () {
    const obj = lazyLoad(() => sampleObjModule()).asObject;
    expect(obj.albus.name).to.be.equal(sampleDependency.name);    
    expect(obj.albus.speak).to.be.equal(sampleDependency.speak);
  });

  it('should be possible to call a lazy-loaded function with an arbitrary number of arguments', function () {
    const func = lazyLoad(() => sampleFuncModule()).asFunction;
    const res = func('Nitwit', 'Blubber', 'Oddment', 'Tweak');
    expect(res.albusQuote).to.be.equal(sampleDependency.speak());
    expect(res.passedArgs[0]).to.be.equal('Nitwit');
    expect(res.passedArgs[1]).to.be.equal('Blubber');
    expect(res.passedArgs[2]).to.be.equal('Oddment');
    expect(res.passedArgs[3]).to.be.equal('Tweak');
  });

  it('should be possible to instanciate a lazy-loaded class with an arbitrary number of constructor arguments', function () {
    const Cls = lazyLoad(() => sampleClassModule()).asClass;
    const inst = new Cls('Nitwit', 'Blubber', 'Oddment', 'Tweak');
    expect(inst.albusQuote).to.be.equal(sampleDependency.speak());
    expect(inst.constructorArgs[0]).to.be.equal('Nitwit');
    expect(inst.constructorArgs[1]).to.be.equal('Blubber');
    expect(inst.constructorArgs[2]).to.be.equal('Oddment');
    expect(inst.constructorArgs[3]).to.be.equal('Tweak');    
  });
});
