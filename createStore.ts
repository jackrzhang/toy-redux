const INIT = 'INIT\\' + Math.random.toString();

export default function createStore(
  reducer,
  preloadedState?,
  enhancer?
) {
  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.');
  }

  if (typeof preloadedState === 'function' && enhancer === undefined) {
    enhancer = preloadedState;
    preloadedState = undefined;
  }

  if (enhancer !== undefined) {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.');
    }

    return enhancer(createStore)(reducer, preloadedState);
  }

  let currentReducer = reducer;
  let currentState = preloadedState;
  let listeners = new Map();
  let listenerIdCounter = 0;

  function getState() {
    return currentState;
  }

  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error('Expected the action to be a plain object.');
    }

    if (action.type === undefined) {
      throw new Error('Expected action.type to not be undefined.');
    }

    if (typeof action.type !== 'string') {
      throw new Error('Expected action.type to be a string.');
    }

    currentState = currentReducer(currentState, action);

    listeners.forEach((listener) => {
      listener();
    });

    return action;
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.');
    }

    const listenerId = listenerIdCounter++;
    listeners.set(listenerId, listener);

    return () => {
      listeners.delete(listenerId);
    }
  }

  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the next reducer to be a function.');
    }

    currentReducer = nextReducer;
  }

  dispatch({ type: INIT });
  
  return {
    getState,
    dispatch,
    subscribe,
    replaceReducer
  };
}

function isPlainObject(value) {
  if (value == null) return false;

  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}