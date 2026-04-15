const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * POST /api/auth/register
 * Registrar usuario
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: 'Nombre, email y contraseña son obligatorios'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const emailLower = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: emailLower });

    if (existingUser) {
      return res.status(400).json({
        ok: false,
        message: 'Ya existe un usuario con ese email'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: emailLower,
      password: hashedPassword,
      role: 'client'
    });

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      ok: true,
      message: 'Usuario registrado correctamente',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al registrar usuario'
    });
  }
};

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: 'Email y contraseña son obligatorios'
      });
    }

    const emailLower = email.trim().toLowerCase();

    const user = await User.findOne({ email: emailLower });

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: 'Credenciales inválidas'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        ok: false,
        message: 'Credenciales inválidas'
      });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      ok: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al iniciar sesión'
    });
  }
};

/**
 * GET /api/auth/me
 * Obtener usuario autenticado
 * Requiere middleware auth
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado'
      });
    }

    return res.status(200).json({
      ok: true,
      user
    });
  } catch (error) {
    console.error('Error en getMe:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al obtener usuario'
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};