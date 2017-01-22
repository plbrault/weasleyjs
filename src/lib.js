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

export class WeasleyContainer {
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

  clone() {
    const clone = {};
    Object.getOwnPropertyNames(this).forEach((key) => {
      if (this[key].constructor.name === this.constructor.name) {
        clone[key] = this[key].clone();
      } else {
        clone[key] = this[key];
      }
    });
    return clone;
  }
}

class LazyLoadedModule {
  constructor(resolver, nameOfExport = 'default') {
    const getModule = () => resolve(resolver, nameOfExport);
    this.moduleRef = {
      getModule: () => {
        const module = getModule();
        this.moduleRef = () => module;
        return module;
      },
    };
  }
}

export class LazyLoadedObjectModule extends LazyLoadedModule {
  constructor(resolver, nameOfExport) {
    super(resolver, nameOfExport);
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

export class LazyLoadedFunctionModule extends LazyLoadedModule {
  constructor(resolver, nameOfExport) {
    super(resolver, nameOfExport);
    this.proxy = (...args) => {
      this.proxy = this.moduleRef.getModule();
      return this.proxy(...args);
    };
  }
}

export class LazyLoadedClassModule extends LazyLoadedModule {
  constructor(resolver, nameOfExport) {
    super(resolver, nameOfExport);
    this.proxy = (...args) => {
      this.proxy = this.moduleRef.getModule();
      return new this.proxy(...args); // eslint-disable-line new-cap
    };
  }
}
