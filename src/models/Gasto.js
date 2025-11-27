const { Schema, model } = require('mongoose');

const GastoSchema = Schema({
    tipo: String,
    categoria: String,
    ruc: String,
    razon_social: String,
    fecha_emision: Date,
    total: Number,
    moneda: String,
    igv: Number,
    descuento: Number,
    detraccion: Number,
    modificado: Boolean,
    img_url: String,
    con_sustento: Boolean,
    detalle_sustento: String,
    descripcion: String,
    direccion: String,
    items: [
        {
            descripcion: String,
            precio_unitario: Number,
            cantidad: Number,
            subtotal: Number
        }
    ],
    gira: { type: Schema.Types.ObjectId, ref: 'gira' },
    user: { type: Schema.Types.ObjectId, ref: 'usuario' },

}, {
    timestamps: true
})

module.exports = model('gasto', GastoSchema)