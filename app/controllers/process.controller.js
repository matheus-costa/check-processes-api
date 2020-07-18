const { Process } = require('../models');

module.exports = {
    list(req, res) {
        return Process.findAll({
                order: [ ['createdAt', 'DESC'], ],
            })
            .then((processes) => {
                res.status(200).send(processes);
            })
            .catch((error) => { res.status(400).send(error); });
    },

    find(req, res) {
        return Process.findOne({ where: {id: req.params.id} })
            .then((process) => {
                res.status(200).send(process);
            })
            .catch((error) => { res.status(400).send(error); });
    },

    save(req, res) {
        console.log(req.body.id);
        return Process.findOne({ where: {id: req.body.id} })
            .then((process) => {
                if(!process) {
                    return Process.create(req.body).then(p => {
                        res.json(p);
                    });
                }

                return Process.update(req.body, {where: {id: req.body.id}}).then(p => {
                    res.json(p);
                });
            })
            .catch((error) => { res.status(400).send(error); });
    },
}