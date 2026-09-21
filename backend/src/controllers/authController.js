import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middleware/authMiddleware.js';

// Pre-configured investigation officers for MVP / RBAC
const usersDB = [
  {
    id: 'user-001',
    username: 'investigator',
    email: 'investigator@forensix.gov.in',
    password: 'password123', // In production, bcrypt hash
    name: 'Inspector Vijay Kumar',
    role: 'INVESTIGATOR',
    badgeNumber: 'CYBER-8842'
  },
  {
    id: 'user-002',
    username: 'admin',
    email: 'admin@forensix.gov.in',
    password: 'adminpassword',
    name: 'Senior Analyst Neha Sharma',
    role: 'ADMIN',
    badgeNumber: 'CYBER-0001'
  }
];

export const register = (req, res) => {
  try {
    const { username, email, password, name, badgeNumber, role } = req.body;

    if (!username || !email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Full name, username, email, and password are required.' });
    }

    const existingUser = usersDB.find(
      u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Username or Email is already registered.' });
    }

    const newUser = {
      id: `user-${Date.now()}`,
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      name: name.trim(),
      role: role || 'INVESTIGATOR',
      badgeNumber: badgeNumber || `CYBER-${Math.floor(1000 + Math.random() * 9000)}`
    };

    usersDB.push(newUser);

    const tokenPayload = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      badgeNumber: newUser.badgeNumber
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    return res.status(201).json({
      success: true,
      token,
      user: tokenPayload,
      message: 'Account created successfully'
    });
  } catch (err) {
    console.error('Error in register:', err);
    return res.status(500).json({ success: false, error: 'Internal server error during registration' });
  }
};

export const login = (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username/Email and password are required' });
    }

    const user = usersDB.find(
      u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()
    );

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid username/email or password' });
    }

    const tokenPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name,
      badgeNumber: user.badgeNumber
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    return res.json({
      success: true,
      token,
      user: tokenPayload
    });
  } catch (err) {
    console.error('Error in login:', err);
    return res.status(500).json({ success: false, error: 'Internal server error during authentication' });
  }
};

export const getMe = (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
};
