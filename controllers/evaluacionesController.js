const EvaluacionesModel = require('../models/evaluacionesModel');

const EvaluacionesController = {
    obtenerPreguntas: async (req, res) => {
        try {
            const idEvaluacion = req.params.id;
    
            if (!idEvaluacion) {
                return res.status(400).json({ error: "ID de evaluación no proporcionado" });
            }
    
            console.log("Buscando preguntas para Evaluación ID:", idEvaluacion); // 🔍 Verificar si el ID llega bien
    
            const preguntas = await EvaluacionesModel.obtenerPreguntas(idEvaluacion);
    
            console.log("Preguntas obtenidas:", preguntas); // 🔍 Verifica si devuelve algo
    
            if (preguntas.length === 0) {
                console.log("⚠ No se encontraron preguntas");
                return res.status(404).json({ mensaje: "No se encontraron preguntas para esta evaluación" });
            }
    
            res.json(preguntas);
        } catch (error) {
            console.error("ERROR en obtenerPreguntas:", error); // 🔍 Ahora sí imprimirá el error real
            res.status(500).json({ error: "Error obteniendo preguntas", detalle: error.message });
        }
    },    

    guardarRespuestas: async (req, res) => {
        try {
            console.log("Cuerpo de la petición en guardarRespuestas:", req.body); // Depuración

            const { idUsuario, idEvaluacion, respuestas } = req.body;
            console.log("ID de Evaluación recibido en guardarRespuestas:", idEvaluacion); // Depuración

            await EvaluacionesModel.guardarRespuestasUsuario(idUsuario, idEvaluacion, respuestas);
            res.json({ mensaje: "Respuestas guardadas correctamente" });
        } catch (error) {
            console.error("ERROR en guardarRespuestas:", error);
            res.status(500).json({ error: "Error guardando respuestas", detalle: error.message });
        }
    },

    obtenerResultado: async (req, res) => {
        try {
            console.log("Parámetros recibidos en obtenerResultado:", req.params); // Depuración

            const { idUsuario, idEvaluacion } = req.params;
            console.log("ID de Evaluación recibido en obtenerResultado:", idEvaluacion); // Depuración

            const resultado = await EvaluacionesModel.calcularResultado(idUsuario, idEvaluacion);

            res.json({ puntaje: resultado || 0 });
        } catch (error) {
            console.error("ERROR en obtenerResultado:", error);
            res.status(500).json({ error: "Error obteniendo resultado", detalle: error.message });
        }
    }
};

module.exports = EvaluacionesController;
