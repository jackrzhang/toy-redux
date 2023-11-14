import { createStore, applyMiddleware } from './index';
import {
  count,
  counter,
  countAsync,
  FULFILLED,
  PENDING,
  asyncCounter,
  thunk
} from './helpers';

describe('applyMiddleware', () => {
  test('enhances dispatch and passes middleware API once', () => {
    const spy = vi.fn();
    const testMiddleware = (middlewareAPI) => {
      spy(middlewareAPI);
      return (next) => (action) => next(action);
    }
    
    const store = applyMiddleware(testMiddleware)(createStore)(counter);
    expect(store.dispatch).not.toBe(createStore(counter).dispatch);

    store.dispatch(count());
    store.dispatch(count());

    expect(spy.mock.calls.length).toBe(1)
    expect(spy.mock.calls[0][0].getState).toBe(store.getState);
    expect(spy.mock.calls[0][0]).toHaveProperty('dispatch');

    expect(store.getState()).toEqual({ count: 2 });
  });

  test('middleware chain', () => {
    const spy = vi.fn();
    const testMiddleware = () => (next) => (action) => {
      spy(action);
      return next(action);
    }
    
    const store = createStore(counter, applyMiddleware(testMiddleware, testMiddleware));
    store.dispatch(count());

    expect(spy.mock.calls.length).toBe(2);
  });

  test('asynchronous middleware (thunk)', async () => {
    const store = createStore(asyncCounter, applyMiddleware(thunk));
    const promise = store.dispatch(countAsync());
    expect(store.getState()).toEqual({
      count: 0,
      status: PENDING
    });

    await promise;
    expect(store.getState()).toEqual({
      count: 1,
      status: FULFILLED
    });
  });

  test('multiple arguments to middleware dispatch calls are passed through', () => {
    const spy = vi.fn();
    const extraArgs = ['foo', 'bar'];
    const testMiddleware = () => (next) => (action, ...args) => {
      spy(...args);
      return next(action);
    };

    const store = createStore(counter, applyMiddleware(testMiddleware));
    store.dispatch(count(), ...extraArgs);

    expect(spy.mock.calls[0]).toEqual(extraArgs);
  });

  test('throws if dispatch is called while constructing middleware', () => {
    const dispatchingMiddleware = ({ dispatch }) => {
      dispatch();
      return (next) => (action) => next(action);
    }

    expect(() => createStore(counter, applyMiddleware(dispatchingMiddleware))).toThrow(
      'Can not dispatch while constructing middleware.'
    );
  });
});