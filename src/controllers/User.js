const Gira = require("../models/Gira");
const User = require("../models/User");
const bcrypt = require('bcrypt')

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).lean();
        if (!user) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }
        const girasUsuario = await Gira.find({ usuario: user._id, active: true });
        return res.status(200).json({ ...user, giras: girasUsuario });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json(users);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
const addUser = async (req, res) => {
    try {
        const { correo, password } = req.body;
        const userFound = await User.findOne({ correo });
        if (userFound) {
            return res.status(400).json({ error: 'Correo existente' });
        }
        const salt = await bcrypt.genSalt(10);
        const hastPassword = await bcrypt.hash(password, salt);
        const user = new User({ ...req.body, password: hastPassword });
        await user.save();
        return res.status(200).json({ ok: 'Successful' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
const editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userFound = await User.findByIdAndUpdate(id, req.body, { new: true });
        if (!userFound) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }
        return res.status(200).json({ ok: 'Successful' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
module.exports = {
    getUsers,
    getUserById,
    addUser,
    editUser
}

