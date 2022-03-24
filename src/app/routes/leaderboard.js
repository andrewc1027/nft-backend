const express = require('express');
const router = express.Router();
const {handlerException} = require("../exceptions/handler");
const leaderboardController = require("../controllers/leaderboardController")

router.get('/leaderboard',
    handlerException(leaderboardController.index));

module.exports = router;