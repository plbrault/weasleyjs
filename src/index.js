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
          let dependency = resolver();
          if (nameOfExport !== '*') {
            if (nameOfExport === 'default') {
              if (dependency.default !== undefined) {
                dependency = dependency.default;
              }
            } else if (nameOfExport !== '*') {
              dependency = dependency[nameOfExport];
            }
          }
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
