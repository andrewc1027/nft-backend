const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../exceptions/handler');
const UserController = require('../controllers/UserController');
const tokenValidator = require('../middleware/tokenValidator');

router.post('/user/:address', handlerException(UserController.findAndRegister));

router.get('/user/:address',
    handlerException(tokenValidator),
    handlerException(UserController.find));

router.patch('/user/:id',
    handlerException(tokenValidator),
    handlerException(UserController.update));

module.exports = router;
