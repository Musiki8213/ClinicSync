import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { Patient } from '../models/Patient.js';
import { signToken } from '../utils/jwt.js';

function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

function userPayload(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }
    const { name, password, age, gender } = req.body;
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return res.status(400).json({ message: 'Valid email is required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: 'patient',
    });
    await Patient.create({
      user: user._id,
      name,
      age: age ?? undefined,
      gender: gender || 'prefer_not_say',
    });
    const token = signToken({ userId: user._id.toString(), role: user.role });
    res.status(201).json({
      token,
      user: userPayload(user),
    });
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return res.status(400).json({ message: 'Valid email is required' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = signToken({ userId: user._id.toString(), role: user.role });
    res.json({
      token,
      user: userPayload(user),
    });
  } catch (e) {
    next(e);
  }
}

export async function me(req, res) {
  res.json({
    user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role },
  });
}
