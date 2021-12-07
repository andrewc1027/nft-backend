const listing = require('../models/listing');
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
 * @param {String} resource
 */
async function handle(listingId, files, raws, resource) {
  const nfts = [];
  let i = 0;
  for await (const file of files) {
    ipfsUtils.uploadToIPFS(file.path, {
      listingID: listingId.toString(),
      name: file.originalname,
    }).then(async function(result) {
      // Uploading RAW to IPFS
      let raw = {};
      if (resource != '360') {
        rawResult = await ipfsUtils.uploadToIPFS(raws[i].path, {
          listingID: listingId.toString(),
          name: file.originalname,
        });
        raw = {
          originalName: raws[i].originalname,
          cid: rawResult.IpfsHash,
          pinDate: rawResult.Timestamp,
          pinSize: rawResult.PinSize,
          isDuplicate: rawResult.isDuplicate,
          path: `https://homejab-dev.mypinata.cloud/ipfs/${rawResult.IpfsHash}`,
        };
      }

      const resNft = await nft.create({
        listingID: listingId,
        ipfs: {
          raw: raw,
          file: {
            originalName: file.originalname,
            cid: result.IpfsHash,
            pinDate: result.Timestamp,
            pinSize: result.PinSize,
            isDuplicate: result.isDuplicate,
            path: `https://homejab-dev.mypinata.cloud/ipfs/${result.IpfsHash}`,
          },
        },
      });
      nfts.push(resNft._id);
      if (i === files.length - 1) {
        await listing.findByIdAndUpdate(listingId, {nfts: nfts});
      }
      i++;
    }).catch((e) => {
      console.log(e);
    });
  }
}

module.exports = {
  getAll,
  getOne,
  add,
  handle,
};
