const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../exceptions/handler');
const orderController = require('../controllers/orderController');

router.get('/orders',
    handlerException(orderController.index));
router.post('/orders',
    handlerException(orderController.insert));
module.exports = router;
