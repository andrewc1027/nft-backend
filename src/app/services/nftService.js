const {ObjectId} = require('mongodb');
const listing = require('../models/listing');
const nft = require('../models/nft');
const axios = require('axios');
const ipfsUtils = require('../utils/ipfs');
const s3Utils = require('../utils/s3');
/**
 * @param {Object} query
 * @param {Object} user
 * @param {Number} page
 * @param {Number} limit
 * @return {Object}
 */
async function getAll(query, user, page, limit) {

}

/**
 * @param {String} listingId
 */
async function getByListingId(listingId) {
  return await nft.find({listingID: listingId});
}

/**
 * @param {String} id
 * @return {Object}
 */
async function getOne(id) {
  const item = await nft.findById(id).orFail(
    () => Error('Not Found'),
  );
  return item;
}


/**
 * @param {Object} data
 */
async function add(data) {
  const res = await nft.create(data);
  return res;
}

/**
 * @param {ObjectId} listingId
 * @param {Array} files
 * @param {Array} deletedFiles
 */
async function handle360(listingId, files = [], deletedFiles) {
  // await remove(deletedFiles);
  for await (const file of files) {
    const res = await ipfsUtils.uploadToIPFS(file.path, {
      listingID: listingId.toString(),
      name: file.originalname,
    });
    const item = {
      cid: res.IpfsHash,
      pinDate: res.Timestamp,
      pinSize: res.PinSize,
      originalName: file.originalname,
      path: `https://homejab-dev.mypinata.cloud/ipfs/${res.IpfsHash}`,
    };
    await nft.create({
      'listingID': new ObjectId(listingId),
      'ipfs.file': item,
    });
  }
  recount360(listingId);
}

/**
 * Recount 360 Nft
 * @param {String} listingId
 */
async function recount360(listingId) {
  const ids = await nft.find({
    'listingID': listingId,
    'deleted': false,
  }).distinct('_id');
  await listing.findByIdAndUpdate(listingId, {nfts: ids});
  await s3Utils.compress360(listingId);
}

/**
 * @param {String} id
 * @param {Object} files
 */
async function handle(id, files) {
  const item = await nft.findOneAndUpdate(
    {'listingID': new ObjectId(id)},
    {'listingID': new ObjectId(id)},
    {upsert: true, new: true});
  if (files) {
    const res = await ipfsUtils.uploadToIPFS(files[0].path, {
      listingID: id.toString(),
      name: files[0].originalname,
    });
    item.ipfs.file = {
      cid: res.IpfsHash,
      pinDate: res.Timestamp,
      pinSize: res.PinSize,
      originalName: files[0].originalname,
      path: `https://homejab-dev.mypinata.cloud/ipfs/${res.IpfsHash}`,
    };
  }
  const nfts = [];
  nfts.push(item._id);
  await listing.findByIdAndUpdate(id, {nfts: nfts});
  await item.save();
}

/**
 * @param {Array} ids
 */
async function remove(ids) {
  let listingId;
  await Promise.all(ids.map(async (id) => {
    const item = await nft.findById(id);
    listingId = item.listingID;
    console.log('removing :', id);
    await nft.deleteById(id);
    ipfsUtils.unpin(item.ipfs.file.cid);
  }));
  if (listingId) {
    await recount360(listingId);
  }
}

/**
 * @param {String} listingID
 * @param {String} token
 * @param {String} owner
 */
async function hashMetadata(listingID, token, owner) {
  const nfts = await nft.find({listingID: new ObjectId(listingID)}).select('ipfs.file');
  for (const nft of nfts) {
    const url = `${process.env.PINATA_API_URL}pinning/hashMetadata`;
    const body = {
      ipfsPinHash: nft.ipfs.file.cid,
      keyvalues: {
        token: token,
        owner: owner,
      }
    };
    const res = await axios.default.put(url, body, {
      headers: {
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_KEY,
      }
    });
    if (res.isAxiosError) {
      console.log(res.data.error);
    }
  }
}

module.exports = {
  getAll,
  getOne,
  getByListingId,
  add,
  handle360,
  handle,
  remove,
  hashMetadata,
};
