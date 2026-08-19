const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '7d'
  });
};

const getDemoUsers = () => global.__demoStore?.users || [];

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    if (global.__demoMode) {
      const users = getDemoUsers();
      const existingUser = users.find((user) => user.email === email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const newUser = {
        _id: `user-${Date.now()}`,
        name,
        email,
        password: await bcrypt.hash(password, 10),
        cart: []
      };

      users.push(newUser);
      return res.status(201).json({
        message: 'User registered successfully',
        user: { id: newUser._id, name: newUser.name, email: newUser.email },
        token: generateToken(newUser._id)
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    return res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email },
      token: generateToken(user._id)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (global.__demoMode) {
      const users = getDemoUsers();
      const user = users.find((entry) => entry.email === email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      return res.json({
        message: 'Login successful',
        user: { id: user._id, name: user.name, email: user.email },
        token: generateToken(user._id)
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email },
      token: generateToken(user._id)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Login failed' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    if (global.__demoMode) {
      const user = (global.__demoStore?.users || []).find((entry) => entry._id === req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({ user: { id: user._id, name: user.name, email: user.email } });
    }

    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Could not fetch user' });
  }
};

module.exports = { registerUser, loginUser, getCurrentUser };
