export function resolve(resolver, nameOfExport) {
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
  constructor() {
    this._addChild = this._addChild.bind(this);
    this._clone = this._clone.bind(this);
  }

  _addChild(key, resolver, nameOfExport) {
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
      this[childKey]._addChild(keyParts, resolver, nameOfExport);
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

  _clone() {
    const clone = new WeasleyContainer();
    Object.getOwnPropertyNames(this).forEach((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(this, key);
      const value = descriptor.value;
      if (value) {
        if (value.constructor.name === this.constructor.name) {
          clone[key] = value._clone();
        } else {
          Object.defineProperty(clone, key, {
            configurable: true,
            value,
          });
        }
      } else {
        Object.defineProperty(clone, key, {
          configurable: true,
          get: descriptor.get,
        });
      }
    });
    return clone;
  }
}

export class LazyLoadedModule {
  constructor(resolver, nameOfExport) {
    this.getModule = () => {
      const module = resolve(resolver, nameOfExport);
      this.getModule = () => module;
      return module;
    };
    this.proxy = new Proxy(this.getModule, {
      get(target, name) {
        return target()[name];
      },
      set(target, name, value) {
        target()[name] = value; // eslint-disable-line no-param-reassign
        return true;
      },
      has(target, key) {
        return key in target();
      },
      deleteProperty(target, key) {
        delete target()[key];  // eslint-disable-line no-param-reassign
        return true;
      },
      defineProperty(target, key, descriptor) {
        Object.defineProperty(target(), key, descriptor);
        return true;
      },
      enumerate(target) {
        return Object.keys(target())[Symbol.iterator]();
      },
      ownKeys(target) {
        return Reflect.ownKeys(target());
      },
      apply(target, ctx, args) {
        return Reflect.apply(target(), ctx, args);
      },
    });
  }
}
