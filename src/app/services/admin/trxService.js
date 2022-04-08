const trxModel = require('../../models/transaction');

/**
 * 
 * @param {Object} query 
 * @param {Number} page 
 * @param {Number} size 
 */
async function getTransactions(query, page, size) {
    const trxs = await trxModel.paginate({
        event: 'Purchasing', // Show Sell Transactions Only
    }, {page: page, limit: size});
    return trxs;
}

module.exports = {
    getTransactions,
}