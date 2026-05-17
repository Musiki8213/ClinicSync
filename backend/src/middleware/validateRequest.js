import { validationResult } from 'express-validator';

export function validateRequest(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const message = result
      .array({ onlyFirstError: false })
      .map((e) => e.msg)
      .join('; ');
    return res.status(400).json({ message });
  }
  next();
}
