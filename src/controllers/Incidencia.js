const Incidencia = require('../models/Incidencia');
const mongoose = require('mongoose');
const { uploadImageToBlob, deleteImageFromBlob } = require('../utils/azureBlobService');
require('dotenv');

const registrarIncidencia = async (req, res) => {
    try {
        let incidenciaData = req.body;

        // Manejo de múltiples imágenes
        if (req.files && req.files.length > 0) {
            const imageUrls = [];
            for (const file of req.files) {
                const imageUrl = await uploadImageToBlob(file);
                imageUrls.push(imageUrl);
            }
            incidenciaData.imagenes = imageUrls;
        } else if (req.file) {
            // Compatibilidad con imagen única
            const imageUrl = await uploadImageToBlob(req.file);
            incidenciaData.imagenes = [imageUrl];
        }

        console.log('Datos de incidencia:', incidenciaData);

        const incidencia = new Incidencia(incidenciaData);

        // Agregar al historial el estado inicial
        incidencia.historialEstados = [{
            estado: 'Pendiente',
            fecha: new Date(),
            usuario: incidenciaData.user
        }];

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

const getIncidenciasByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(userId)
        const incidencias = await Incidencia.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate('user', 'nombre apellido correo')
            .populate('asigned', 'nombre apellido correo');
        res.status(200).send(incidencias);
    } catch (error) {
        console.error('Error al obtener incidencias:', error);
        res.status(500).send({ error: 'Error en el servidor' });
    }
};

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
            .populate('user', 'nombre apellido correo')
            .populate('asigned', 'nombre apellido correo');

        const total = await Incidencia.countDocuments(query);

        res.status(200).send({
            incidencias,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        console.error('Error al obtener incidencias:', error);
        res.status(500).send({ error: 'Error en el servidor' });
    }
};

const getIncidenciaById = async (req, res) => {
    try {
        const { id } = req.params;
        const incidencia = await Incidencia.findById(id)
            .populate('user', 'nombre apellido correo')
            .populate('asigned', 'nombre apellido correo')
            .populate('historialEstados.usuario', 'nombre apellido');

        if (!incidencia) {
            return res.status(404).send({ error: 'Incidencia no encontrada' });
        }

        res.status(200).send(incidencia);
    } catch (error) {
        console.error('Error al obtener incidencia:', error);
        res.status(500).send({ error: 'Error en el servidor' });
    }
};

const editIncidenciaById = async (req, res) => {
    try {
        const { id } = req.params;
        let updateData = { ...req.body }
        if (req.files && req.files.length > 0) {
            const incidenciaActual = await Incidencia.findById(id);
            if (req.body.replaceImages === 'true') {
                if (incidenciaActual && incidenciaActual.imagenes && incidenciaActual.imagenes.length > 0) {
                    for (const imgUrl of incidenciaActual.imagenes) {
                        await deleteImageFromBlob(imgUrl);
                    }
                }
                const imageUrls = [];
                for (const file of req.files) {
                    const imageUrl = await uploadImageToBlob(file);
                    imageUrls.push(imageUrl);
                }
                updateData.imagenes = imageUrls;
            } else {
                const newImageUrls = [];
                for (const file of req.files) {
                    const imageUrl = await uploadImageToBlob(file);
                    newImageUrls.push(imageUrl);
                }
                updateData.$push = { imagenes: { $each: newImageUrls } };
            }
        }
        if (updateData.estado) {
            updateData.usuarioModificador = req.body.usuarioModificador || req.body.user;
            updateData.notasEstado = req.body.notasEstado || '';
        }

        const result = await Incidencia.findByIdAndUpdate(id, updateData, { new: true })
            .populate('user', 'nombre apellido correo')
            .populate('asigned', 'nombre apellido correo');

        if (!result) {
            return res.status(404).send({ error: 'Incidencia no encontrada' });
        }

        res.status(200).send({ ok: 'Successful', incidencia: result });
    } catch (error) {
        console.error('Error al editar incidencia:', error);
        res.status(500).send({ error: 'Error en el servidor' });
    }
};

const deleteIncidenciaById = async (req, res) => {
    try {
        const { id } = req.params;
        const incidencia = await Incidencia.findById(id);

        if (!incidencia) {
            return res.status(404).send({ error: 'Incidencia no encontrada' });
        }

        // Eliminar todas las imágenes si existen
        if (incidencia.imagenes && incidencia.imagenes.length > 0) {
            for (const imgUrl of incidencia.imagenes) {
                await deleteImageFromBlob(imgUrl);
            }
        }

        await Incidencia.findByIdAndDelete(id);

        res.status(200).send({ ok: 'Incidencia eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar incidencia:', error);
        res.status(500).send({ error: 'Error en el servidor' });
    }
};

// NUEVO: Eliminar una imagen específica de una incidencia
const deleteImageFromIncidencia = async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl } = req.body;

        const incidencia = await Incidencia.findById(id);

        if (!incidencia) {
            return res.status(404).send({ error: 'Incidencia no encontrada' });
        }

        // Eliminar la imagen de Azure
        await deleteImageFromBlob(imageUrl);

        // Remover la URL del array
        await Incidencia.findByIdAndUpdate(id, {
            $pull: { imagenes: imageUrl }
        });

        res.status(200).send({ ok: 'Imagen eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar imagen:', error);
        res.status(500).send({ error: 'Error en el servidor' });
    }
};

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

        const porEstado = await Incidencia.aggregate([
            ...(userId ? [{ $match: { user: new mongoose.Types.ObjectId(userId) } }] : []),
            {
                $group: {
                    _id: '$estado',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            porSeveridad: stats,
            porTipo: porTipo,
            porEstado: porEstado
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
    deleteImageFromIncidencia,
    getIncidenciasStats
};