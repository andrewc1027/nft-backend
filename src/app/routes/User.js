const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../exceptions/handler');
const userController = require('../controllers/userController');
const tokenValidator = require('../middleware/tokenValidator');

/**
 * These Routes are for seller page
 */
router.post('/user/:address', handlerException(userController.findAndRegister));

router.get('/user/:address',
    handlerException(tokenValidator),
    handlerException(userController.find));

router.patch('/user/:id',
    handlerException(tokenValidator),
    handlerException(userController.update));

module.exports = router;
