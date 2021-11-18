const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../exceptions/handler');
const cityController = require('../controllers/cityController');

router.get('/cities',
    handlerException(cityController.index));

router.post('/cities',
    handlerException(cityController.add));

router.get('/cities/:id',
    handlerException(cityController.getOne));

router.get('/autocomplete/cities',
    handlerException(cityController.getAutocomplete));

module.exports = router;
