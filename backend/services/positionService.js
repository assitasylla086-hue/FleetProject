/**
 * @file positionService.js
 * @description Service de gestion des positions GPS.
 * Exploite les fonctions PostGIS pour le stockage et la recherche géographique.
 *
 * Fonctions PostGIS utilisées :
 *  - ST_SetSRID / ST_Point    : création d'un point géographique (SRID 4326 = WGS84)
 *  - ST_X / ST_Y              : extraction longitude/latitude depuis une géographie
 *  - ST_DWithin               : filtre les points dans un rayon donné (en mètres)
 *  - ST_Distance              : calcule la distance réelle entre deux points (en mètres)
 *  - <->                      : opérateur de distance approximative (pour ORDER BY rapide)
 */

const pool = require('../db');

/**
 * Récupère toutes les positions GPS enregistrées, jointes avec le nom du véhicule.
 * Triées par date croissante pour permettre le tracé de trajets (polyline).
 *
 * @returns {Promise<Array<{
 *   id: number,
 *   vehicle_id: number,
 *   name: string,
 *   plate_number: string,
 *   latitude: number,
 *   longitude: number,
 *   created_at: string
 * }>>}
 */
async function getAllPositions() {
  const result = await pool.query(`
    SELECT
      p.id,
      p.vehicle_id,
      v.name,
      v.plate_number,
      ST_Y(p.location::geometry) AS latitude,
      ST_X(p.location::geometry) AS longitude,
      p.created_at
    FROM positions p
    JOIN vehicles v ON v.id = p.vehicle_id
    ORDER BY p.created_at ASC
  `);
  return result.rows;
}

/**
 * Enregistre une nouvelle position GPS pour un véhicule donné.
 * Utilise ST_SetSRID + ST_Point pour créer le point en WGS84 (SRID 4326).
 *
 * @param {number} vehicle_id - Identifiant du véhicule
 * @param {number} latitude   - Latitude en degrés décimaux (ex: 5.36)
 * @param {number} longitude  - Longitude en degrés décimaux (ex: -4.01)
 * @returns {Promise<{id: number, vehicle_id: number, created_at: string}>} Position créée
 */
async function addPosition(vehicle_id, latitude, longitude) {
  const result = await pool.query(
    `INSERT INTO positions(vehicle_id, location)
     VALUES($1, ST_SetSRID(ST_Point($2, $3), 4326))
     RETURNING id, vehicle_id, created_at`,
    [vehicle_id, longitude, latitude] // ST_Point attend (longitude, latitude)
  );
  return result.rows[0];
}

/**
 * Recherche géographique — Véhicules dans un rayon donné autour d'un point.
 *
 * Utilise ST_DWithin avec le type GEOGRAPHY pour un calcul en mètres réels
 * (prend en compte la courbure de la Terre, contrairement à GEOMETRY).
 * DISTINCT ON (vehicle_id) retourne uniquement la dernière position de chaque véhicule.
 *
 * @param {number} latitude  - Latitude du point de référence
 * @param {number} longitude - Longitude du point de référence
 * @param {number} radius_km - Rayon de recherche en kilomètres
 * @returns {Promise<Array<{
 *   vehicle_id: number,
 *   name: string,
 *   plate_number: string,
 *   latitude: number,
 *   longitude: number,
 *   created_at: string,
 *   distance_km: number
 * }>>}
 */
async function searchByRadius(latitude, longitude, radius_km) {
  const result = await pool.query(`
    SELECT DISTINCT ON (p.vehicle_id)
      p.vehicle_id,
      v.name,
      v.plate_number,
      ST_Y(p.location::geometry)  AS latitude,
      ST_X(p.location::geometry)  AS longitude,
      p.created_at,
      ROUND(
        ST_Distance(
          p.location,
          ST_SetSRID(ST_Point($2, $1), 4326)::geography
        ) / 1000, 2
      ) AS distance_km
    FROM positions p
    JOIN vehicles v ON v.id = p.vehicle_id
    WHERE ST_DWithin(
      p.location,
      ST_SetSRID(ST_Point($2, $1), 4326)::geography,
      $3 * 1000   -- conversion km → mètres
    )
    ORDER BY p.vehicle_id, p.created_at DESC
  `, [latitude, longitude, radius_km]);

  return result.rows;
}

/**
 * Recherche géographique — Véhicule le plus proche d'un point de référence.
 *
 * Utilise l'opérateur PostGIS <-> (KNN — K-Nearest Neighbor) pour un tri
 * rapide exploitant l'index GIST, combiné à ST_Distance pour la distance exacte.
 *
 * @param {number} latitude  - Latitude du point de référence
 * @param {number} longitude - Longitude du point de référence
 * @returns {Promise<{
 *   vehicle_id: number,
 *   name: string,
 *   plate_number: string,
 *   latitude: number,
 *   longitude: number,
 *   created_at: string,
 *   distance_km: number
 * } | null>} Le véhicule le plus proche, ou null si aucun véhicule enregistré
 */
async function getNearestVehicle(latitude, longitude) {
  const result = await pool.query(`
    SELECT DISTINCT ON (p.vehicle_id)
      p.vehicle_id,
      v.name,
      v.plate_number,
      ST_Y(p.location::geometry)  AS latitude,
      ST_X(p.location::geometry)  AS longitude,
      p.created_at,
      ROUND(
        ST_Distance(
          p.location,
          ST_SetSRID(ST_Point($2, $1), 4326)::geography
        ) / 1000, 2
      ) AS distance_km
    FROM positions p
    JOIN vehicles v ON v.id = p.vehicle_id
    ORDER BY
      p.vehicle_id,
      p.created_at DESC,
      p.location <-> ST_SetSRID(ST_Point($2, $1), 4326)::geography
    LIMIT 1
  `, [latitude, longitude]);

  return result.rows[0] || null;
}

module.exports = {
  getAllPositions,
  addPosition,
  searchByRadius,
  getNearestVehicle,
};