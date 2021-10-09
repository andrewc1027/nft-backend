const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../exceptions/handler');
const trxController = require('../controllers/transactionController');
const tokenValidator = require('../middleware/tokenValidator');

router.get('/transactions',
    handlerException(trxController.index));

router.get('/transactions/me',
    handlerException(tokenValidator),
    handlerException(trxController.me));

module.exports = router;
