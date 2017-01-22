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

```
import Weasley from 'weasley';

const weasley = new Weasley();

weasley.register('my.awesome.dependency', () => require('awesomeDependency'));
weasley.register('my.boring.dependency', () => require('boringDependency'), 'someNamedExport');
weasley.register('my.awesome.module', () => require('./awesomeModule.js'), '*'); // Don't use default export

export default weasley;
```

Import your `weasley.js` module from another module (e.g. `awesomeModule.js`):

```
import weasley from './weasley.js';

const awesomeDependency = weasley.container.my.awesome.dependency;
const boringDependency = weasley.container.my.boring.dependency;

export default () => {
  awesomeDependency.doSomethingAwesome();
  boringDependency.doSomethingBoring();
}
```

In a unit test (example using MochaJS and SinonJS):

```
import { lazyLoad } from 'weasley';
import weasley from './weasley.js';

// Lazy-load the module to be tested
const awesomeModule = lazyLoad(require.resolve('./awesomeModule.js')).asObject;

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


## Documentation

Complete documentation is available [here](https://github.com/plbrault/weasleyjs/blob/master/docs/jsdoc.md).


## License

[MIT](https://github.com/plbrault/weasleyjs/blob/master/LICENSE)
