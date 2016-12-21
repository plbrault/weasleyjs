export default class Weasley {
  constructor() {
    this.resolvers = {};
    this.moduleProxies = {};
    this.container = {};
  }

  updateModuleProxy(key) {
    const { resolver, doNotUseDefault } = this.resolvers[key];
    let module = resolver();
    if (module.default && !doNotUseDefault) {
      module = module.default;
    }

    const moduleProxy = this.moduleProxies[key] || {};
    for (let attr in moduleProxy) {
      if (moduleProxy.hasOwnProperty(attr)) {
        delete moduleProxy[attr];
      }
    }
    Object.assign(moduleProxy, module);

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
        container[part] = {};
        container = container[part];
      }

      Object.defineProperty(container, parts[parts.length - 1], {
        get: () => this.moduleProxies[key] || this.updateModuleProxy(key),
      });
    }
  }
}
