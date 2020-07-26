const { User } = require('../models');
const bcrypt = require('bcryptjs');

module.exports = {
    list(req, res) {
        return User
            .findAll({
                order: [
                    ['createdAt', 'DESC'],
                ],
            })
            .then((users) => res.status(200).send(users))
            .catch((error) => { res.status(400).send(error); });
    },

    async save(req, res) {
        const user = req.body;
        user.password = bcrypt.hashSync(user.password);
        if(user.id > 0){
            return User.update(user, {where: {id: user.id}})
                        .then((users) => res.status(200).send(users))
                        .catch((error) => { res.status(400).send(error); });
        }

        return User.create(user)
            .then((users) => res.status(200).send(users))
            .catch((error) => { res.status(400).send(error); });
    }
}