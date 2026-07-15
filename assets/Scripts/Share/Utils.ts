export const deepClone = (obj: any) => {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }
  
    const res = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        res[key] = deepClone(obj[key]);
      }
    }
  
    return res;
  };