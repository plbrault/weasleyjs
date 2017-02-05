WeasleyJS
=================================================================================================

This is a JavaScript dependency injection container so tremendously simple, it might actually not
deserve to be called a dependency injection container. It serves at least two purposes:

  1) Avoiding direct coupling between modules and their dependencies  
  2) Making everything easily mockable for testing  

This is a work in progress, and might still contain a few bugs. Be aware that future releases might
not follow strict [semver](http://semver.org/) until version `1.0.0` is reached.


## Setup

```
npm install weasley
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
const awesomeModule = lazyLoad(require.resolve('./awesomeModule.js'));

// Create a mock for a dependency of the module
const myAwesomeMock = {
  doSomethingAwesome: sinon.spy(),
};

describe('awesomeModule', function () {
  before(function () {
    // Create a snapshot of current dependencies
    weasley.snapshot();

    // Override dependency with mock
    weasley.register('my.awesome.dependency', () => myAwesomeMock);
  });

  after(function () {
    // Revert to snapshot
    weasley.revert();
  });

  it('should do something awesome') {
    // ...
  } 

  afterEach(function () {
    myAwesomeMock.log.reset();
  });
});
```


## Lazy-loading and the `new` operator

When lazy-loading a dependency, you cannot call the `new` operator on it. Instead, you have to use the `New` function from the library:

```javascript
import { lazyLoad, New } from 'weasley';
import weasley from './weasley.js';

const awesomeClass = lazyLoad(require.resolve('./awesomeClass.js'));

const awesomeInstance = New(awesomeClass);
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


## Documentation

Complete documentation is available [here](https://github.com/plbrault/weasleyjs/blob/master/docs/jsdoc.md).


## License

[MIT](https://github.com/plbrault/weasleyjs/blob/master/LICENSE)
