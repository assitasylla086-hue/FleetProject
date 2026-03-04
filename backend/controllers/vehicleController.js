/**
 * @file vehicleController.js
 * @description Contrôleur CRUD des véhicules.
 * Valide les paramètres HTTP et délègue la logique métier à vehicleService.
 */

const vehicleService = require('../services/vehicleService');

/**
 * GET /api/vehicles
 * Retourne la liste complète des véhicules.
 */
exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.getAllVehicles();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/vehicles
 * Crée un nouveau véhicule.
 * @param {import('express').Request} req - { name, plate_number }
 */
exports.createVehicle = async (req, res) => {
  const { name, plate_number } = req.body;

  if (!name || !plate_number)
    return res.status(400).json({ message: 'Nom et plaque requis' });

  try {
    const vehicle = await vehicleService.createVehicle(name.trim(), plate_number.trim());
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PUT /api/vehicles/:id
 * Met à jour un véhicule existant.
 * @param {import('express').Request} req - params: { id }, body: { name, plate_number }
 */
exports.updateVehicle = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, plate_number } = req.body;

  if (isNaN(id))
    return res.status(400).json({ message: 'ID invalide' });
  if (!name || !plate_number)
    return res.status(400).json({ message: 'Nom et plaque requis' });

  try {
    const vehicle = await vehicleService.updateVehicle(id, name.trim(), plate_number.trim());
    if (!vehicle)
      return res.status(404).json({ message: 'Véhicule non trouvé' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE /api/vehicles/:id
 * Supprime un véhicule et toutes ses positions GPS associées.
 * @param {import('express').Request} req - params: { id }
 */
exports.deleteVehicle = async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id))
    return res.status(400).json({ message: 'ID invalide' });

  try {
    const deleted = await vehicleService.deleteVehicle(id);
    if (!deleted)
      return res.status(404).json({ message: 'Véhicule non trouvé' });
    res.json({ message: 'Véhicule supprimé avec succès', deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};