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
    imagenes: [{
        type: String,
        default: null
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    deadline: {
        type: Date,
        default: null
    },
    asigned: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    estado: {
        type: String,
        enum: ['Pendiente', 'En Revisión', 'Resuelto', 'Cerrado'],
        default: 'Pendiente'
    },
    historialEstados: [{
        estado: {
            type: String,
            enum: ['Pendiente', 'En Revisión', 'Resuelto', 'Cerrado']
        },
        fecha: {
            type: Date,
            default: Date.now
        },
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        notas: String
    }]
}, {
    timestamps: true
});

incidenciaSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    if (update.estado || update.$set?.estado) {
        const nuevoEstado = update.estado || update.$set.estado;
        if (!update.$push) {
            update.$push = {};
        }
        update.$push.historialEstados = {
            estado: nuevoEstado,
            fecha: new Date(),
            usuario: update.usuarioModificador,
            notas: update.notasEstado || ''
        };
    }
    next();
});

module.exports = mongoose.model('incidence', incidenciaSchema);