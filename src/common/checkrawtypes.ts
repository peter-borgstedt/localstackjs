export const isString = (entity: unknown): boolean => {
  return typeof entity === 'string';
};

export const isNumber = (entity: unknown): boolean => {
  return typeof entity === 'number';
};

export const isObject = (entity: unknown): boolean => {
  return entity === Object(entity); // Also checks function-objects
};

export const isDate = (entity: unknown): boolean => {
  return entity && Object.prototype.toString.call(entity) === '[object Date]' && !isNaN(entity as number);
};
