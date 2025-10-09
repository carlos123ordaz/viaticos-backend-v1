const express = require('express');
const {  getUserById, getUsers, addUser, editUser } = require('../controllers/User');
const router = express.Router();

router.get('/:id', getUserById);
router.get('/', getUsers);
router.post('/', addUser);
router.put('/:id', editUser);

module.exports = router;