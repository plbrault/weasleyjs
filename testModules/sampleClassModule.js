import weasley from './weasley';

const someDependency = weasley.container.sample.dependency;

export default class {
  constructor() {
    this.albusQuote = someDependency.speak();
    this.constructorArgs = arguments; // eslint-disable-line prefer-rest-params
  }
}
