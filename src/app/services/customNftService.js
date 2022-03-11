const customNft = require('../models/customNft');


async function getAll(query, page, limit, self) {
    const filters = {};
    const customNfts = await customNft
        .paginate(filters,
            {page: page, limit: limit});
    return customNfts;
}

module.exports = {
    getAll,
};
