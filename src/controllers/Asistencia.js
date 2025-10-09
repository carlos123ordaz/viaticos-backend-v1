const Asistencia = require("../models/Asistencia");
const User = require("../models/User");
const { validarUbicacion } = require("../utils/geoUtils");

const insertAsistencia = async (req, res) => {
    try {
        const { userId, tipo, latitude, longitude } = req.body;
        if (!userId || !tipo || latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                error: 'Faltan datos requeridos: userId, tipo, latitude, longitude'
            });
        }

        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            return res.status(400).json({
                error: 'Las coordenadas deben ser números válidos'
            });
        }

        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({
                error: 'Coordenadas fuera de rango válido'
            });
        }

        const { start, end } = getRangedate();
        const user = await User.findById(userId).populate('sede');
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        if (!user.sede) {
            return res.status(400).json({ error: 'No se ha asignado una sede al usuario' });
        }
        if (!user.sede.latitude || !user.sede.longitude || !user.sede.radio) {
            return res.status(400).json({
                error: 'La sede no tiene coordenadas o radio configurados'
            });
        }
        const validacion = validarUbicacion(
            latitude,
            longitude,
            user.sede.latitude,
            user.sede.longitude,
            user.sede.radio
        );

        const asistencia = await Asistencia.findOne({
            usuario: userId,
            createdAt: { $gte: start, $lt: end }
        });
        if (tipo === 'entrada') {
            if (asistencia) {
                return res.status(400).json({
                    error: 'La asistencia de entrada ya fue marcada hoy'
                });
            }
            const nuevaAsistencia = new Asistencia({
                fecha: new Date(),
                entrada: new Date(),
                usuario: userId,
                sede: user.sede._id,
                latitude_entrada: latitude,
                longitude_entrada: longitude,
                valido_entrada: validacion.valido
            });

            await nuevaAsistencia.save();
            return res.status(200).json({
                ok: true,
                message: validacion.valido
                    ? 'Entrada registrada correctamente'
                    : 'Entrada registrada fuera de rango',
                valido: validacion.valido,
                distancia: validacion.distancia,
                radioPermitido: user.sede.radio,
                asistenciaId: nuevaAsistencia._id
            });
        }
        if (tipo === 'salida') {
            if (!asistencia) {
                return res.status(400).json({
                    error: 'No se ha marcado una hora de entrada hoy'
                });
            }
            if (!asistencia.entrada) {
                return res.status(400).json({
                    error: 'No existe un registro de entrada válido'
                });
            }
            if (asistencia.salida) {
                return res.status(400).json({
                    error: 'La salida ya fue registrada hoy'
                });
            }
            asistencia.latitude_salida = latitude;
            asistencia.longitude_salida = longitude;
            asistencia.salida = new Date();
            asistencia.valido_salida = validacion.valido;
            const diffMs = asistencia.salida - asistencia.entrada;
            asistencia.horas_trabajadas = Number((diffMs / (1000 * 60 * 60)).toFixed(2));

            await asistencia.save();

            return res.status(200).json({
                ok: true,
                message: validacion.valido
                    ? 'Salida registrada correctamente'
                    : 'Salida registrada fuera de rango',
                valido: validacion.valido,
                distancia: validacion.distancia,
                radioPermitido: user.sede.radio,
                horasTrabajadas: asistencia.horas_trabajadas
            });
        }
        return res.status(400).json({
            error: 'Tipo inválido. Use "entrada" o "salida"'
        });

    } catch (error) {
        console.error('Error en insertAsistencia:', error);
        res.status(500).json({
            error: 'Error en el servidor',
            detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getRangedate = (fecha) => {
    if (!fecha) {
        fecha = new Date()
    }
    const fechaBase = new Date(fecha);
    const start = new Date(fechaBase);
    start.setHours(0, 0, 0, 0);
    const end = new Date(fechaBase);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}
const getAsistenciasByDate = async (req, res) => {
    try {
        const { fecha } = req.params;
        const { start, end } = getRangedate(fecha);
        const asistenciasDia = await Asistencia.find({
            createdAt: { $gte: start, $lt: end }
        }).populate('usuario sede');
        res.status(200).send(asistenciasDia);
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error on server' });
    }
}

const getAsistenciaByUser = async (req, res) => {
    try {
        const { id } = req.params;
        const fechaBase = new Date();
        const start = new Date(fechaBase);
        start.setHours(0, 0, 0, 0);
        const end = new Date(fechaBase);
        end.setHours(23, 59, 59, 999);
        const asistencia = await Asistencia.findOne({
            createdAt: { $gte: start, $lt: end },
            usuario: id
        });
        res.status(200).send(asistencia);
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error on server' });
    }
}
module.exports = {
    insertAsistencia,
    getAsistenciasByDate,
    getAsistenciaByUser
}