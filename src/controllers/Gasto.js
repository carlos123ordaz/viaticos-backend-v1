const Gasto = require('../models/Gasto')
const mongoose = require('mongoose');
const axios = require('axios');
const { uploadImageToBlob } = require('../utils/azureBlobService');
require('dotenv')

const registrarGasto = async (req, res) => {
    try {
        let gastoData = req.body;
        if (typeof gastoData.items === 'string') {
            gastoData.items = JSON.parse(gastoData.items);
        }
        if (req.file) {
            const imageUrl = await uploadImageToBlob(req.file);
            gastoData.img_url = imageUrl;
        }
        console.log(gastoData)
        const gasto = new Gasto(gastoData);
        await gasto.save();
        res.status(200).send({
            ok: 'Successfull',
            gasto: gasto
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error on server' });
    }
};

module.exports = { registrarGasto };

const getGastosByGira = async (req, res) => {
    try {
        const { giraId } = req.params;
        const gastos = await Gasto.find({ gira: giraId }).sort({ createdAt: -1 }).select('-items');
        res.status(200).send(gastos);
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error on server' });
    }
}

const getGastosByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const gastos = await Gasto.find({ user: userId }).sort({ createdAt: -1 }).select('-items');
        res.status(200).send(gastos);
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error on server' });
    }
}

const editGastoById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Gasto.findByIdAndUpdate(id, req.body, { new: true });
        if (!result) {
            return res.status(404).send({ error: 'El gasto no existe' });
        }
        res.status(200).send({ ok: 'Successful' });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error on server' });
    }
}
const getGastoById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Gasto.findById(id);
        if (!result) {
            return res.status(404).send({ error: 'El gasto no existe' });
        }
        res.status(200).send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error on server' });
    }
}

