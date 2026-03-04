const express = require('express');
const router = express.Router();
const positionController = require('../controllers/positionController');

router.get('/', positionController.getPositions);
router.post('/', positionController.addPosition);
router.get('/search/radius', positionController.searchByRadius);
router.get('/search/nearest', positionController.nearestVehicle);

module.exports = router;