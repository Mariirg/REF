const express = require('express');
const router = express.Router();
const EvaluacionesController = require('../controllers/evaluacionesController');

router.get('/preguntas/:id', EvaluacionesController.obtenerPreguntas);
router.post('/guardarRespuestas', EvaluacionesController.guardarRespuestas);
router.get('/resultado/:idUsuario/:idEvaluacion', EvaluacionesController.obtenerResultado);

module.exports = router;
