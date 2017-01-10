import copy from 'shallow-copy';

export default class Weasley {
  constructor() {
    this.resolvers = {};
    this.moduleProxies = {};
    this.objectModules = {};
    this.functionModules = {};
    this.container = {};
    this.snapshots = [];
  }

  updateModuleProxy(key) {
    const { resolver, doNotUseDefault } = this.resolvers[key];
    let module = resolver();
    if (module.default && !doNotUseDefault) {
      module = module.default;
    }

    let moduleProxy;
    if (typeof module === 'function') {
      const functionModules = this.functionModules;
      functionModules[key] = module;
      moduleProxy = this.moduleProxies[key] || (function proxy(...args) {
        return functionModules[key](...args);
      });
      moduleProxy.new = function newProxy(...args) {
        return new functionModules[key](...args);
      };
    } else if (typeof module === 'object') {
      const objectModules = this.objectModules;
      objectModules[key] = module;
      moduleProxy = this.moduleProxies[key] || new Proxy({ key }, {
        get(moduleRef, name) {
          return objectModules[moduleRef.key][name];
        },
        set(moduleRef, name, value) {
          objectModules[moduleRef.key][name] = value;
          return true;
        },
      });
    }

    this.moduleProxies[key] = moduleProxy;
    return moduleProxy;
  }

  register(key, resolver, doNotUseDefault) {
    this.resolvers[key] = { resolver, doNotUseDefault };

    if (this.moduleProxies[key]) {
      this.updateModuleProxy(key);
    } else {
      const parts = key.split('.');
      let container = this.container;

      for (let i = 0; i < parts.length - 1; i += 1) {
        const part = parts[i];
        if (!container[part]) {
          container[part] = {};
        }
        container = container[part];
      }

      Object.defineProperty(container, parts[parts.length - 1], {
        get: () => (this.moduleProxies[key] || this.updateModuleProxy(key)),
      });
    }
  }

  snapshot() {
    const snapshot = copy(this.resolvers);
    this.snapshots.push(snapshot);
  }

  revert() {
    this.resolvers = this.snapshots.pop() || {};
    this.moduleProxies = {};
    this.functionModules = {};
    this.container = {};
  }
}
