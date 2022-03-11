const order = require('../models/order');
const userSvc = require('./userService');


async function getAll(query, page, limit, self) {
    const filters = {};
    const orders = await order
        .paginate(filters,
            {page: page, limit: limit});
    return orders;
}

async function insert(data, user) {
    const details = data.details ??= "";
    await userSvc.find(user._id);

    const item = await order.create({
        creator: user._id,
        type: data.type,
        isAerial: (data.isAerial === 'true'),
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
