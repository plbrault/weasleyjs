import { LazyLoadedObjectModule, LazyLoadedFunctionModule, LazyLoadedClassModule, WeasleyContainer } from './lib';

/**
 * A tremendously simple dependency injection container for JavaScript.
 * @class Weasley
 * @property {Object} container - Provides access to the dependency tree. For instance, to access
 *                                to a dependency registered under the key `my.awesome.dependency`,
 *                                use `container.my.awesome.dependency`.
 */
export default class Weasley {
  /**
   * Create a new Weasley instance.
   * @memberof Weasley#
   */
  constructor() {
    this.container = new WeasleyContainer();
    this.snapshots = [];
  }

  /**
   * Register a new dependency.
   * @memberof Weasley#
   * @param {string} key - The key for accessing the dependency. It can contain dots to represent a
   *                       dependency hierarchy, e.g. 'my.awesome.dependency'.
   *
   *                       If the key already exists, it is overriden by the new dependency.
   *
   *                       You may register multiple dependencies as children of a same dependency
   *                       tree, e.g. `my.awesome.dependency` and `my.awesome.module`.
   *
   *                       However, you cannot register a dependency as a child of another
   *                       dependency, e.g. `my.awesome.module` and `my.awesome.module.is.awesome`.
   * @param {function} resolver - A function that returns a module,
   *                              e.g. () => require('./myAwesomeDependency').
   * @param {string} [nameOfExport=default] - The name of the module's export to use as the
   *                                          dependency.
   *
   *                                          If no value is provided for this parameter, and a
   *                                          `default` export is available, then it is that
   *                                          export that will be used. To avoid this behavior,
   *                                          pass '*' to this parameter.
   */
  register(key, resolver, nameOfExport = 'default') {
    this.container.addChild(key, resolver, nameOfExport);
  }

  /**
   * Take a snapshot of the current dependency tree, so that you can revert back to it later.
   * @memberof Weasley#
   */
  snapshot() {
    this.snapshots.push(this.container.clone());
  }

  /**
   * Revert to the last dependency tree snapshot.
   * @memberof Weasley#
   */
  revert() {
    if (this.snapshots.length === 0) {
      throw new Error('There is no snapshot to revert to');
    }
    this.container = this.snapshots.pop();
  }
}

/**
 * @typedef {Object} LazyLoadResult
 * @property {Object} asObject - Allows access to the lazy-loaded module as an object.
 * @property {Object} asFunction - Allows access to the lazy-loaded module as a simple function.
 * @property {Object} asClass - Allows access to the lazy-loaded module for calling the `new`
 *                              operator on it.
 */

/**
 * Lazy-load a module so that it will not actually be imported until it is used for the first time.
 * Useful during unit testing to override a module's dependency with a mock between the importation
 * and the actual testing.
 *
 * This function does not directly return a lazy-loaded module, but instead returns an object with
 * the following properties to access the actual module: `asObject` for when the lazy-loaded module
 * is an object, `asFunction` for when it is a function, and `asClass` for anything that you have
 * to call the `new` operator on.
 *
 * Be aware that the module will not be loaded from cache, so if you lazy-load the same module at
 * multiple places in your code, you will get different copies of the same module.
 * 
 * Usage Example:
 * ```
 * const myAwesomeModule = lazyLoad(require.resolve('./myAwesomeModule')).asObject;
 * ```
 *
 * @function lazyLoad
 * @param {string} absolutePath - The absolute path to the module. Typically you will want to use
 *                                `require.resolve` for getting this,
 *                                e.g. `require.resolve('./myAwesomeModule');`.
 * @param {string} [nameOfExport=default] - The name of the module's export to use.
 *
 *                                          If no value is provided for this parameter, and a
 *                                          `default` export is available, then it is that
 *                                          export that will be used. To avoid this behavior,
 *                                          pass '*' to this parameter.
 * @returns {LazyLoadResult}
 */
export function lazyLoad(absolutePath, nameOfExport = 'default') {
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
