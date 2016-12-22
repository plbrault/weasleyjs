WeasleyJS
=================================================================================================

This is a JavaScript dependency injection container so tremendously simple, it might actually not
deserve to be called a dependency injection container. It is more like a runtime dependency resolver.
Its primary use-case is to make everything easily mockable for testing purposes. 

This is a work in progress, and might still contain a few bugs. Be aware that future releases might
not follow strict [semver](http://semver.org/) until version `1.0.0` is reached.


## Setup

```
npm install weasley
```


## Usage

Create a `weasley.js` module:

```
import Weasley from 'weasley';

const weasley = new Weasley();
export default weasley;

weasley.register('my.awesome.dependency', () => require('awesomeDependency'));
weasley.register('my.boring.dependency', () => require('boringDependency'));
weasley.register('my.awesome.module', () => require('./awesomeModule.js'));
```

Import from another module (e.g. `awesomeModule.js`):

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
import awesomeModule from './awesomeModule.js'; // The module to be tested
import weasley from './weasley.js';

const myAwesomeMock = {
  doSomethingAwesome: sinon.spy(),
};

describe('awesomeModule', function () {
  before(function () {
    // Override dependency with mock
    weasley.register('my.awesome.dependency', () => consoleMock);
  });

  it('should do something awesome') {
    // ...
  } 

  afterEach(function () {
    consoleMock.log.reset();
  });
});
```

### Calling `new`

If you have to call the `new` operator on a dependency imported by Weasley, add `.new` at the end
of the imported object:

```
import weasley from './weasley.js';

const amazingDependency = weasley.container.my.amazing.dependency.new;

const amazingObject = new amazingDependency();
```


## License

MIT.
