import compose from './compose';

export default function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, preloadedState?) => {
    const store = createStore(reducer, preloadedState);

    let dispatch = () => {
      throw new Error("Can not dispatch while constructing middleware.");
    }

    const middlewareAPI = {
      getState: store.getState,
      // Use a closure to delay binding to the final dispatch
      dispatch: (action, ...args) => dispatch(action, ...args)
    };

    const middlewareChain = middlewares.map((middleware) => middleware(middlewareAPI));
    dispatch = compose(...middlewareChain)(store.dispatch);

    // Without calling compose:
    // let dispatch = store.dispatch;
    // ... 
    // for (let i = middlewares.length - 1; i >= 0; i--) {
    //   dispatch = middlewares[i](middlewareAPI)(dispatch);
    // }

    return {
      ...store,
      dispatch
    };
  };
}

