const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../exceptions/handler');
const tokenValidator = require("../middleware/tokenValidator");
const orderController = require('../controllers/orderController');

router.get('/orders',
    handlerException(tokenValidator),
    handlerException(orderController.index));
router.post('/orders',
    handlerException(tokenValidator),
    handlerException(orderController.insert));
module.exports = router;
