const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

const {
    registrarIncidencia,
    getIncidenciasByUser,
    getAllIncidencias,
    getIncidenciaById,
    editIncidenciaById,
    deleteIncidenciaById,
    deleteImageFromIncidencia,
    getIncidenciasStats
} = require('../controllers/Incidencia');

router.post('/', upload.array('imagenes', 5), registrarIncidencia);
router.get('/', getAllIncidencias);
router.get('/user/:userId', getIncidenciasByUser);
router.get('/stats/:userId?', getIncidenciasStats);
router.get('/:id', getIncidenciaById);
router.put('/:id', upload.array('imagenes', 5), editIncidenciaById);
router.delete('/:id', deleteIncidenciaById);
router.delete('/:id/image', deleteImageFromIncidencia);

module.exports = router;