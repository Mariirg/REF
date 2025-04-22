const express = require("express");
const router = express.Router();
const multer = require("multer");
const { subirImagenCloudinary } = require("../controllers/uploadController"); // Asegúrate de que esta importación sea correcta

// Configuración de Multer (almacenamiento en memoria)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configuración de Cloudinary ya está en el archivo uploadController.js

// Ruta POST para subir imagen
router.post("/", upload.single("image"), subirImagenCloudinary);

module.exports = router;
