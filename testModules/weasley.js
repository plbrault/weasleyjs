import Weasley from '../src';

const weasley = new Weasley();
weasley.register('sample.dependency', () => require('./sampleDependency'));
export default weasley;
