const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../exceptions/handler');
const UserController = require('../controllers/UserController');

router.post('/user/:address', handlerException(UserController.findAndRegister));
router.get('/user/:address', handlerException(UserController.find));

module.exports = router;
