import { createStore } from './index';
import {
  count,
  initialCounterState,
  counter,
  counterReverse,
  unknownAction
} from './helpers';

describe('createStore', () => {
  test('exposes API', () => {
    const store = createStore(counter);
    expect(store).toHaveProperty('getState');
    expect(store).toHaveProperty('dispatch');
    expect(store).toHaveProperty('subscribe');
    expect(store).toHaveProperty('replaceReducer');
  });

  test('throws if reducer is not a function', () => {
    expect(() => createStore(true)).toThrow(
      'Expected the reducer to be a function.'
    );
  });

  test('initializes state tree', () => {
    const store1 = createStore(counter);
    expect(store1.getState()).toBe(initialCounterState);

    const store2 = createStore(counter, { count: 2 });
    expect(store2.getState()).toEqual({ count: 2 });
  });

  test('throws if action is not a plain object', () => {
    const store = createStore(counter);
    
    function TestConstructor() {} 
    const errorValues = [null, undefined, 'test', [], new TestConstructor()];
    errorValues.forEach((errorValue) => {
      expect(() => store.dispatch(errorValue)).toThrow(
        'Expected the action to be a plain object.'
      );
    });
  });

  test('throws if action.type is undefined', () => {
    const store = createStore(counter);
    expect(() => store.dispatch({})).toThrow(
      'Expected action.type to not be undefined.'
    );
  });

  test('throws if action.type is not a string', () => {
    const store = createStore(counter);
    expect(() => store.dispatch({ type: true })).toThrow(
      'Expected action.type to be a string.'
    );
  });

  test('dispatch applies the reducer to the state tree', () => {
    const store = createStore(counter);
    expect(store.getState()).toBe(initialCounterState);
    store.dispatch(count());
    expect(store.getState()).toEqual({ count: 1 });
    store.dispatch(count());
    expect(store.getState()).toEqual({ count: 2 });
  });

  test('accepts enhancer as the third argument', () => {
    function spyEnhancer(passedCreateStore) {
      return (reducer, preloadedState) => {
        expect(passedCreateStore).toBe(createStore);
        expect(reducer).toBe(counter);
        expect(preloadedState).toBe(initialCounterState);

        const store = passedCreateStore(reducer, preloadedState);
        return {
          ...store,
          dispatch: vi.fn(store.dispatch)
        }
      }
    }

    const store = createStore(counter, initialCounterState, spyEnhancer);
    const action = count();
    store.dispatch(action);
    expect(store.dispatch).toHaveBeenCalledWith(action);
    expect(store.getState()).toEqual({ count: 1});
  });

  test('accepts enhancer as the second argument if no preloaded state is given', () => {
    function spyEnhancer(passedCreateStore) {
      return (reducer, preloadedState) => {
        expect(passedCreateStore).toBe(createStore);
        expect(reducer).toBe(counter);
        expect(preloadedState).toBe(undefined);

        const store = passedCreateStore(reducer, preloadedState);
        return {
          ...store,
          dispatch: vi.fn(store.dispatch)
        }
      }
    }

    const store = createStore(counter, spyEnhancer);
    const action = count();
    store.dispatch(action);
    expect(store.dispatch).toHaveBeenCalledWith(action);
    expect(store.getState()).toEqual({ count: 1 });
  });

  test('throws if enhancer is not a function', () => {
    expect(() => createStore(counter, initialCounterState, null)).toThrow(
      'Expected the enhancer to be a function.'
    );
  });

  test('invokes only current listeners with every dispatch', () => {
    const store = createStore(counter);
    
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    const listener3 = vi.fn();

    store.subscribe(listener1);
    
    let listener3IsSubscribed = false;
    store.subscribe(() => {
      if (!listener3IsSubscribed) {
        store.subscribe(listener3);
        listener3IsSubscribed = true;
      }

      listener2();
    });

    store.dispatch(unknownAction());
    expect(listener1.mock.calls.length).toBe(1);
    expect(listener2.mock.calls.length).toBe(1);
    expect(listener3.mock.calls.length).toBe(0);

    store.dispatch(unknownAction());
    expect(listener1.mock.calls.length).toBe(2);
    expect(listener2.mock.calls.length).toBe(2);
    expect(listener3.mock.calls.length).toBe(1);
  });

  test('removes listener when unsubscribe is called', () => {
    const store = createStore(counter);
    
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    const unsubscribe1 = store.subscribe(listener1);
    store.subscribe(listener2);

    store.dispatch(unknownAction());
    expect(listener1.mock.calls.length).toBe(1);
    expect(listener2.mock.calls.length).toBe(1);

    unsubscribe1();
    store.dispatch(unknownAction());
    expect(listener1.mock.calls.length).toBe(1);
    expect(listener2.mock.calls.length).toBe(2);
  });

  test('supports unsubscribing from within a listener', () => {
    const store = createStore(counter);
    
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    const unsubscribe1 = store.subscribe(listener1);
    store.subscribe(() => {
      listener2();
      unsubscribe1();
    });

    store.dispatch(unknownAction());
    expect(listener1.mock.calls.length).toBe(1);
    expect(listener2.mock.calls.length).toBe(1);

    store.dispatch(unknownAction());
    expect(listener1.mock.calls.length).toBe(1);
    expect(listener2.mock.calls.length).toBe(2);
  });

  test('nested dispatches invoke current listeners', () => {
    const store = createStore(counter);

    const listener1 = vi.fn();
    const listener2 = vi.fn();
    const listener3 = vi.fn();

    const unsubscribe1 = store.subscribe(() => {
      listener1();
      expect(listener1.mock.calls.length).toBe(1);
      expect(listener2.mock.calls.length).toBe(0);
      expect(listener3.mock.calls.length).toBe(0);

      unsubscribe1();
      store.subscribe(listener3);
      store.dispatch(unknownAction());
      expect(listener1.mock.calls.length).toBe(1);
      expect(listener2.mock.calls.length).toBe(1);
      expect(listener3.mock.calls.length).toBe(1);
    });
    store.subscribe(listener2);

    store.dispatch(unknownAction());
    expect(listener1.mock.calls.length).toBe(1);
    expect(listener2.mock.calls.length).toBe(2);
    expect(listener3.mock.calls.length).toBe(1);
  });

  test('throws if listener is not a function', () => {
    const store = createStore(counter);
    expect(() => store.subscribe(null)).toThrow(
      'Expected the listener to be a function.'
    );
  });

  test('throws if nextReducer is not a function', () => {
    const store = createStore(counter);
    expect(() => store.replaceReducer(null)).toThrow(
      'Expected the next reducer to be a function.'
    );
  });

  test('replaces reducer and preserves state', () => {
    const store = createStore(counter);
    store.dispatch(count());
    expect(store.getState()).toEqual({ count : 1 });
    store.replaceReducer(counterReverse);
    expect(store.getState()).toEqual({ count : 1 });
    store.dispatch(count());
    expect(store.getState()).toEqual({ count : 0 });
  });
});
