const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Guarda archivos en carpeta temporal
const leccionController = require('../controllers/leccionController');

router.post('/', leccionController.crearLeccion);
router.get('/', leccionController.obtenerLecciones);
router.get('/:IdCurso', leccionController.formularioEditar);
router.put('/:IdLeccion', 
    upload.fields([
      { name: "urlimg1", maxCount: 1 },
      { name: "urlimg2", maxCount: 1 }
    ]),
    leccionController.actualizarLeccion
  );


module.exports = router;
