/**
 * @file authController.js
 * @description Contrôleur d'authentification.
 * Valide les entrées HTTP et délègue la logique métier à authService.
 */

const authService = require('../services/authService');

/**
 * POST /api/auth/register
 * Crée un nouveau compte utilisateur.
 * @param {import('express').Request}  req - { email, password }
 * @param {import('express').Response} res
 */
exports.register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email et mot de passe requis' });

  try {
    const user = await authService.register(email, password);
    res.status(201).json(user);
  } catch (err) {
    // Code PostgreSQL : violation de contrainte UNIQUE (email déjà pris)
    if (err.code === '23505')
      return res.status(400).json({ message: 'Email déjà utilisé' });
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/auth/login
 * Authentifie un utilisateur existant.
 * @param {import('express').Request}  req - { email, password }
 * @param {import('express').Response} res
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email et mot de passe requis' });

  try {
    const user = await authService.login(email, password);
    res.json(user);
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ message: err.message });
  }
};