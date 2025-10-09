const { Schema, model } = require('mongoose');

const AsistenciaSchema = Schema({
    usuario: { type: Schema.Types.ObjectId, ref: 'usuario' },
    entrada: Date,
    salida: Date,
    latitude_entrada: Number,
    longitude_entrada: Number,
    latitude_salida: Number,
    longitude_salida: Number,
    horas_trabajadas: Number,
    valido_entrada: Boolean,
    valido_salida: Boolean,
    sede: { type: Schema.Types.ObjectId, ref: 'sede' },
}, {
    timestamps: true
})

module.exports = model('asistencia', AsistenciaSchema)