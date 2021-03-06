# WeasleyJS

This is a simple JavaScript dependency registry (or service locator) that serves at least two purposes:

* Being able to easily swap dependencies programmatically;  
* Making everything easily mockable for testing.

Beware that using a service locator may be an anti-pattern (as opposed to proper dependency injection).
That being said, feel free to use this package if it suits your needs and you are okay with the possible
drawbacks of this approach.

## Setup

```bash
npm install --save weasley
```

or

```bash
yarn add weasley
```

## Example

Create a `weasley.js` module:

```javascript
import Weasley from 'weasley';

const weasley = new Weasley();

// Register the `awesomeDependency` package under the key `my.awesome.dependency`.
// If `awesomeDependency` has a default export, it will be used.
weasley.register('my.awesome.dependency', () => require('awesomeDependency'));

// Register the `boringExport` named export of the `boringDependency` package under
// the key `my.boring.dependency`.
weasley.register('my.boring.dependency', () => require('boringDependency'), 'boringExport');

// Register all exports (instead of `default`) of `awesomeModule` under the key
// `my.awesome.module`.
weasley.register('my.awesome.module', () => require('./awesomeModule.js'), '*');

export default weasley;
```

Import your `weasley.js` module from another module (e.g. `awesomeModule.js`):

```javascript
import weasley from './weasley.js';

const awesomeDependency = weasley.container.my.awesome.dependency;
const boringDependency = weasley.container.my.boring.dependency;

export function doThings() {
  awesomeDependency.doSomethingAwesome();
  boringDependency.doSomethingBoring();
}

export default {
  isAwesome: true,
};
```

In a unit test (example using MochaJS and SinonJS):

```javascript
import { lazyLoad } from 'weasley';
import weasley from './weasley.js';

// Lazy-load the module to be tested
const awesomeModule = lazyLoad(require.resolve('./awesomeModule.js'), '*');

// Create a mock for a dependency of the module
const myAwesomeMock = {
  doSomethingAwesome: sinon.spy(),
};

describe('awesomeModule', function () {
  before(function () {
    // Override dependency with mock
    weasley.register('my.awesome.dependency', () => myAwesomeMock);
  });

  it('should do something awesome') {
    // ...
  }
});
```

## Lazy-loading vs import/require

When using `lazyLoad` to import a module, it is not actually imported until it is used for the first time. For instance:

```javascript
const awesomeModule = lazyLoad(require.resolve('./awesomeModule.js'));
// `./awesomeModule.js` has not been imported yet.

awesomeModule.doSomethingAwesome();
// `./awesomeModule.js` has now been imported.
```

In unit tests, this behavior allows you to mock dependencies used by the module between the call to `lazyLoad` and the
actual testing of the module.

Also, contrary to using `import` or `require`, if you lazy-load the same module at multiple places in your code, you will
get different copies of the module.

Be aware that lazy-loading uses the `Proxy` feature from ES6, which cannot be polyfilled. This means that `Proxy` must
be available in the JavaScript environment that runs your unit tests for `lazyLoad` to work.

## Documentation

Complete documentation is available [here](https://github.com/plbrault/weasleyjs/blob/master/docs/jsdoc.md).

## License

[MIT](https://github.com/plbrault/weasleyjs/blob/master/LICENSE)
