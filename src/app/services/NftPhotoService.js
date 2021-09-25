const NFTPhotos = require('../models/nftPhoto');
const fs = require('fs');
const pinata = require('../config/pinata');

/**
 * @param {Object} query
 * @param {Object} user
 * @param {Number} page
 * @param {Number} limit
 * @return {Array}
 */
async function getAll(query, user, page, limit) {
  const collections = await NFTPhotos.paginate({
    originalOwner: user.username,
    cid: {$ne: null},
  }, {page: page, limit: limit});
  return collections;
}

/**
 * @param {String} id
 * @return {Array}
 */
async function getOne(id) {
  const photo = await NFTPhotos.findById(id).orFail(
      () => Error('Not Found'),
  );
  return photo;
}

/**
 * @param {Object} data
 * @param {File} files
 * @param {Object} user
 * @return {Array}
 */
async function insert(data, files, user) {
  const nftMongo = await NFTPhotos.create({
    name: data.name,
    location: data.location,
    address: data.address,
    tags: data.tags,
    rawSize: files.raw[0].size,
    size: files.photo[0].size,
    originalName: files.photo[0].originalname,
    originalOwner: user.username,
    originalOwnerID: user._id,
    collections: data.collections,
  });
  const fileStream = fs.createReadStream(files.raw[0].path);
  const result = await pinata.pinFileToIPFS(fileStream, {
    pinataMetadata: {
      name: data.name,
    },
  });
  // If upload to IPFS failed, delete mongo record of the NFT
  if (!result.IpfsHash) {
    await NFTPhotos.findByIdAndDelete(nftMongo._id);
  }
  await NFTPhotos.findByIdAndUpdate(nftMongo._id, {
    cid: result.IpfsHash,
    pinSize: result.PinSize,
    pinDate: result.Timestamp,
  });

  return result;
}


/**
 * @param {String} id
 * @param {Object} data
 * @return {Array}
 */
async function update(id, data) {
  return await NFTPhotos.findByIdAndUpdate(id, data).orFail(
      () => Error('Not Found'),
  ); ;
}

/**
 * @param {String} id
 * @return {Array}
 */
async function remove(id) {
  const exs = await NFTPhotos.findById(id).orFail(
      () => Error('Not Found'),
  ); ;
  pinata.unpin(exs.cid).then((result) => {
    NFTPhotos.findByIdAndDelete(id).exec();
  });
  return exs;
}

module.exports = {
  getAll,
  getOne,
  insert,
  update,
  remove,
};
