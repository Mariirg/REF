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
    }
};

module.exports = Curso;
