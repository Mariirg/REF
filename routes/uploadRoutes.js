const express = require("express");
const router = express.Router();
const multer = require("multer");
const { subirImagenAzure } = require("../controllers/uploadController");


const upload = multer(); // Usamos multer sin almacenamiento en disco

router.post("/", upload.single("image"), subirImagenAzure);

module.exports = router;