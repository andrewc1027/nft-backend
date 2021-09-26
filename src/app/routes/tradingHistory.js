const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../exceptions/handler');
const tradingController = require('../controllers/tradingHistoryController');

router.get('/history/:listingID',
    handlerException(tradingController.index));

module.exports = router;
