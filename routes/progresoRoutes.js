const express = require("express");
const { getProgreso, updateProgreso } = require("../controllers/progresoController");

const router = express.Router();

router.get("/:IdUsuario/:IdCurso", getProgreso);
router.post("/", updateProgreso);

module.exports = router;
