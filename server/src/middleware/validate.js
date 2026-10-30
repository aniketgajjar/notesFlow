import { HttpError } from '../utils/HttpError.js';

export function validate(schema, target = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }));
      return next(new HttpError(400, 'Validation failed', errors));
    }
    if (target === 'query') req.validatedQuery = result.data;
    else req[target] = result.data;
    next();
  };
}
