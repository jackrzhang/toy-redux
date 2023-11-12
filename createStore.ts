export default function createStore(
  reducer,
  preloadedState,
  enhancer
) {
  let currentReducer = reducer;
  let currentState = preloadedState;
  let listeners = new Map();
  let listenerIdCounter = 0;

  function getState() {
    return currentState;
  }

  function dispatch(action) {
    // check if action is plain object

    // check that action.type is not undefined

    // check that action.type is a string

    currentState = currentReducer(currentState, action);

    listeners.forEach((listener) => {
      listener();
    });
  }

  function subscribe(listener) {
    const listenerId = listenerIdCounter++;
    listeners.set(listenerId, listener);

    return () => {
      listeners.delete(listenerId);
    }
  }

  function replaceReducer(nextReducer) {
    // check that nextReducer is a function

    currentReducer = nextReducer;
  }
  
  return {
    getState,
    dispatch,
    subscribe,
    replaceReducer
  };
}