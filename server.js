const express = require("express");
const cors = require("cors");
const path = require("path");
const sql = require("mssql");
const { poolPromise } = require("./models/database");
const uploadRoutes = require("./routes/uploadRoutes");
const cursoRoutes = require('./routes/cursoRoutes');
const LeccionesRoutes = require('./routes/leccionesRoutes');

// Rutas externas
const rutasAuth = require("./routes/auth");


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
app.use('/leccion', (req, res, next) => {
  console.log("🌟 Llegó una solicitud a /leccion");
  next(); // Esto pasa al siguiente middleware o ruta
}, LeccionesRoutes);
// Página principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// ══════════════════════════════════════
// 🔌 RUTAS API
// ══════════════════════════════════════
app.use("/api/auth", rutasAuth);



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
      SELECT IdUsuario, NombreUsuario, Correo, Rol, Descripcion, FotoPerfil, Activo
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
        SELECT IdUsuario, NombreUsuario, Correo, Rol, Descripcion, ProgresoUsuario, FotoPerfil
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
    const { NombreUsuario, Descripcion, imgUrl } = req.body;
    if (isNaN(idUsuario)) {
      return res.status(400).json({ error: "ID inválido. Debe ser un número." });
    }

    if (!NombreUsuario || !Descripcion || !imgUrl ) {
      return res.status(400).json({ error: "Nombre, descripción e imagen son requeridos." });
    }

    const pool = await poolPromise;

    await pool.request()
      .input("IdUsuario", sql.Int, idUsuario)
      .input("NombreUsuario", sql.NVarChar, NombreUsuario)
      .input("Descripcion", sql.NVarChar, Descripcion)
      .input("FotoPerfil", sql.VarChar, imgUrl)
      .query(`
        UPDATE Usuarios
        SET NombreUsuario = @NombreUsuario,
            Descripcion = @Descripcion,
            FotoPerfil = @FotoPerfil
        WHERE IdUsuario = @IdUsuario
      `);

    res.status(200).json({ mensaje: "Perfil actualizado correctamente." });
  } catch (error) {
    console.error("❌ Error al actualizar el perfil:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ══════════════════════════════════════
// RUTA: Obtener cursos
// ══════════════════════════════════════

// Ruta para obtener todos los cursos
app.get('/curso', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Cursos'); // Obtén todos los cursos
    res.json(result.recordset); // Devuelve los cursos como JSON
  } catch (error) {
    console.error('❌ Error al obtener los cursos:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener el total de cursos
app.get('/curso/total', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT COUNT(*) AS total FROM Cursos'); // Cuenta el total de cursos
    res.json(result.recordset[0]); // Devuelve el total de cursos
  } catch (error) {
    console.error('❌ Error al obtener el total de cursos:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
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
  
// RUTA: eliminar usuarios y asignar rol 

app.delete("/api/usuarios/:IdUsuario", async (req, res) => {
  try {
    const id = parseInt(req.params.IdUsuario);
    const pool = await poolPromise;
    await pool.request()
      .input("IdUsuario", sql.Int, id)
      .query(`DELETE FROM Usuarios WHERE IdUsuario = @IdUsuario`);
    res.status(200).json({ mensaje: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar usuario:", error.message);
    res.status(500).json({ error: "Error interno" });
  }
});

app.put("/api/usuarios/:IdUsuario/rol", async (req, res) => {
  try {
    const id = parseInt(req.params.IdUsuario);
    const { nuevoRol } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input("IdUsuario", sql.Int, id)
      .input("Rol", sql.NVarChar, nuevoRol)
      .query(`UPDATE Usuarios SET Rol = @Rol WHERE IdUsuario = @IdUsuario`);

    res.status(200).json({ mensaje: "Rol actualizado" });
  } catch (error) {
    console.error("❌ Error al cambiar rol:", error.message);
    res.status(500).json({ error: "Error interno" });
  }
  
});



