const express = require('express');
const { insertAsistencia, getAsistenciasByDate, getAsistenciaByUser } = require('../controllers/Asistencia');
const router = express.Router();

router.post('/', insertAsistencia);
router.get('/:fecha', getAsistenciasByDate);
router.get('/user/:id', getAsistenciaByUser);

module.exports = router;