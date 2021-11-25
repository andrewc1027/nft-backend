const nft = require('../models/nft');
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
 * @param {String} listingId
 * @param {Array} files
 * @param {Array} raws
 */
async function multipleCreate(listingId, files, raws) {
  console.log(files, raws);
  for (let i = 0; i < files.length; i++) {
    console.log(i);
    ipfsUtils.uploadToIPFS(files[i].path, {
      keyvalues: listingId,
    }).then(async function(result) {
      // Uploading RAW to IPFS
      ipfsUtils.uploadToIPFS(raws[i].path, {
        keyvalues: listingId,
      }).then(async function(rawResult) {
        // Uploading Thumbnail NFT to AWS S3
        await nft.create({
          listingID: listingId,
          ipfs: {
            raw: rawResult,
            file: result,
          },
          originalName: files[i].originalname,
          rawName: files[i].originalname,
        });
      });
    });
  }

  // Upload first nft on array as thumbnail
  if (files[0].mimetype.includes('video')) {
    thumbData = await s3Utils.uploadVid(listingId, files[0]);
  } else {
    thumbData = await s3Utils.upload(listingId, files[0]);
  }
}

module.exports = {
  getAll,
  getOne,
  add,
  multipleCreate,
};
