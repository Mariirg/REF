const { sql, poolPromise } = require("./database");

const Leccion = {
  insertar: async (cursoId, titulo, introLeccion, introCurso, definicion, importancia, practica, urlimg1, urlimg2) => {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("IdCurso", sql.Int, cursoId)
      .input("TituloLeccion", sql.VarChar, titulo)
      .input("IntroLeccion", sql.Text, introLeccion)
      .input("IntroCurso", sql.Text, introCurso)
      .input("Definicion", sql.Text, definicion)
      .input("Importancia", sql.Text, importancia)
      .input("Practica", sql.Text, practica)
      .input("urlimg1", sql.Text, urlimg1 )
      .input("urlimg2", sql.Text, urlimg2 )
      .query(`
        INSERT INTO Lecciones (IdCurso, TituloLeccion, IntroLeccion, IntroCurso, Definicion, Importancia, Practica, urlimg1, urlimg2)
        OUTPUT INSERTED.IdLeccion
        VALUES (@IdCurso, @TituloLeccion, @IntroLeccion, @IntroCurso, @Definicion, @Importancia, @Practica, @urlimg1, @urlimg2)
      `);
    return result.recordset[0].IdLeccion;
  }
};

module.exports = Leccion;
