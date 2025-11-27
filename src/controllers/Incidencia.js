// controllers/Incidencia.js
const Incidencia = require('../models/Incidencia');
const mongoose = require('mongoose');
const { uploadImageToBlob, deleteImageFromBlob } = require('../utils/azureBlobService');
require('dotenv');

// Registrar nueva incidencia
const registrarIncidencia = async (req, res) => {
    try {
        let incidenciaData = req.body;

        // Si hay imagen, subirla a Azure Blob
        if (req.file) {
            const imageUrl = await uploadImageToBlob(req.file);
            incidenciaData.img_url = imageUrl;
        }

        console.log('Datos de incidencia:', incidenciaData);

        const incidencia = new Incidencia(incidenciaData);
        await incidencia.save();

        res.status(200).send({
            ok: 'Successful',
            incidencia: incidencia
        });
    } catch (error) {
        console.error('Error al registrar incidencia:', error);
        res.status(500).send({ error: 'Error en el servidor' });
    }
};

// Obtener incidencias por usuario
const getIncidenciasByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const incidencias = await Incidencia.find({ user: userId })
            .sort({ createdAt: -1 });
        res.status(200).send(incidencias);
    } catch (error) {
        console.error('Error al obtener incidencias:', error);
        res.status(500).send({ error: 'Error en el servidor' });
    }
};

// Obtener todas las incidencias (con paginación opcional)
const getAllIncidencias = async (req, res) => {
    try {
        const { page = 1, limit = 20, estado, gradoSeveridad } = req.query;

        let query = {};
        if (estado) query.estado = estado;
        if (gradoSeveridad) query.gradoSeveridad = gradoSeveridad;

        const incidencias = await Incidencia.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('user', 'nombre apellido correo');

        const total = await Incidencia.countDocuments(query);

        res.status(200).send({
            incidencias,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Error al obtener incidencias:', error);
        res.status(500).send({ error: 'Error en el servidor' });
    }
};

// Obtener incidencia por ID
const getIncidenciaById = async (req, res) => {
    try {
        const { id } = req.params;
        const incidencia = await Incidencia.findById(id)
            .populate('user', 'nombre email');

        if (!incidencia) {
            return res.status(404).send({ error: 'Incidencia no encontrada' });
        }

        res.status(200).send(incidencia);
    } catch (error) {
        console.error('Error al obtener incidencia:', error);
        res.status(500).send({ error: 'Error en el servidor' });
    }
};

// Editar incidencia
const editIncidenciaById = async (req, res) => {
    try {
        const { id } = req.params;
        let updateData = req.body;

        // Si hay nueva imagen, subir y eliminar la anterior
        if (req.file) {
            const incidenciaActual = await Incidencia.findById(id);

            // Eliminar imagen anterior si existe
            if (incidenciaActual && incidenciaActual.img_url) {
                await deleteImageFromBlob(incidenciaActual.img_url);
            }

            // Subir nueva imagen
            const imageUrl = await uploadImageToBlob(req.file);
            updateData.img_url = imageUrl;
        }

        const result = await Incidencia.findByIdAndUpdate(id, updateData, { new: true });

        if (!result) {
            return res.status(404).send({ error: 'Incidencia no encontrada' });
        }

        res.status(200).send({ ok: 'Successful', incidencia: result });
    } catch (error) {
        console.error('Error al editar incidencia:', error);
        res.status(500).send({ error: 'Error en el servidor' });
    }
};

// Eliminar incidencia
const deleteIncidenciaById = async (req, res) => {
    try {
        const { id } = req.params;
        const incidencia = await Incidencia.findById(id);

        if (!incidencia) {
            return res.status(404).send({ error: 'Incidencia no encontrada' });
        }

        // Eliminar imagen si existe
        if (incidencia.img_url) {
            await deleteImageFromBlob(incidencia.img_url);
        }

        await Incidencia.findByIdAndDelete(id);

        res.status(200).send({ ok: 'Incidencia eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar incidencia:', error);
        res.status(500).send({ error: 'Error en el servidor' });
    }
};

// Obtener estadísticas de incidencias
const getIncidenciasStats = async (req, res) => {
    try {
        const { userId } = req.params;

        const stats = await Incidencia.aggregate([
            ...(userId ? [{ $match: { user: new mongoose.Types.ObjectId(userId) } }] : []),
            {
                $group: {
                    _id: '$gradoSeveridad',
                    count: { $sum: 1 }
                }
            }
        ]);

        const porTipo = await Incidencia.aggregate([
            ...(userId ? [{ $match: { user: new mongoose.Types.ObjectId(userId) } }] : []),
            {
                $group: {
                    _id: '$tipoIncidente',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            porSeveridad: stats,
            porTipo: porTipo
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = {
    registrarIncidencia,
    getIncidenciasByUser,
    getAllIncidencias,
    getIncidenciaById,
    editIncidenciaById,
    deleteIncidenciaById,
    getIncidenciasStats
};