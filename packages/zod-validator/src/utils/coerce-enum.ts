import { z } from 'zod';

export const coerceEnum = (schema) => {
  return z.preprocess((val) => {
    if (typeof val === 'string' || typeof val === 'number') {
      return Number(val);
    }
    return val;
  }, schema);
};
