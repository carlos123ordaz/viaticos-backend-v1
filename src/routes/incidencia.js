// routes/incidencia.js
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
    getIncidenciasStats
} = require('../controllers/Incidencia');

// Rutas
router.post('/', upload.single('imagen'), registrarIncidencia);
router.get('/', getAllIncidencias);
router.get('/user/:userId', getIncidenciasByUser);
router.get('/stats/:userId?', getIncidenciasStats);
router.get('/:id', getIncidenciaById);
router.put('/:id', upload.single('imagen'), editIncidenciaById);
router.delete('/:id', deleteIncidenciaById);

module.exports = router;