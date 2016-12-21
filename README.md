WeasleyJS
=================================================================================================

This is a JavaScript dependency injection container so tremendously simple, it might actually not
deserve to be called a dependency injection container. It is more like a runtime dependency resolver.
Its primary use-case is to make everything easily mockable for testing purposes. 

This is a work in progress. It is recommended not to use it in production for now.


## Setup

```
npm install weasley
```

Currently, this package only supports projects that have Babel set up for ES6 functionnality. 
I will not apologize, because as I already mentioned, it is a work in progress.


## Usage

In your own `weasley.js` module:

```
import Weasley from 'weasley';

const weasley = new Weasley();
export default weasley;

weasley.register('my.awesome.dependency', () => require('awesomeDependency'));
weasley.register('my.boring.dependency', () => require('boringDependency'));
weasley.register('my.awesome.module', () => require('./awesomeModule.js'));
```

In another module (e.g. `awesomeModule.js`):

```
import weasley from './weasley.js';

const awesomeDependency = weasley.container.my.awesome.dependency;
const boringDependency = weasley.container.my.boring.dependency;

export default () => {
  awesomeDependency.doSomethingAwesome();
  boringDependency.doSomethingBoring();
}
```

In a unit test:

```
import weasley from './weasley.js';

const myAwesomeMock = {
  doSomethingAwesome: function () {
    // Pretend to do something awesome
  }
};

// And kids... that's how you inject your mocked dependency!
weasley.register('my.awesome.dependency', myAwesomeMock);

import awesomeModule from './awesomeModule.js'; // Import module to be tested

// Tests go here
```

## License

MIT.
