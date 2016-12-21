'use strict';

export default class Weasley {
  constructor() {
    this.resolvers = {};
    this.modules = {};
    this.container = {};
  }

  register(key, resolver, doNotUseDefault) {
    this.resolvers[key] = resolver;
    this.modules[key] = null;
    const parts = key.split('.');
    let obj = this.container;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i < parts.length - 1) {
        if (!obj[part]) {
          obj[part] = {};
        }
        obj = obj[part];
      } else {
        if (!obj.hasOwnProperty(part)) {
          Object.defineProperty(obj, part, {
            get: () => {
              return this.modules[key] || 
                (() => {
                  let module = this.resolvers[key]();
                  if (module.default && !doNotUseDefault) {
                    module = module.default;
                  }
                  this.modules[key] = module;
                  return module;
                })();
            }
          });
        }
      }
    }
  }
}
