const mongoose = require('mongoose');

const incidenciaSchema = new mongoose.Schema({
    fecha: {
        type: Date,
        required: true
    },
    ubicacion: {
        type: String,
        required: true
    },
    areaAfectada: {
        type: String,
        required: true
    },
    tipoIncidente: {
        type: String,
        required: true,
        enum: ['Acto Subestándar', 'Condición Insegura', 'Incidente Ambiental',
            'Falla de Equipo Crítico', 'Accidente de Trabajo', 'Casi Accidente']
    },
    gradoSeveridad: {
        type: String,
        required: true,
        enum: ['Bajo', 'Medio', 'Alto', 'Crítico']
    },
    descripcion: {
        type: String,
        required: true
    },
    recomendacion: {
        type: String,
        default: ''
    },
    img_url: {
        type: String,
        default: null
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    estado: {
        type: String,
        enum: ['Pendiente', 'En Revisión', 'Resuelto'],
        default: 'Pendiente'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('incidence', incidenciaSchema);