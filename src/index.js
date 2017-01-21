class WeasleyContainer {
  addChild(key, resolver, useDefaultExport) {
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
      this[childKey].addChild(keyParts, resolver);
    } else {
      if (this[childKey] && this[childKey].constructor.name === this.constructor.name) {
        throw new Error('Cannot override existing container with dependency');
      }
      Object.defineProperty(this, childKey, {
        configurable: true,
        get: () => {
          let module = resolver();
          if (module.default && useDefaultExport) {
            module = module.default;
          }
          Object.defineProperty(this, childKey, {
            configurable: true,
            value: module,
          });
          return module;
        },
      });
    }
  }
}

export default class Weasley {
  constructor() {
    this.container = new WeasleyContainer();
  }

  register(key, resolver, useDefaultExport = true) {
    this.container.addChild(key, resolver, useDefaultExport);
  }
}
