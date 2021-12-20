const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {handlerException} = require('../exceptions/handler');
const bidController = require('../controllers/bidController');
const tokenValidator = require('../middleware/tokenValidator');

router.get('/bids',
    handlerException(bidController.index));

router.get('/bids/me',
    handlerException(tokenValidator),
    handlerException(bidController.myBid));
router.post('/bids',
    handlerException(tokenValidator),
    handlerException(bidController.add));

router.delete('/bids/:id',
    handlerException(tokenValidator),
    handlerException(bidController.remove));

module.exports = router;
