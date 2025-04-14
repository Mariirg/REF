const { sql, poolPromise } = require("../models/database");

const obtenerProgreso = async (IdUsuario, IdCurso) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("IdUsuario", sql.Int, IdUsuario)
        .input("IdCurso", sql.Int, IdCurso)
        .query("SELECT * FROM ProgresoUsuario WHERE IdUsuario = @IdUsuario AND IdCurso = @IdCurso");
    
    return result.recordset[0];
};

const actualizarProgreso = async (IdUsuario, IdCurso, LeccionActual) => {
    const pool = await poolPromise;
    await pool.request()
        .input("IdUsuario", sql.Int, IdUsuario)
        .input("IdCurso", sql.Int, IdCurso)
        .input("LeccionActual", sql.Int, LeccionActual)
        .query("UPDATE ProgresoUsuario SET LeccionActual = @LeccionActual WHERE IdUsuario = @IdUsuario AND IdCurso = @IdCurso");
};

module.exports = { obtenerProgreso, actualizarProgreso };
