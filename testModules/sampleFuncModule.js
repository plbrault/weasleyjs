import weasley from './weasley';

const someDependency = weasley.container.sample.dependency;

export default function () {
  return {
    albusQuote: someDependency.speak(),
    passedArgs: arguments, // eslint-disable-line prefer-rest-params
  };
}
