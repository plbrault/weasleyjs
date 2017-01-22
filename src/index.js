import { LazyLoadedObjectModule, LazyLoadedFunctionModule, LazyLoadedClassModule, WeasleyContainer } from './lib';

export default class Weasley {
  constructor() {
    this.container = new WeasleyContainer();
    this.snapshots = [];
  }

  register(key, resolver, nameOfExport = 'default') {
    this.container.addChild(key, resolver, nameOfExport);
  }

  snapshot() {
    this.snapshots.push(this.container.clone());
  }

  revert() {
    if (this.snapshots.length === 0) {
      throw new Error('There is no snapshot to revert to');
    }
    this.container = this.snapshots.pop();
  }
}

export function lazyLoad(absolutePath, nameOfExport) {
  const resolver = () => {
    const cached = require.cache[absolutePath];
    delete require.cache[absolutePath];
    const module = require(absolutePath);
    require.cache[absolutePath] = cached;
    return module;
  };
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
