const leaderboardService = require("../services/leaderboardService")

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
async function index(req, res, next) {
    leaderboardService.index(req.query)
        .then((data)=>{
        return res.json(data);
    })
}

module.exports = {
    index,
}