const order = require('../models/order');


async function getAll(query, page, limit) {
    const filters = {};
    const orders = await order
        .paginate(filters,
            {page: page, limit: limit});
    return orders;
}

async function insert(data) {
    const details = data.details ??= "";

    const item = await order.create({
        type: data.type,
        isAerial: (data.isAerial === true || data.isAerial === 'true'),
        object: data.object,
        location: data.location,
        details: details,
        contactMethod: data.contactMethod,
        contactInfo: data.contactInfo,
        createdAt: Date.now()
    });
    return item;
}

module.exports = {
    getAll,
    insert
};
