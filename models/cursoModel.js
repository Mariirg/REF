const { poolPromise, sql } = require("./database");

const Curso = {
    obtenerTodos: async () => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query('SELECT * FROM Cursos');
            return result.recordset;
        } catch (error) {
            console.error("❌ Error al obtener cursos:", error.message);
            throw error;
        }
    },
    insertar: async (nombre, descripcion, imagen) => {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("NombreCurso", sql.VarChar, nombre)
            .input("Descripcion", sql.Text, descripcion)
            .input("Imagen", sql.VarChar, imagen)
            .query("INSERT INTO Cursos (NombreCurso, Descripcion, Imagen) OUTPUT INSERTED.IdCurso VALUES (@NombreCurso, @Descripcion, @Imagen)");
        return result.recordset[0].IdCurso;
    },

    marcarComoFinalizado: async (IdUsuario, IdCurso) => {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input("IdUsuario", sql.Int, IdUsuario)
                .input("IdCurso", sql.Int, IdCurso)
                .query("UPDATE ProgresoUsuario SET Completado = 1 WHERE IdUsuario = @IdUsuario AND IdCurso = @IdCurso");

            // Obtener total de cursos y completados
            const totalCursos = await pool.request()
                .input("IdUsuario", sql.Int, IdUsuario)
                .query("SELECT COUNT(*) AS Total FROM Cursos");

            const cursosCompletados = await pool.request()
                .input("IdUsuario", sql.Int, IdUsuario)
                .query("SELECT COUNT(*) AS Completados FROM ProgresoUsuario WHERE IdUsuario = @IdUsuario AND Completado = 1");

            const total = totalCursos.recordset[0].Total;
            const completados = cursosCompletados.recordset[0].Completados;
            const porcentaje = total > 0 ? (completados / total) * 100 : 0;
            console.log("total: " + total)
            console.log("completados: " + completados)
            console.log("Porcentaje: " + porcentaje)
            // Actualizar porcentaje de progreso del usuario
            await pool.request()
                .input("ProgresoUsuario", sql.Decimal(5, 2), porcentaje)
                .input("IdUsuario", sql.Int, IdUsuario)
                .query("UPDATE Usuarios SET ProgresoUsuario = @ProgresoUsuario WHERE IdUsuario = @IdUsuario");

        } catch (error) {
            console.error("❌ Error al marcar como finalizado:", error.message);
            throw error;
        }
    },

};

module.exports = Curso;
