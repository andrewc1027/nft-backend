const nftPhotos = require('../models/nftPhoto');
const fs = require('fs');
const pinata = require('../config/pinata');
const listing = require('../models/listing');
const contract = require('./contractService');

/**
 * @param {Object} query
 * @param {Object} user
 * @param {Number} page
 * @param {Number} limit
 * @return {Array}
 */
async function getAll(query, user, page, limit) {
  const collections = await nftPhotos.paginate({
    creator: user.username,
  }, {page: page, limit: limit});
  return collections;
}

/**
 * @param {String} id
 * @return {Array}
 */
async function getOne(id) {
  const photo = await nftPhotos.findById(id).orFail(
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
  const item = await nftPhotos.create({
    name: data.name,
    location: data.location,
    address: data.address,
    tags: data.tags,
    rawImagePath: files.raw[0].path,
    imagePath: files.photo[0].path,
    rawImageSize: files.raw[0].size,
    imageSize: files.photo[0].size,
    originalName: files.photo[0].originalname,
    creator: user.username,
    creatorID: user._id,
    collections: data.collections,
    description: data.description,
  });
  return item;
}


/**
 * @param {String} id
 * @param {Object} data
 * @return {Array}
 */
async function update(id, data) {
  return await nftPhotos.findByIdAndUpdate(id, data).orFail(
      () => Error('Not Found'),
  ); ;
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
    nftPhotos.findByIdAndDelete(id).exec();
  });
  return exs;
}

/**
 * Add Nft to published listing
 * @param {String} id
 * @param {Object} data
 */
async function publish(id, data) {
  const item = await nftPhotos.findById(id).orFail(
      () => Error('Not Found'),
  );

  /**
   * Start transcational operation.
   * Pin File to IPFS network, create Listing record based on nftPhoto,
   * then Update nftPhoto record to Published = true
   */
  const trx = await listing.startSession();
  await trx.withTransaction(async () => {
    const fileStream = fs.createReadStream(item.rawImagePath);
    const result = await pinata.pinFileToIPFS(fileStream, {
      pinataMetadata: {
        name: item.name,
      },
    });

    // if (result.isDuplicate) {
    //   throw new Error('NFT is a duplicate');
    // }

    await contract.listNFTForSell(result.IpfsHash, data.price, data.royalties);
    // const listedItem = await listing.create([{
    //   name: item.name,
    //   description: item.description,
    //   location: item.location,
    //   address: item.address,
    //   creator: item.creatorID,
    //   owner: item.creatorID,
    //   imageID: id,
    //   collections: item.collections,
    //   price: data.price,
    //   royalties: data.royalties,
    //   activeDate: data.activeDate,
    //   buyerAddress: data.buyerAddress,
    //   tokenID: data.tokenID,
    //   cid: result.IpfsHash,
    //   pinSize: result.PinSize,
    //   pinDate: result.Timestamp,
    // }], {session: trx});


    await nftPhotos.findByIdAndUpdate(id, {
      published: true,
    }, {session: trx});

    return listedItem;
  });
}

module.exports = {
  getAll,
  getOne,
  insert,
  update,
  remove,
  publish,
};
