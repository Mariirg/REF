const express = require('express');
const router = express.Router();
const leccionController = require('../controllers/leccionController');

router.post('/', leccionController.crearLeccion);
router.get('/', leccionController.obtenerLecciones);

module.exports = router;
