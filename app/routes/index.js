const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const { userController, processController } = require('../controllers');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('Express Application');
});

router.get('/api/user', userController.list);
router.get('/process', processController.list);
router.get('/process/:id', processController.find);
router.post('/process/save', processController.save);
router.delete('/process/:id', processController.delete);


module.exports = router;