const trxModel = require('../../models/transaction');

/**
 * 
 * @param {Object} query 
 * @param {Number} page 
 * @param {Number} size 
 * @param {String} sort
 */
async function getTransactions(query, page, size, sort) {
    const sortBy = sort.split(':');
    const orderBy = sortBy[1] === 'asc' ? '1' : '-1';
    const trxs = await trxModel.paginate({
        event: 'Purchasing', // Show Sell Transactions Only
    }, {page: page, limit: size, sort: {[sortBy[0]]: orderBy}});
    return trxs;
}

module.exports = {
    getTransactions,
}