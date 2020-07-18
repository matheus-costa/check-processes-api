const { User } = require('../models');

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
}