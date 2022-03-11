const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../exceptions/handler');
const tokenValidator = require("../middleware/tokenValidator");
const customNtfController = require('../controllers/customNtfController');

router.get('/order',
    handlerException(tokenValidator),
    handlerException(customNtfController.index));
module.exports = router;
