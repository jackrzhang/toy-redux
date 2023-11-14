// Helpers for testing

// Action types 

const COUNT = 'COUNT';

const START_ASYNC = 'START_ASYNC';
const FINISH_ASYNC = 'FINISH_ASYNC';

const UNKNOWN_ACTION = 'UNKNOWN_ACTION';

// Action creators

export function count() {
  return { type: COUNT };
}

export function countAsync() {
  return (dispatch) => {
    dispatch(startAsync());
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        dispatch(finishAsync());
        resolve();
      }, 0);
    });
  }
}

function startAsync() {
  return { type: START_ASYNC };
}

function finishAsync() {
  return { type: FINISH_ASYNC };
}

export function unknownAction() {
  return { type: UNKNOWN_ACTION };
}

// Reducers

export const initialCounterState = { count : 0 };

export function counter(state = initialCounterState, action) {
  switch (action.type) {
    case COUNT:
      return { count: state.count + 1 };
    default:
      return state;
  }
}

export function counterReverse(state = initialCounterState, action) {
  switch (action.type) {
    case COUNT:
      return { count: state.count - 1 };
    default:
      return state;
  }
}

export const FULFILLED = 'FULFILLED';
export const PENDING = 'PENDING';
export const initialAsyncCounterState = { 
  count: 0,
  status: FULFILLED,
}

export function asyncCounter(state = initialAsyncCounterState, action) {
  switch (action.type) {
    case START_ASYNC:
      return {
        ...state,
        status: PENDING
      }
    case FINISH_ASYNC:
      return {
        count: state.count + 1,
        status: FULFILLED
      }
    default:
      return state;
  }
}

// Middleware

export function thunk({ dispatch, getState }) {
  return (next) => (action) => {
    if (typeof action === 'function') {
      return action(dispatch, getState);
    }

    return next(action);
  }
}