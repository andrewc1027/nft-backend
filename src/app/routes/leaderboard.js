const express = require('express');
const router = express.Router();
const {handlerException} = require("../exceptions/handler");
const tokenValidator = require("../middleware/tokenValidator");
const leaderboardController = require("../controllers/leaderboardController")

router.get('/leaderboard',
    // handlerException(tokenValidator),
    handlerException(leaderboardController.index));

module.exports = router;