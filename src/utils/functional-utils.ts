// utils/functional.ts
export const pipe = <T>(
  initialValue: T,
  ...functions: Array<(value: T) => T>
): T => {
  return functions.reduce((value, func) => func(value), initialValue);
};

export const compose =
  <T>(...functions: Array<(value: T) => T>) =>
  (initialValue: T): T =>
    pipe(initialValue, ...functions.reverse());
