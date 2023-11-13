import { compose } from './index';

const add = (x, y) => x + y;
const add2 = (x) => x + 2;
const multiplyBy2 = (x) => x * 2;

describe('compose', () => {
  test('returns a function', () => {
    const fn = compose(add2);
    expect(typeof fn).toBe('function');
  });

  test('returns the first given argument if given no functions', () => {
    expect(compose()()).toBe(undefined);
    expect(compose()(2)).toBe(2);
    expect(compose()(1, 2)).toBe(1);
  });
  
  test('one function', () => {
    expect(compose(add2)(1)).toBe(3);
  });

  test('right-most function can accept multiple parameters', () => {
    expect(compose(add)(1, 2)).toBe(3);
  });

  test('multiple functions', () => {
    expect(compose(multiplyBy2, add2)(1)).toBe(6);
    expect(compose(add2, multiplyBy2)(1)).toBe(4);
    expect(compose(multiplyBy2, add)(1, 2)).toBe(6);
  });

  test('throws if given an argument that is not a function', () => {
    expect(() => {
      compose(undefined)(1);
    }).toThrow();

    expect(() => {
      compose('string', add2)(1);
    }).toThrow();
  })
});