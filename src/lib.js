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
  }

  _addChild(key, resolver, nameOfExport) {
    let keyParts = key;
    if (typeof keyParts === 'string') {
      keyParts = keyParts.split('.');
    }

    const childKey = keyParts.shift();
    if (keyParts.length > 0) {
      if (childKey in this) {
        const child = Object.getOwnPropertyDescriptor(this, childKey).value;
        if (child && child.constructor.name !== this.constructor.name) {
          throw new Error('Cannot register new dependency as a child of an existing dependency');
        }
      }
      this[childKey] = this[childKey] || new WeasleyContainer();
      this[childKey]._addChild(keyParts, resolver, nameOfExport);
    } else {
      if (childKey in this) {
        const child = Object.getOwnPropertyDescriptor(this, childKey).value;
        if (child && child.constructor.name === this.constructor.name) {
          throw new Error('Cannot override existing container with dependency');
        }
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

export class LazyLoadedModule {
  constructor(resolver, nameOfExport) {
    this.getModule = () => {
      if (!this.module) {
        this.module = resolve(resolver, nameOfExport);
      }
      return this.module;
    };
    this.proxy = new Proxy(this.getModule, {
      apply(target, ctx, args) {
        return Reflect.apply(target(), ctx, args);
      },
      construct(target, args) {
        return Reflect.construct(target(), args);
      },
      defineProperty(target, key, descriptor) {
        return Reflect.defineProperty(target(), key, descriptor);
      },
      deleteProperty(target, key) {
        return Reflect.deleteProperty(target(), key);
      },
      enumerate(target) {
        return Object.keys(target())[Symbol.iterator]();
      },
      get(target, name) {
        return Reflect.get(target(), name);
      },
      getOwnPropertyDescriptor(target, prop) {
        return Reflect.getOwnPropertyDescriptor(target(), prop);
      },
      getPrototypeOf(target) {
        return Reflect.getPrototypeOf(target());
      },
      has(target, key) {
        return Reflect.has(target(), key);
      },
      isExtensible(target) {
        return Reflect.isExtensible(target());
      },
      ownKeys(target) {
        return Reflect.ownKeys(target());
      },
      preventExtensions(target) {
        return Reflect.preventExtensions(target());
      },
      set(target, name, value) {
        return Reflect.set(target(), name, value);
      },
      setPrototypeOf(target, prototype) {
        return Reflect.setPrototypeOf(target(), prototype);
      },
    });
  }
}
