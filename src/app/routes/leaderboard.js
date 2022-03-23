const {handlerException} = require("../exceptions/handler");
const tokenValidator = require("../middleware/tokenValidator");
const leaderboardController = require("../controllers/leaderboardController")
router.get('/listings',
    handlerException(tokenValidator),
    handlerException(leaderboardController.index));
