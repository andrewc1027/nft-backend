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
  let url = '';
  if (data.url) {
    url = data.url;
  } else {
    url = `${data.name.toLowerCase().replace(' ', '-')}+${user._id}`;
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
    url: url,
  });

  return res;
}


/**
 * @param {String} id
 * @param {Object} data
 * @param {Object} file
 * @return {Object}
 */
async function update(id, data, file) {
  const exs = await collection.findById(id).orFail(
      () => Error('Not Found'),
  ); ;
  let filePath = exs.logo;
  if (file) {
    filePath = file.path;
  }
  const res = await collection.findByIdAndUpdate(id, {
    name: data.name,
    description: data.description,
    logo: filePath,
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

module.exports = {
  getAll,
  getOne,
  insert,
  update,
  remove,
};
