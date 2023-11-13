export default function compose(...fns) {
  return function(...initialValues) {
    if (fns.length === 0) {
      return initialValues[0];
    }

    let result = fns[fns.length - 1](...initialValues);
    for (let i = fns.length - 2; i > -1; i--) {
      result = fns[i](result);
    }
    return result;
  }
}