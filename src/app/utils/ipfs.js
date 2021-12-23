
const fs = require('fs');
const pinata = require('../config/pinata');
/**
 * @param {String} imgPath
 * @param {Object} metadata
 */
async function uploadToIPFS(imgPath, metadata) {
  const fileStream = fs.createReadStream(imgPath);
  const result = pinata.pinFileToIPFS(fileStream, {
    pinataMetadata: metadata,
  });
  return result;
}

/**
 * @param {String} cid
 */
async function unpin(cid) {
  pinata.unpin(cid).then((result) => {
    console.log('result', result);
  }).catch((err) => {
    console.log('Unpin Err:', err);
  });
}

module.exports = {
  uploadToIPFS,
  unpin,
};
