// Convert snake_case to camelCase
export const toCamelCase = (obj: any): any => {
  if (!obj) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item));
  }
  if (typeof obj !== 'object') return obj;
  
  const newObj: any = {};
  Object.keys(obj).forEach(key => {
    const newKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    newObj[newKey] = toCamelCase(obj[key]);
  });
  return newObj;
};

// Convert camelCase to snake_case
export const toSnakeCase = (obj: any): any => {
  if (!obj) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCase(item));
  }
  if (typeof obj !== 'object') return obj;
  
  const newObj: any = {};
  Object.keys(obj).forEach(key => {
    const newKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    newObj[newKey] = toSnakeCase(obj[key]);
  });
  return newObj;
};
