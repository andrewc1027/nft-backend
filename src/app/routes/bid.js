const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../exceptions/handler');
const bidController = require('../controllers/bidController');
const tokenValidator = require('../middleware/tokenValidator');

router.get('/listings/:listingID/bids',
    handlerException(tokenValidator),
    handlerException(bidController.index));

router.post('/listings/:listingID/bids',
    handlerException(tokenValidator),
    handlerException(bidController.add));

module.exports = router;