const getGastosByGroupCategoria = async (req, res) => {
    try {
        const { giraId } = req.params;
        const gastos = await Gasto.aggregate([
            {
                $match: { gira: new mongoose.Types.ObjectId(giraId) }
            },
            {
                $group: {
                    _id: { categoria: "$categoria", moneda: "$moneda" },
                    total: { $sum: "$total" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    categoria: "$_id.categoria",
                    moneda: "$_id.moneda",
                    total: 1,
                    count: 1
                }
            },
            {
                $sort: { categoria: 1, moneda: 1 }
            }
        ]);
        res.status(200).json(gastos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor" });
    }
};


// const captureVoucher = async (req, res) => {

//     try {
//         const prompt = `
//                         Analiza la imagen proporcionada y determina si corresponde a una factura, comprobante o un recibo de pago.  
//                         Si es válido el recibo de pago, extrae la información solicitada y devuélvela en formato JSON.  
//                         Si un campo no está presente o no se puede leer, coloca el valor como null.  
//                         Estructura de salida esperada (en JSON):
//                         {
//                           "esValido": boolean,
//                           "motivoNoEsValido": string | null,
//                             "razon_social": string,
//                             "ruc": string,
//                             "moneda": 'PEN' | 'USD' | 'EUR',
//                             "fecha_emision": YYYY-MM-DD hh:mm:ss,
//                             "categoria": 'alimentacion' | 'movilidad' | 'hospedeje' | 'otros'
//                             "items": [
//                             {
//                             "descripcion": String,
//                             "cantidad": number,
//                             "precio_unitario": number,
//                             "subtotal": number,
//                             }],
//                             "igv": number,
//                             "total": number,
//                             "descuento": number,
//                             "detraccion":number,
//                             "descripcion": string (Descripción general del gasto)
//                         }
//                         Recuerda:
//                         - Devuelve estrictamente el JSON sin texto adicional.  
//                         - Usa null en los campos que no se encuentren en la factura.
//     `
//         if (!req.file) {
//             return res.status(400).json({ error: 'No file uploaded. Use form-data field name "image".' });
//         }
//         const imageBase64 = req.file.buffer.toString('base64');
//         const mimeType = req.file.mimetype || 'image/png';

//         const result = await model.generateContent([
//             prompt,
//             {
//                 inlineData: {
//                     mimeType,
//                     data: imageBase64,
//                 },
//             },
//         ]);

//         let text = result.response.text();
//         console.log(text)
//         text = text.replace(/```json|```/g, '').trim();
//         let data;
//         try {
//             data = JSON.parse(text);
//         } catch (err) {
//             console.error("Error parsing JSON:", err);
//             return res.status(500).json({ error: 'Error parsing AI response', raw: text });
//         }
//         res.status(200).json(data);
//     } catch (error) {
//         console.error('Error generating content:', error);
//         res.status(500).json({ error: 'Error generating content', message: error.message });
//     }
// }

const captureVoucher = async (req, res) => {
    try {
        return res.status(200).send({
            ruc: '12345678901',
            razon_social: 'Tambo S.A.C.',
            fecha_emision: new Date(),
            descuento: 0,
            total: 165.54,
            moneda: 'PEN',
            igv: 0,
            descripcion: 'Almuerzo de chifa',
            descuento: 0,
            detraccion: 0.12,
            categoria: 'alimentacion',
            detalle_sustento: 'Sustento con IGV',
            items: [
                { descripcion: 'Papa a la huancaina', precio_unitario: 12.5, cantidad: 2, subtotal: 25 },
                { descripcion: 'Arroz con pollo', precio_unitario: 14.0, cantidad: 1, subtotal: 14.0 },
                { descripcion: 'Ceviche', precio_unitario: 16.5, cantidad: 1, subtotal: 16.5 },
            ],
            esValido: true
        })

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const response = await axios.post(
            'https://ocr-invoice-corsusa.cognitiveservices.azure.com/documentintelligence/documentModels/prebuilt-invoice:analyze?api-version=2024-02-29-preview',
            req.file.buffer,
            {
                headers: {
                    "Ocp-Apim-Subscription-Key": process.env.AZURE_KEY,
                    "Content-Type": req.file.mimetype,
                },
            }
        );

        const operationLocation = response.headers["operation-location"];

        let result;
        for (let i = 0; i < 10; i++) {
            const poll = await axios.get(operationLocation, {
                headers: {
                    "Ocp-Apim-Subscription-Key": process.env.AZURE_KEY
                },
            });

            if (poll.data.status === "succeeded") {
                result = poll.data;
                break;
            } else if (poll.data.status === "failed") {
                throw new Error("OCR failed");
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        const mappedData = mapVoucherData(result);
        res.json(mappedData);
    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).json({ error: "Error procesando imagen", details: err.message });
    }
}

const mapVoucherData = (ocrResult) => {
    const document = ocrResult?.analyzeResult?.documents?.[0];
    if (!document) {
        return {
            esValido: false,
            motivoNoEsValido: "No se pudo extraer información del documento"
        };
    }

    const fields = document.fields || {};
    const items = fields.Items?.valueArray?.map((item, index) => {
        const obj = item.valueObject || {};
        return {
            descripcion: obj.Description?.valueString || obj.Description?.content || '',
            cantidad: obj.Quantity?.valueNumber || 1,
            precio_unitario: obj.UnitPrice?.valueCurrency?.amount || 0,
            subtotal: obj.Amount?.valueCurrency?.amount || 0,
        };
    }) || [];

    const content = ocrResult?.analyzeResult?.content || '';
    const rucMatch = content.match(/\b\d{11}\b/);
    const vendorRuc = rucMatch ? rucMatch[0] : null;
    const vendorName = fields.VendorName?.valueString ||
        fields.VendorAddressRecipient?.valueString || '';
    const cleanVendorName = vendorName.replace(/\n/g, ' ').trim();

    return {
        esValido: true,
        numero: fields.InvoiceId?.valueString || null,
        fecha_emision: fields.InvoiceDate?.valueDate || null,
        moneda: fields.InvoiceTotal?.valueCurrency?.currencyCode || 'PEN',
        razon_social: cleanVendorName,
        ruc: vendorRuc,
        direccion: fields.VendorAddress?.content?.replace(/\n/g, ' ') || null,
        items,
        subtotal: fields.SubTotal?.valueCurrency?.amount || null,
        descuento: Math.abs(fields.TotalDiscount?.valueCurrency?.amount || 0),
        igv: fields.TotalTax?.valueCurrency?.amount || 0,
        detraccion: 0,
        total: fields.InvoiceTotal?.valueCurrency?.amount || 0,
        categoria: 'otros',
        detalle_sustento: fields.TotalTax?.valueCurrency?.amount > 0 ? 'Sustento con IGV' : 'Sustento sin IGV',
        descripcion: '',
        confianza: document.confidence || null
    };
};

module.exports = {
    captureVoucher,
    registrarGasto,
    getGastosByGira,
    getGastosByGroupCategoria,
    editGastoById,
    getGastoById,
    getGastosByUser
}

