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

  it('should be possible to snapshot the current container and revert to it afterwards', function () {
    const weasley = new Weasley();
    weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore', () => sampleDependency1);

    let albus = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore;
    expect(albus).to.be.equal(sampleDependency1);
    expect(albus).to.not.be.equal(sampleDependency2);

    weasley.snapshot();
    albus = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore;
    expect(albus).to.be.equal(sampleDependency1);

    weasley.register('Albus.Percival.Wulfric.Brian.Dumbledore', () => sampleDependency2);
    albus = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore;
    expect(albus).to.be.equal(sampleDependency2);

    weasley.revert();
    albus = weasley.container.Albus.Percival.Wulfric.Brian.Dumbledore;
    expect(albus).to.be.equal(sampleDependency1);
  });
});

describe('lazyLoad', function () {
  const sampleDependency = require('./testModules/sampleDependency').default;

  beforeEach(function () {
    delete require.cache[require.resolve('./testModules/sampleClassModule')];
    delete require.cache[require.resolve('./testModules/sampleFuncModule')];
    delete require.cache[require.resolve('./testModules/sampleObjModule')];
  });

  it('should be possible to access properties from a lazy-loaded object', function () {
    const obj = lazyLoad(require.resolve('./testModules/sampleObjModule'));
    expect(obj.albus.name).to.be.equal(sampleDependency.name);
    expect(obj.albus.speak).to.be.equal(sampleDependency.speak);
  });

  it('should be possible to call a lazy-loaded function with an arbitrary number of arguments', function () {
    const func = lazyLoad(require.resolve('./testModules/sampleFuncModule'));
    const res = func('Nitwit', 'Blubber', 'Oddment', 'Tweak');
    expect(res.albusQuote).to.be.equal(sampleDependency.speak());
    expect(res.passedArgs[0]).to.be.equal('Nitwit');
    expect(res.passedArgs[1]).to.be.equal('Blubber');
    expect(res.passedArgs[2]).to.be.equal('Oddment');
    expect(res.passedArgs[3]).to.be.equal('Tweak');
  });

  it('should be possible to instanciate a lazy-loaded class with an arbitrary number of constructor arguments', function () {
    const Cls = lazyLoad(require.resolve('./testModules/sampleClassModule'));
    const inst = new Cls('Nitwit', 'Blubber', 'Oddment', 'Tweak');
    expect(inst.albusQuote).to.be.equal(sampleDependency.speak());
    expect(inst.constructorArgs[0]).to.be.equal('Nitwit');
    expect(inst.constructorArgs[1]).to.be.equal('Blubber');
    expect(inst.constructorArgs[2]).to.be.equal('Oddment');
    expect(inst.constructorArgs[3]).to.be.equal('Tweak');
  });

  it('should not use require cache when lazy-loading an object module', function () {
    const obj = require('./testModules/sampleObjModule');
    obj.n = 42;
    expect(require('./testModules/sampleObjModule').n).to.be.equal(obj.n);

    const lazyLoaded = lazyLoad(require.resolve('./testModules/sampleObjModule'));
    expect(lazyLoaded.n).to.be.equal(undefined);
  });

  it('should not use require cache when lazy-loading a function module', function () {
    const func = require('./testModules/sampleFuncModule');
    func.n = 42;
    expect(require('./testModules/sampleFuncModule').n).to.be.equal(func.n);

    const lazyLoaded = lazyLoad(require.resolve('./testModules/sampleFuncModule'));
    expect(lazyLoaded.n).to.be.equal(undefined);
  });

  it('should not affect require cache for future imports when lazy-loading an object module', function () {
    const obj = require('./testModules/sampleObjModule');
    obj.n = 42;
    expect(require('./testModules/sampleObjModule').n).to.be.equal(obj.n);

    const lazyLoaded = lazyLoad(require.resolve('./testModules/sampleObjModule'));
    expect(lazyLoaded.n).to.be.equal(undefined);

    expect(require('./testModules/sampleObjModule').n).to.be.equal(obj.n);
  });

  it('should not affect require cache for future imports when lazy-loading a function module', function () {
    const func = require('./testModules/sampleFuncModule');
    func.n = 42;
    expect(require('./testModules/sampleFuncModule').n).to.be.equal(func.n);

    const lazyLoaded = lazyLoad(require.resolve('./testModules/sampleFuncModule'));
    expect(lazyLoaded.n).to.be.equal(undefined);

    expect(require('./testModules/sampleFuncModule').n).to.be.equal(func.n);
  });
});
