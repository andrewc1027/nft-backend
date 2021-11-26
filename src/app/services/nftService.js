const nft = require('../models/nft');
const ipfsUtils = require('../utils/ipfs');
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
 * @param {ObjectId} listingId
 * @param {Array} files
 * @param {Array} raws
 */
async function multipleCreate(listingId, files, raws) {
  for (let i = 0; i < files.length; i++) {
    ipfsUtils.uploadToIPFS(files[i].path, {
      listingID: listingId.toString(),
      name: files[i].originalname,
    }).then(async function(result) {
      // Uploading RAW to IPFS
      const rawResult = await ipfsUtils.uploadToIPFS(raws[i].path, {
        listingID: listingId.toString(),
        name: files[i].originalname,
      });
      await nft.create({
        listingID: listingId,
        ipfs: {
          raw: {
            originalName: raws[i].originalname,
            cid: rawResult.IpfsHash,
            pinDate: rawResult.Timestamp,
            pinSize: rawResult.PinSize,
            isDuplicate: rawResult.isDuplicate,
            path: `https://homejab-dev.mypinata.cloud/ipfs/${rawResult.IpfsHash}`,
          },
          file: {
            originalName: files[i].originalname,
            cid: result.IpfsHash,
            pinDate: result.Timestamp,
            pinSize: result.PinSize,
            isDuplicate: result.isDuplicate,
            path: `https://homejab-dev.mypinata.cloud/ipfs/${result.IpfsHash}`,
          },
        },
      });
    }).catch((e) => {
      console.log(e);
    });
  }
}

module.exports = {
  getAll,
  getOne,
  add,
  multipleCreate,
};
