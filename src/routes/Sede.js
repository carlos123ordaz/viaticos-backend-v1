const express = require('express');
const { insertSede, getAllSedes, updateSede } = require('../controllers/Sede');
const router = express.Router();

router.post('/', insertSede);
router.get('/', getAllSedes);
router.put('/:id', updateSede);

module.exports = router;