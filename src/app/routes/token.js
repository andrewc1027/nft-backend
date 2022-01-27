const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../exceptions/handler');
const tokenController = require('../controllers/tokenController');

router.get('/token/ipfs/:token', handlerException(tokenController.getMetadata));
router.get('/token/polygon/:token', handlerException(tokenController.getPolygonMetadata));

module.exports = router;