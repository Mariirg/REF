const { obtenerProgreso, actualizarProgreso } = require("../models/progresoModel");

const cursos = {
    1: ["1", "2", "3"],
    2: ["4", "5", "6"],
    3: ["7", "8", "9"]
};

// Obtener progreso del usuario en un curso y gestionar el desbloqueo de lecciones
const getProgreso = async (req, res) => {
    const { IdUsuario, IdCurso } = req.params;
    const IdCursoNum = Number(IdCurso); // Convertir a número

    try {
        if (!cursos[IdCursoNum]) {
            return res.status(400).json({ mensaje: "Curso inválido" });
        }

        const progreso = (await obtenerProgreso(IdUsuario, IdCursoNum)) || [];

        let estadoLecciones = cursos[IdCursoNum].map((leccion, index) => ({
            id: leccion,
            desbloqueado: index === 0 || progreso.includes(cursos[IdCursoNum][index - 1]),
            completado: progreso.includes(leccion),
        }));

        res.json(estadoLecciones);
    } catch (error) {
        console.error("Error obteniendo progreso:", error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
};

// Actualizar progreso del usuario en un curso con validación de desbloqueo
const updateProgreso = async (req, res) => {
    const { IdUsuario, IdCurso, LeccionActual } = req.body;
    const IdCursoNum = Number(IdCurso); // Convertir a número

    if (!IdUsuario || !IdCurso || !LeccionActual) {
        return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    if (!cursos[IdCursoNum]) {
        return res.status(400).json({ mensaje: "Curso inválido" });
    }

    try {
        const progreso = (await obtenerProgreso(IdUsuario, IdCursoNum)) || [];
        const leccionesCurso = cursos[IdCursoNum];
        const indiceLeccion = leccionesCurso.indexOf(LeccionActual);

        if (indiceLeccion === -1) {
            return res.status(400).json({ mensaje: "Lección inválida" });
        }

        // Verifica si la lección anterior fue completada antes de desbloquear la actual
        if (indiceLeccion > 0 && !progreso.includes(leccionesCurso[indiceLeccion - 1])) {
            return res.status(403).json({ mensaje: "No puedes desbloquear esta lección aún" });
        }

        if (!progreso.includes(LeccionActual)) {
            await actualizarProgreso(IdUsuario, IdCursoNum, LeccionActual);
        }

        res.json({ mensaje: "Progreso actualizado" });
    } catch (error) {
        console.error("Error actualizando progreso:", error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
};

module.exports = { getProgreso, updateProgreso };