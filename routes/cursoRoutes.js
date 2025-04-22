// routes/cursos.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); 
const {traeridUsuario} = require('../middleware/auth');

const { guardarCurso, mostrarCursos, finalizarCurso, actualizarCurso, eliminarCurso } = require('../controllers/cursoController');

// Ruta para crear un nuevo curso con imágenes
router.post("/", upload.fields([
  { name: 'imgMetas', maxCount: 1 },
  {name: 'img1', maxCount: 1},
  {name: 'img2', maxCount: 1}
  // Si agregas más imágenes en el futuro, puedes añadir aquí
]), 
guardarCurso);

// Ruta para mostrar todos los cursos
router.get('/', mostrarCursos);

router.post('/finalizar/:IdCurso', traeridUsuario, finalizarCurso);

router.put("/actualizar/:IdCurso", upload.fields([{ name: "imagen" }]), actualizarCurso);

router.delete("/eliminar/:IdCurso/:NombreCurso", eliminarCurso);


module.exports = router;
