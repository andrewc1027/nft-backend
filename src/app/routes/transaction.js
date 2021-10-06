const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../exceptions/handler');
const trxController = require('../controllers/transactionController');

router.get('/transactions',
    handlerException(trxController.index));

module.exports = router;
