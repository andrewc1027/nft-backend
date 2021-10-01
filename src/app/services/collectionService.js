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
 * @param {File} file
 * @param {Object} user
 * @return {Object}
 */
async function insert(data, file, user) {
  const res = await collection.create({
    name: data.name,
    description: data.description,
    logo: file.path,
    owner: user._id,
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
