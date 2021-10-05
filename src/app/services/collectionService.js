const collection = require('../models/collection');
/**
 * @param {Object} query
 * @param {Object} user
 * @param {Number} page
 * @param {Number} limit
 * @return {Object}
 */
async function getAll(query, user, page, limit) {
  const collections = await collection.paginate({
    owner: user._id,
  }, {page: page, limit: limit});
  return collections;
}

/**
 * @param {String} id
 * @return {Object}
 */
async function getOne(id) {
  const item = await collection.findById(id).orFail(
      () => Error('Not Found'),
  );
  return item;
}

/**
 * @param {Object} data
 * @param {File} files
 * @param {Object} user
 * @return {Object}
 */
async function insert(data, files, user) {
  let bannerImage = '';
  if (files.bannerImage) {
    bannerImage = files.bannerImage[0].location;
  }
  let featureImage = '';
  if (files.featureImage) {
    featureImage = files.featureImage[0].location;
  }

  const res = await collection.create({
    name: data.name,
    description: data.description,
    bannerImage: bannerImage,
    featureImage: featureImage,
    logoImage: files.logoImage[0].location,
    owner: user._id,
    payoutAddress: data.payoutAddress,
    blockchain: data.blockchain,
    royalties: data.royalties,
    url: await urlMaker(data.name, user._id),
  });

  return res;
}


/**
 * @param {String} id
 * @param {Object} data
 * @param {Object} files
 * @return {Object}
 */
async function update(id, data, files) {
  const exs = await collection.findById(id).orFail(
      () => Error('Not Found'),
  );
  let bannerImage = exs.bannerImage;
  if (files.bannerImage) {
    bannerImage = files.bannerImage[0].location;
  }
  let featureImage = exs.featureImage;
  if (files.featureImage) {
    featureImage = files.featureImage[0].location;
  }
  let logoImage = exs.logoImage;
  if (files.logoImage) {
    logoImage = files.logoImage[0].location;
  }
  let url = exs.url;
  if (data.url) {
    url = data.url;
  }
  const res = await collection.findByIdAndUpdate(id, {
    name: data.name,
    description: data.description,
    logoImage: logoImage,
    bannerImage: bannerImage,
    featureImage: featureImage,
    payoutAddress: data.payoutAddress,
    blockchain: data.blockchain,
    url: url,
  });

  return res;
}

/**
 * @param {String} id
 * @return {Object}
 */
async function remove(id) {
  const result = await collection.findByIdAndDelete(id).orFail(
      () => Error('Not Found'),
  );
  return result;
}

/**
 * @param {string} name
 * @param {object} userID
 */
async function urlMaker(name, userID) {
  name = name.replace('/[^a-zA-Z0-9]/g', '-');
  name = name.split(' ').join('-');
  name = name.replace(',', '-');
  const url = `${name.toLowerCase()}-${userID}`;
  return url;
}

module.exports = {
  getAll,
  getOne,
  insert,
  update,
  remove,
};
