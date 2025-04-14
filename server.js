// ══════════════════════════════════════
// 📦 MÓDULOS Y DEPENDENCIAS
// ══════════════════════════════════════
const express = require("express");
const cors = require("cors");
const path = require("path");
const sql = require("mssql");
const { poolPromise } = require("./models/database");
const uploadRoutes = require("./routes/uploadRoutes");
const cursoRoutes = require('./routes/cursoRoutes');


// Rutas externas
const rutasAuth = require("./routes/auth");
const progresoRoutes = require("./routes/progresoRoutes");
const evaluacionesRoutes = require("./routes/evaluacionesRoutes");


// Inicialización
const app = express();
const PORT = process.env.PORT || 3000;

// ══════════════════════════════════════
// 🧩 MIDDLEWARES
// ══════════════════════════════════════
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Archivos estáticos
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/favicon.ico", express.static(path.join(__dirname, "public", "favicon.ico")));
app.use(express.static(path.join(__dirname, "views")));
app.use("/api/upload", uploadRoutes);
app.use('/curso', (req, res, next) => {
  console.log("🌟 Llegó una solicitud a /curso");
  next(); // Esto pasa al siguiente middleware o ruta
}, cursoRoutes);
// Página principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// ══════════════════════════════════════
// 🔌 RUTAS API
// ══════════════════════════════════════
app.use("/api/auth", rutasAuth);
app.use("/api/progreso", progresoRoutes);
app.use("/api/evaluaciones", evaluacionesRoutes);


app.get("/api/usuarios/activos", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT NombreUsuario as nombre, Activo as estado
        FROM Usuarios
      `);

    // Verificar si se encontraron usuarios activos
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "No se encontraron usuarios activos." });
    }

    // Enviar la lista de usuarios activos al frontend
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("❌ Error al obtener los usuarios activos:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

app.get("/api/usuarios", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT IdUsuario, NombreUsuario, Correo, Rol, Descripcion, Progreso, FotoPerfil, Activo
      FROM Usuarios
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "No se encontraron usuarios." });
    }

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("❌ Error al obtener todos los usuarios:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ══════════════════════════════════════
// 👤 RUTA: Obtener perfil de usuario
// ══════════════════════════════════════
app.get("/api/usuarios/:IdUsuario", async (req, res) => {
  try {
    const idUsuario = parseInt(req.params.IdUsuario, 10);
    if (isNaN(idUsuario)) {
      return res.status(400).json({ error: "ID inválido. Debe ser un número." });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input("IdUsuario", sql.Int, idUsuario)
      .query(`
        SELECT IdUsuario, NombreUsuario, Correo, Rol, Descripcion, Progreso, FotoPerfil
        FROM Usuarios WHERE IdUsuario = @IdUsuario
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error("❌ Error al obtener el perfil del usuario:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ══════════════════════════════════════
// 📝 RUTA: Actualizar perfil de usuario
// ══════════════════════════════════════
app.put("/api/usuarios/:IdUsuario", async (req, res) => {
  try {
    const idUsuario = parseInt(req.params.IdUsuario, 10);
    const { NombreUsuario, Descripcion, FotoPerfil } = req.body;
    if (isNaN(idUsuario)) {
      return res.status(400).json({ error: "ID inválido. Debe ser un número." });
    }

    if (!NombreUsuario || !Descripcion || !FotoPerfil) {
      return res.status(400).json({ error: "Nombre, descripción y foto son requeridos." });
    }

    const pool = await poolPromise;

    await pool.request()
      .input("IdUsuario", sql.Int, idUsuario)
      .input("NombreUsuario", sql.NVarChar, NombreUsuario)
      .input("Descripcion", sql.NVarChar, Descripcion)
      .input("FotoPerfil", sql.NVarChar, FotoPerfil) // 👈 Guarda la URL directamente
      .query(`
        UPDATE Usuarios
        SET NombreUsuario = @NombreUsuario,
            Descripcion = @Descripcion,
            FotoPerfil = @FotoPerfil
        WHERE IdUsuario = @IdUsuario
      `);

    res.status(200).json({ mensaje: "Perfil actualizado correctamente." });
  } catch (error) {
    console.error("❌ Error al actualizar el perfil:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ══════════════════════════════════════
// 🔄 RUTA: Archivos HTML dinámicos en views
// ══════════════════════════════════════
app.get("*", (req, res) => {
  const filePath = path.join(__dirname, "views", req.path + ".html");
  res.sendFile(filePath, (err) => {
    if (err) res.status(404).send("Página no encontrada");
  });
});

// ══════════════════════════════════════
// 🚀 INICIAR SERVIDOR Y CONEXIÓN A BD
// ══════════════════════════════════════
console.log("Iniciando conexión con la base de datos...");

poolPromise
  .then(async () => {
    console.log("✅ Conectado a SQL Server");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
    });

    const open = (await import("open")).default;
    open(`http://localhost:${PORT}`);
  })
  .catch((err) => {
    console.error("❌ Error al conectar a la base de datos:", err.message);
  });
  
// RUTA: Obtener usuarios activos