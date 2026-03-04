/**
 * @file vehicleService.js
 * @description Service de gestion des véhicules.
 * Contient toute la logique métier et les requêtes SQL liées aux véhicules.
 * Appelé par vehicleController.js.
 */

const pool = require('../db');

/**
 * Récupère la liste complète de tous les véhicules, triée par ID croissant.
 *
 * @returns {Promise<Array<{id: number, name: string, plate_number: string}>>}
 */
async function getAllVehicles() {
  const result = await pool.query(
    `SELECT id, name, plate_number
     FROM vehicles
     ORDER BY id ASC`
  );
  return result.rows;
}

/**
 * Récupère un véhicule unique par son identifiant.
 *
 * @param {number} id - Identifiant du véhicule
 * @returns {Promise<{id: number, name: string, plate_number: string} | null>}
 *          Le véhicule trouvé, ou null s'il n'existe pas
 */
async function getVehicleById(id) {
  const result = await pool.query(
    `SELECT id, name, plate_number
     FROM vehicles
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Crée un nouveau véhicule en base de données.
 *
 * @param {string} name         - Nom du véhicule (ex: "Camion Nord")
 * @param {string} plate_number - Plaque d'immatriculation (ex: "AB-123-CD")
 * @returns {Promise<{id: number, name: string, plate_number: string}>} Le véhicule créé
 */
async function createVehicle(name, plate_number) {
  const result = await pool.query(
    `INSERT INTO vehicles(name, plate_number)
     VALUES($1, $2)
     RETURNING id, name, plate_number`,
    [name, plate_number]
  );
  return result.rows[0];
}

/**
 * Met à jour le nom et/ou la plaque d'un véhicule existant.
 *
 * @param {number} id           - Identifiant du véhicule à modifier
 * @param {string} name         - Nouveau nom du véhicule
 * @param {string} plate_number - Nouvelle plaque d'immatriculation
 * @returns {Promise<{id: number, name: string, plate_number: string} | null>}
 *          Le véhicule mis à jour, ou null s'il n'existe pas
 */
async function updateVehicle(id, name, plate_number) {
  const result = await pool.query(
    `UPDATE vehicles
     SET name = $1, plate_number = $2
     WHERE id = $3
     RETURNING id, name, plate_number`,
    [name, plate_number, id]
  );
  return result.rows[0] || null;
}

/**
 * Supprime un véhicule et toutes ses positions GPS associées.
 * La suppression des positions se fait en premier pour respecter
 * la contrainte de clé étrangère (vehicle_id → vehicles.id).
 *
 * @param {number} id - Identifiant du véhicule à supprimer
 * @returns {Promise<{id: number, name: string, plate_number: string} | null>}
 *          Le véhicule supprimé, ou null s'il n'existait pas
 */
async function deleteVehicle(id) {
  // Suppression en cascade manuelle des positions liées
  await pool.query(
    `DELETE FROM positions WHERE vehicle_id = $1`,
    [id]
  );

  // Suppression du véhicule lui-même
  const result = await pool.query(
    `DELETE FROM vehicles
     WHERE id = $1
     RETURNING id, name, plate_number`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};