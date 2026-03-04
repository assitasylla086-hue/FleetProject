/**
 * @file authService.js
 * @description Service d'authentification — gère l'inscription et la connexion des utilisateurs.
 * Toute la logique métier et les requêtes SQL sont isolées ici,
 * les controllers se contentent d'appeler ces fonctions.
 */

const pool = require('../db');
const bcrypt = require('bcrypt');

/** Nombre de rounds pour le hachage bcrypt */
const SALT_ROUNDS = 10;

/**
 * Inscrit un nouvel utilisateur en base de données.
 * Hache le mot de passe avant insertion.
 *
 * @param {string} email    - Adresse email unique de l'utilisateur
 * @param {string} password - Mot de passe en clair (sera haché)
 * @returns {Promise<{id: number, email: string}>} L'utilisateur créé (sans mot de passe)
 * @throws {Error} code 23505 si l'email est déjà utilisé
 */
async function register(email, password) {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await pool.query(
    `INSERT INTO users(email, password)
     VALUES($1, $2)
     RETURNING id, email`,
    [email, hashedPassword]
  );

  return result.rows[0];
}

/**
 * Authentifie un utilisateur en vérifiant son email et son mot de passe.
 *
 * @param {string} email    - Adresse email de l'utilisateur
 * @param {string} password - Mot de passe en clair à vérifier
 * @returns {Promise<{id: number, email: string}>} L'utilisateur authentifié (sans mot de passe)
 * @throws {Error} Si l'utilisateur n'existe pas ou si le mot de passe est incorrect
 */
async function login(email, password) {
  // Recherche de l'utilisateur par email
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    const err = new Error('Utilisateur non trouvé');
    err.statusCode = 400;
    throw err;
  }

  const user = result.rows[0];

  // Comparaison du mot de passe avec le hash stocké
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error('Mot de passe incorrect');
    err.statusCode = 400;
    throw err;
  }

  // Retourne les données publiques uniquement (pas le mot de passe)
  return { id: user.id, email: user.email };
}

module.exports = { register, login };