const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

const { registrarGasto, getGastosByGira, captureVoucher, getGastosByGroupCategoria, editGastoById, getGastoById } = require('../controllers/Gasto');


router.post('/capture', upload.single('image'), captureVoucher);
router.post('/', upload.single('imagen'), registrarGasto);
router.put('/:id', editGastoById);
router.get('/:id', getGastoById);
router.get('/gira/:giraId', getGastosByGira);
router.get('/gira/:giraId/categoria', getGastosByGroupCategoria);


module.exports = router;