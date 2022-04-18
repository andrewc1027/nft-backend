const trxModel = require('../../models/transaction');

/**
 * 
 * @param {Object} query 
 * @param {Number} page 
 * @param {Number} size 
 * @param {String} sort
 */
async function getTransactions(query, page, size, sort) {
    const filters = {};
    filters['event'] = 'Purchasing';

    if (query.to) {
        filters['to'] = query.to;
    }
    if (query.from) {
        filters['from'] = query.from;
    }
    if (query.startDate) {
        let date_from = new Date(query.startDate);
        date_from = new Date(date_from.setDate(date_from.getDate())).toISOString();

        let date_to = new Date(query.endDate);
        date_to = new Date(date_to.setDate(date_to.getDate() + 1)).toISOString();

        filters['date'] = {
            $gte: date_from,
            $lte: date_to,
        }
    }
    const sortBy = sort.split(':');
    const orderBy = sortBy[1] === 'asc' ? '1' : '-1';
    const trxs = await trxModel.paginate(filters, {page: page, limit: size, sort: {[sortBy[0]]: orderBy}});
    return trxs;
}

module.exports = {
    getTransactions,
}