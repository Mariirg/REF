// routes/usuariosRoutes.js
const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { poolPromise } = require('../models/database');

// Obtener todos los usuarios activos
router.get('/activos', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT IdUsuario, NombreUsuario, Correo, Rol, Descripcion, Progreso, FotoPerfil
      FROM Usuarios WHERE Activo = 1
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener usuarios activos:', error.message);
    res.status(500).json({ error: 'Error al obtener usuarios activos' });
  }
});

// Obtener un usuario por ID
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido. Debe ser un número.' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('IdUsuario', sql.Int, id)
      .query(`
        SELECT IdUsuario, NombreUsuario, Correo, Rol, Descripcion, Progreso, FotoPerfil
        FROM Usuarios WHERE IdUsuario = @IdUsuario
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error.message);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// Actualizar perfil de usuario
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { NombreUsuario, Descripcion, FotoPerfil } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido. Debe ser un número.' });
  }

  if (!NombreUsuario || !Descripcion || !FotoPerfil) {
    return res.status(400).json({ error: 'Nombre, descripción y foto son requeridos.' });
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('IdUsuario', sql.Int, id)
      .input('NombreUsuario', sql.NVarChar, NombreUsuario)
      .input('Descripcion', sql.NVarChar, Descripcion)
      .input('FotoPerfil', sql.NVarChar, FotoPerfil)
      .query(`
        UPDATE Usuarios
        SET NombreUsuario = @NombreUsuario,
            Descripcion = @Descripcion,
            FotoPerfil = @FotoPerfil
        WHERE IdUsuario = @IdUsuario
      `);

    res.status(200).json({ mensaje: 'Perfil actualizado correctamente.' });
  } catch (error) {
    console.error('Error al actualizar el perfil:', error.message);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
});

module.exports = router;
