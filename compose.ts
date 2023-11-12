export default function compose(...fns) {
  return function(initialValue) {
    let result = initialValue;
    for (let i = fns.length - 1; i > -1; i--) {
      result = fns[i](result);
    }
    return result;
  }
}