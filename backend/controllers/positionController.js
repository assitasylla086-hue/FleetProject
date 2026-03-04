/**
 * @file positionController.js
 * @description Contrôleur de gestion des positions GPS et recherche géographique.
 * Valide les entrées HTTP et délègue les requêtes PostGIS à positionService.
 */

const positionService = require('../services/positionService');

/**
 * GET /api/positions
 * Retourne toutes les positions enregistrées avec les infos du véhicule associé.
 */
exports.getPositions = async (req, res) => {
  try {
    const positions = await positionService.getAllPositions();
    res.json(positions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/positions
 * Enregistre une nouvelle position GPS pour un véhicule.
 * @param {import('express').Request} req - { vehicle_id, latitude, longitude }
 */
exports.addPosition = async (req, res) => {
  const { vehicle_id, latitude, longitude } = req.body;

  if (!vehicle_id || latitude === undefined || longitude === undefined)
    return res.status(400).json({ message: 'vehicle_id, latitude et longitude requis' });

  try {
    const position = await positionService.addPosition(
      parseInt(vehicle_id),
      parseFloat(latitude),
      parseFloat(longitude)
    );
    res.status(201).json(position);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/positions/search/radius
 * Recherche les véhicules dans un rayon autour d'un point géographique.
 * Utilise PostGIS ST_DWithin sur le type GEOGRAPHY (distances en mètres réels).
 *
 * @param {import('express').Request} req - query: { latitude, longitude, radius_km }
 */
exports.searchByRadius = async (req, res) => {
  const { latitude, longitude, radius_km } = req.query;

  if (!latitude || !longitude || !radius_km)
    return res.status(400).json({ message: 'latitude, longitude et radius_km requis' });

  try {
    const results = await positionService.searchByRadius(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(radius_km)
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/positions/search/nearest
 * Retourne le véhicule dont la dernière position est la plus proche d'un point.
 * Utilise l'opérateur KNN PostGIS <-> avec l'index GIST pour des performances optimales.
 *
 * @param {import('express').Request} req - query: { latitude, longitude }
 */
exports.nearestVehicle = async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude)
    return res.status(400).json({ message: 'latitude et longitude requis' });

  try {
    const vehicle = await positionService.getNearestVehicle(
      parseFloat(latitude),
      parseFloat(longitude)
    );
    if (!vehicle)
      return res.status(404).json({ message: 'Aucun véhicule trouvé' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};