const listing = require('../models/listing');
const trading = require('../models/tradingHistory');
const joi = require('joi');
const fs = require('fs');
const pinata = require('../config/pinata');
const userSvc = require('./userService');
/**
 * @param {Object} query
 * @param {Number} page
 * @param {Number} limit
 * @return {Array}
 */
async function getAll(query, page, limit) {
  const listings = await listing.paginate({
    isPublished: true,
    isActive: true,
  }, {page: page, limit: limit});
  return listings;
}

/**
 * @param {String} id
 */
async function getOne(id) {
  viewCounter(id);
  const detail = await listing.findById(id).orFail(
      () => Error('Not Found'),
  );
  return detail;
}

/**
 * @param {Object} data
 * @param {File} files
 * @param {Object} user
 * @return {Array}
 */
async function insert(data, files, user) {
  const fileStream = fs.createReadStream(files.raw[0].path);
  const schema = joi.object({
    name: joi.string().required(),
    description: joi.string().required(),
    location: joi.string().required(),
    address: joi.string().required(),
    collections: joi.array(),
  });
  const {error} = schema.validate(data);
  if (error) {
    fs.unlinkSync(files.raw[0].path);
    throw new Error(error);
  }
  await pinata.pinFileToIPFS(fileStream, {
    pinataMetadata: {
      name: data.name,
    },
  }).then(function(result) {
    if (result.isDuplicate) {
      fs.unlinkSync(files.raw[0].path);
      throw new Error('NFT is a duplicate');
    }
    // Pre Check if user exists
    userSvc.find(user.address);
    const item = listing.create({
      name: data.name,
      description: data.description,
      location: data.location,
      address: data.address,
      creator: {
        name: user.username,
        ID: user._id,
      },
      collections: data.collections,
      cid: result.IpfsHash,
      ipfs: result,
      fileOriginalName: files.file[0].originalName,
      filePath: files.file[0].path,
    });

    // TODO: Delete uploaded files once it uploaded to ipfs
    fs.unlinkSync(files.raw[0].path);
    return item;
  }).catch((err)=>{
    throw new Error(err);
  });
}


/**
 * @param {String} id
 * @param {Object} files
 * @param {Object} data
 * @return {Array}
 */
async function update(id, files, data) {
  // TODO: handles file update
  const item = await nftPhotos.findByIdAndUpdate(id, data).orFail(
      () => Error('Not Found'));
  return item;
}

/**
 * @param {String} id
 * @return {Array}
 */
async function remove(id) {
  const exs = await nftPhotos.findById(id).orFail(
      () => Error('Not Found'),
  );

  /**
   *  We Can't remove file from IPFS,
   *  but we can unpin it so it'll get removed by IPFS garbage collector
   */
  pinata.unpin(exs.cid).then((result) => {
    nftPhotos.findByIdAndDelete(id);
  });
  return exs;
}

/**
 * @param {String} id
 * @param {Object} data
 * @param {Object} user
 */
async function purchase(id, data, user) {
  // What if there's 2 simultaneous purchase ?
  const item = await listing.findById(id).orFail(
      () => Error('Listing Not Found'),
  );
  const trade = await trading.create({
    to: user.address,
    from: item.owner,
    price: item.price,
    date: new Date.Now(),
    listingID: id,
    listingCID: item.cid,
  });

  return trade;
}

/**
 * @param {String} id
 */
async function viewCounter(id) {
  const item = await listing.findById(id);
  await listing.findByIdAndUpdate(id, {
    views: item.views+1,
  });
}

/**
 * @param {String} id
 * @param {Object} user
 */
async function likeCounter(id, user) {
  const item = await listing.findById(id);
  await listing.findByIdAndUpdate(id, {
    likes: item.likes+1,
  });

  // Add Listing to User Favourites List
}

/**
 * Add Nft to published listing
 * @param {String} id
 * @param {Object} data
 * @param {Object} user
 */
async function publish(id, data, user) {
  const schema = joi.object({
    price: joi.number().required(),
    royalties: joi.string().required(),
    owner: joi.string().required(),
    copies: joi.number().required(),
    tokenID: joi.string().required(),
    activeDate: joi.date().optional(),
    buyerAddress: joi.string().optional(),
    paymentTokens: joi.array(),
  });
  const {error} = schema.validate(data);
  if (error) {
    throw new Error(err);
  }
  const listedItem = await listing.findByIdAndUpdate(id, {
    owner: user.username,
    price: data.price,
    royalties: data.royalties,
    activeDate: data.activeDate,
    buyerAddress: data.buyerAddress,
    tokenID: data.tokenID,
  });

  return listedItem;
}


module.exports = {
  getAll,
  getOne,
  insert,
  update,
  remove,
  purchase,
  likeCounter,
  publish,
};
