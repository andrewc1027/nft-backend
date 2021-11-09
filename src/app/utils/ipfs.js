
const fs = require('fs');
const pinata = require('../config/pinata');
/**
 * @param {String} imgPath
 * @param {Object} metadata
 */
async function uploadToIPFS(imgPath, metadata) {
  const fileStream = fs.createReadStream(imgPath);
  const result = pinata.pinFileToIPFS(fileStream, {
    pinataMetadata: {
      name: data.name,
    },
  });
  return result;
}

/**
 * @param {String} cid
 */
async function unpin(cid) {
  pinata.unpin(cid);
}

module.exports = {
  uploadToIPFS,
  unpin,
};
