import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { getConfig } from '../config/env.js';
import { HttpError } from '../utils/HttpError.js';

function cookieOptions() {
  const config = getConfig();
  const [, amount, unit] = config.JWT_EXPIRES_IN.match(/^([1-9]\d*)([smhd])$/);
  const millisecondsPerUnit = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return {
    httpOnly: true,
    secure: config.NODE_ENV === 'production' || config.COOKIE_SAME_SITE === 'none',
    sameSite: config.COOKIE_SAME_SITE,
    path: '/',
    ...(config.COOKIE_DOMAIN ? { domain: config.COOKIE_DOMAIN } : {}),
    maxAge: Number(amount) * millisecondsPerUnit[unit],
  };
}

function issueSession(user, res) {
  const config = getConfig();
  const token = jwt.sign({ sub: user.id }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
  res.cookie(config.COOKIE_NAME, token, cookieOptions());
}

export async function register(req, res) {
  const { name, email, password } = req.body;
  const existingUser = await User.exists({ email });
  if (existingUser) throw new HttpError(409, 'An account with this email already exists');

  const user = await User.create({ name, email, password });
  issueSession(user, res);
  res.status(201).json({ success: true, message: 'Account created successfully', data: { user: user.toJSON() } });
}

export async function login(req, res) {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new HttpError(401, 'Email or password is incorrect');
  }
  issueSession(user, res);
  res.json({ success: true, message: 'Signed in successfully', data: { user: user.toJSON() } });
}

export function currentUser(req, res) {
  res.json({ success: true, data: { user: req.user.toJSON() } });
}

export function logout(_req, res) {
  const config = getConfig();
  const options = cookieOptions();
  delete options.maxAge;
  res.clearCookie(config.COOKIE_NAME, options);
  res.json({ success: true, message: 'Signed out successfully', data: {} });
}
