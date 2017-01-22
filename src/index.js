function resolve(resolver, nameOfExport) {
  let module = resolver();
  if (nameOfExport !== '*') {
    if (nameOfExport === 'default') {
      if (module.default !== undefined) {
        module = module.default;
      }
    } else if (nameOfExport !== '*') {
      module = module[nameOfExport];
    }
  }
  return module;
}

class WeasleyContainer {
  addChild(key, resolver, nameOfExport) {
    let keyParts = key;
    if (typeof keyParts === 'string') {
      keyParts = keyParts.split('.');
    }

    const childKey = keyParts.shift();
    if (keyParts.length > 0) {
      if (this[childKey] && this[childKey].constructor.name !== this.constructor.name) {
        throw new Error('Cannot register new dependency as a child of an existing dependency');
      }
      this[childKey] = this[childKey] || new WeasleyContainer();
      this[childKey].addChild(keyParts, resolver, nameOfExport);
    } else {
      if (this[childKey] && this[childKey].constructor.name === this.constructor.name) {
        throw new Error('Cannot override existing container with dependency');
      }
      Object.defineProperty(this, childKey, {
        configurable: true,
        get: () => {
          const dependency = resolve(resolver, nameOfExport);
          Object.defineProperty(this, childKey, {
            configurable: true,
            value: dependency,
          });
          return dependency;
        },
      });
    }
  }
}

export default class Weasley {
  constructor() {
    this.container = new WeasleyContainer();
  }

  register(key, resolver, nameOfExport = 'default') {
    this.container.addChild(key, resolver, nameOfExport);
  }
}

class LazyLoadedModule {
  constructor(resolver, nameOfExport = 'default') {
    this.getModule = () => resolve(resolver, nameOfExport);
  }
}

class LazyLoadedObjectModule extends LazyLoadedModule {
  constructor(resolver, nameOfExport) {
    super(resolver, nameOfExport);
    this.moduleRef = {
      getModule: () => {
        this.module = this.getModule();
        this.moduleRef = () => this.module;
        return this.module;
      },
    };
    this.proxy = new Proxy(this.moduleRef, {
      get(target, name) {
        return target.getModule()[name];
      },
      set(target, name, value) {
        target.getModule()[name] = value; // eslint-disable-line no-param-reassign
        return true;
      },
    });
  }
}

class LazyLoadedFunctionModule extends LazyLoadedModule {
  /*constructor(resolver, nameOfExport) {
    super(resolver, nameOfExport);
    this.proxy = (...args) => {

    };
}*/
}

class LazyLoadedClassModule extends LazyLoadedModule {
}

export function lazyLoad(resolver, nameOfExport) {
  return {
    get asObject() {
      return new LazyLoadedObjectModule(resolver, nameOfExport).proxy;
    },
    get asFunction() {
      return new LazyLoadedFunctionModule(resolver, nameOfExport).proxy;
    },
    get asClass() {
      return new LazyLoadedClassModule(resolver, nameOfExport).proxy;
    },
  };
}
