import { z } from 'zod';

export function customMinMax(min: number, max: number) {
  return function (data: string, ctx: z.RefinementCtx) {
    const segmentLength = [...new Intl.Segmenter().segment(data)].length;

    if (segmentLength < min) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `string must contain at least ${min} character(s)`,
      });
    }

    if (segmentLength > max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `string must contain at most ${max} character(s)`,
      });
    }
  };
}
