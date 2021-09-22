require('dotenv').config();
const NFTPhotos = require('../models/NftPhoto');
const Ipfs = require('ipfs-http-client');
/**
 * @param {Object} query
 * @param {Object} user
 * @return {Array}
 */
async function getAll(query, user) {
  const collections = await NFTPhotos.find({
    originalOwner: user.username,
  }).exec();
  console.log(collections);
  return collections;
}

/**
 * @param {Object} query
 * @return {Array}
 */
async function getOne(query) {

}

/**
 * @param {Object} data
 * @param {File} file
 * @param {Object} user
 * @return {Array}
 */
async function insert(data, file, user) {
  const ipfs = await Ipfs.create('http://127.0.0.1:5002');
  const {cid} = await ipfs.add(file.path);

  await NFTPhotos.create({
    name: data.name,
    location: data.location,
    address: data.address,
    tags: data.tags,
    size: file.size,
    originalName: file.originalname,
    cid: cid,
    originalOwner: user.username,
    originalOwnerID: user._id,
  });
  const nft = await NFTPhotos.findOne({cid: cid}).exec();
  return nft;
}


/**
 * @param {Object} query
 * @return {Array}
 */
async function update(query) {

}

/**
 * @param {Object} query
 * @return {Array}
 */
async function remove(query) {

}

module.exports = {
  getAll,
  getOne,
  insert,
  update,
  remove,
};
