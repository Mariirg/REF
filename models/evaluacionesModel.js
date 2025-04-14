const sql = require("mssql");
const db = require("./database");

const EvaluacionesModel = {
    guardarRespuestasUsuario: async (idUsuario, idEvaluacion, respuestas) => {
        try {
            console.log("ID de Evaluación recibido en guardarRespuestasUsuario:", idEvaluacion); // Depuración
            let pool = await db.poolPromise;

            for (let resp of respuestas) {
                console.log(`Guardando respuesta para Pregunta ${resp.idPregunta}, Respuesta ${resp.idRespuesta}`);

                let request = pool.request();

                // Verificar si la pregunta existe
                let preguntaExiste = await request
                    .input("idPregunta", sql.Int, resp.idPregunta)
                    .query("SELECT IdPregunta FROM Preguntas WHERE IdPregunta = @idPregunta");

                if (preguntaExiste.recordset.length === 0) {
                    throw new Error(`La pregunta con ID ${resp.idPregunta} no existe.`);
                }

                // Verificar si la respuesta existe y pertenece a la pregunta
                request = pool.request();
                let respuestaExiste = await request
                    .input("idPregunta", sql.Int, resp.idPregunta)
                    .input("idRespuesta", sql.Int, resp.idRespuesta)
                    .query(`
                        SELECT IdRespuesta FROM Respuestas 
                        WHERE IdRespuesta = @idRespuesta AND IdPregunta = @idPregunta
                    `);

                if (respuestaExiste.recordset.length === 0) {
                    throw new Error(`La respuesta con ID ${resp.idRespuesta} no existe o no pertenece a la pregunta.`);
                }

                // Guardar la respuesta del usuario
                request = pool.request();
                await request
                    .input("idUsuario", sql.Int, idUsuario)
                    .input("idEvaluacion", sql.Int, idEvaluacion)
                    .input("idPregunta", sql.Int, resp.idPregunta)
                    .input("idRespuesta", sql.Int, resp.idRespuesta)
                    .query(`
                        INSERT INTO RespuestasUsuario (IdUsuario, IdEvaluacion, IdPregunta, IdRespuesta)
                        VALUES (@idUsuario, @idEvaluacion, @idPregunta, @idRespuesta)
                    `);
            }

            console.log("idEvaluacion después de guardar respuestas:", idEvaluacion); 

            // Actualizar el puntaje total de la evaluación
            let updateRequest = pool.request();
            await updateRequest
                .input("idEvaluacion", sql.Int, idEvaluacion)
                .query(`
                    UPDATE Evaluaciones
                    SET PuntajeTotal = ISNULL((  
                        SELECT SUM(R.Puntaje)  
                        FROM RespuestasUsuario RU  
                        INNER JOIN Respuestas R ON RU.IdRespuesta = R.IdRespuesta  
                        WHERE RU.IdEvaluacion = @idEvaluacion  
                    ), 0)  
                    WHERE IdEvaluacion = @idEvaluacion;
                `);

            return { mensaje: "Respuestas guardadas y puntaje actualizado correctamente" };
        } catch (error) {
            console.error("Error guardando respuestas:", error);
            throw error;
        }
    },

    calcularResultado: async (idUsuario, idEvaluacion) => {
        try {
            console.log("Calculando resultado para idEvaluacion:", idEvaluacion); // Depuración
            let pool = await db.poolPromise;
            let request = pool.request();

            let resultado = await request
                .input("idUsuario", sql.Int, idUsuario)
                .input("idEvaluacion", sql.Int, idEvaluacion)
                .query(`
                    SELECT PuntajeTotal 
                    FROM Evaluaciones
                    WHERE IdEvaluacion = @idEvaluacion
                `);

            return resultado.recordset.length > 0 ? resultado.recordset[0].PuntajeTotal : 0;
        } catch (error) {
            console.error("ERROR en calcularResultado:", error);
            throw error;
        }
    },

    obtenerPreguntas: async (idEvaluacion) => {
        try {
            let pool = await db.poolPromise;
            let request = pool.request();

            console.log("Ejecutando consulta SQL para obtener preguntas..."); // 🔍 Log antes de la consulta

            let resultado = await request
                .input("idEvaluacion", sql.Int, idEvaluacion)
                .query(`
                    SELECT IdPregunta, Pregunta 
                    FROM Preguntas 
                    WHERE IdEvaluacion = @idEvaluacion
                `);

            console.log("Resultado SQL:", resultado.recordset); // 🔍 Verificar si devuelve datos

            return resultado.recordset.length > 0 ? resultado.recordset : [];
        } catch (error) {
            console.error("ERROR en obtenerPreguntas SQL:", error); // 🔍 Ver error real
            throw error;
        }
    }

};

module.exports = EvaluacionesModel;
