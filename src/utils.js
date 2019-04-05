import { reduce, get, isObject } from 'lodash';

export const mergeDeepObjects = (data, newData) => {
  const mergedData = reduce(
    newData,
    (result, value, key) => {
      if (isObject(value)) {
        const initialValue = get(data, key, {});
        const mergedValues = reduce(
          value,
          (result, valueOfValue, key) => {
            if (isObject(valueOfValue)) {
              const valueOfInitialValue = get(initialValue, key);
              if (isObject(valueOfInitialValue)) {
                result[key] = mergeDeepObjects(
                  valueOfInitialValue,
                  valueOfValue,
                );
                return result;
              }
              result[key] = valueOfValue;
              return result;
            }
            result[key] = valueOfValue;
            return result;
          },
          {},
        );
        const mergedValue = { ...initialValue, ...mergedValues };
        result[key] = mergedValue;
        return result;
      }
      result[key] = value;
      return result;
    },
    {},
  );
  return { ...data, ...mergedData };
};
