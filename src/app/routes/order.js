const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../exceptions/handler');
const tokenValidator = require("../middleware/tokenValidator");
const customNtfController = require('../controllers/orderController');

router.get('/orders',
    handlerException(tokenValidator),
    handlerException(customNtfController.index));
router.post('/orders',
    handlerException(tokenValidator),
    handlerException(customNtfController.insert));
module.exports = router;
