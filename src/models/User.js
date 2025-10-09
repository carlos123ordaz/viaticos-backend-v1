const { Schema, model } = require('mongoose');

const UserSchema = Schema({
    photo: String,
    nombre: String,
    apellido: String,
    dni: String,
    cargo: String,
    area: [String],
    celular: String,
    correo: String,
    password: String,
    sede: { type: Schema.Types.ObjectId, ref: 'sede' },
    active: { type: Boolean, default: true }
}, {
    timestamps: true
})

module.exports = model('usuario', UserSchema)