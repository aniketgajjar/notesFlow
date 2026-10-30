import jwt from 'jsonwebtoken';
import { getConfig } from '../config/env.js';
import { User } from '../models/User.js';
import { HttpError } from '../utils/HttpError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, _res, next) => {
  const config = getConfig();
  const token = req.cookies?.[config.COOKIE_NAME];
  if (!token) throw new HttpError(401, 'Authentication required');

  let payload;
  try {
    payload = jwt.verify(token, config.JWT_SECRET);
  } catch {
    throw new HttpError(401, 'Invalid or expired session');
  }

  const user = await User.findById(payload.sub).select('_id name email');
  if (!user) throw new HttpError(401, 'Invalid or expired session');
  req.user = user;
  next();
});
