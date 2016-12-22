import copy from 'shallow-copy';

export default class Weasley {
  constructor() {
    this.resolvers = {};
    this.moduleProxies = {};
    this.moduleProxyGetters = {};
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
    let moduleProxyGetter;
    if (typeof module === 'function') {
      const functionModules = this.functionModules;
      functionModules[key] = module;
      moduleProxy = this.moduleProxies[key] || (function proxy() {
        return functionModules[key];
      });
      moduleProxyGetter = moduleProxy;
    } else if (typeof module === 'object') {
      moduleProxy = this.moduleProxies[key] || {};
      for (const attr in moduleProxy) {
        if (moduleProxy.hasOwnProperty(attr)) {
          delete moduleProxy[attr];
        }
      }
      Object.assign(moduleProxy, module);
      moduleProxyGetter = this.moduleProxyGetters[key] || (() => moduleProxy);
    }

    this.moduleProxies[key] = moduleProxy;
    this.moduleProxyGetters[key] = moduleProxyGetter;
    return moduleProxyGetter;
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
        container[part] = {};
        container = container[part];
      }

      Object.defineProperty(container, parts[parts.length - 1], {
        get: () => (this.moduleProxyGetters[key] || this.updateModuleProxy(key)),
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
