const User = require("../models/User");
const bcrypt = require('bcrypt')

const login = async (req, res) => {
    try {
        const { correo, password } = req.body;
        const userFound = await User.findOne({ correo });
        if (userFound) {
            const isMatch = await bcrypt.compare(password, userFound.password);
            if (isMatch) {
                return res.status(200).send({ token: userFound._id });
            }
        }
        return res.status(401).send({ error: 'El correo o la contraseña no son correctos' });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error on server' });
    }
}

module.exports = {
    login
}