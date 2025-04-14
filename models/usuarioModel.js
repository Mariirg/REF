
const sql = require("mssql");
const { poolPromise } = require("./database");

const obtenerPorId = async (idUsuario) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input("IdUsuario", sql.Int, idUsuario)
    .query(`
      SELECT IdUsuario, NombreUsuario, Correo, Rol, Descripcion, Progreso, FotoPerfil
      FROM Usuarios WHERE IdUsuario = @IdUsuario
    `);
  return result.recordset[0];
};

const actualizarPerfil = async (idUsuario, nombre, descripcion, foto) => {
  const pool = await poolPromise;
  await pool.request()
    .input("IdUsuario", sql.Int, idUsuario)
    .input("NombreUsuario", sql.NVarChar, nombre)
    .input("Descripcion", sql.NVarChar, descripcion)
    .input("FotoPerfil", sql.NVarChar, foto)
    .query(`
      UPDATE Usuarios
      SET NombreUsuario = @NombreUsuario,
          Descripcion = @Descripcion,
          FotoPerfil = @FotoPerfil
      WHERE IdUsuario = @IdUsuario
    `);
};

const obtenerActivos = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT IdUsuario, NombreUsuario, Correo, Rol, Descripcion, FotoPerfil
    FROM Usuarios WHERE Activo = 1
  `);
  return result.recordset;
};

module.exports = {
  obtenerPorId,
  actualizarPerfil,
  obtenerActivos,
};
