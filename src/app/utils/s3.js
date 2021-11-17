require('dotenv').config();
const s3 = require('../config/s3');
const sharp = require('sharp');
// const Mpeg = require('ffmpeg');
const hbjs = require('handbrake-js');
const path = require('path');
const fs = require('fs');
const listing = require('../models/listing');
/**
 * @param {String} id
 * @param {Object} ipfs
 * @param {File} file
 */
async function upload(id, ipfs, file) {
  // Convert all file to jpeg as thumbnails
  const image = await sharp(file.path)
      .resize({width: 640})
      .jpeg({mozjpeg: true})
      .toBuffer();

  const param = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${file.filename}`,
    Body: image,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };

  const result = await s3.upload(param).promise();
  updateListing(id, ipfs, result);
  return result;
}

/**
 * @param {String} id
 * @param {Object} ipfs
 * @param {File} videoFile
 */
async function uploadVid(id, ipfs, videoFile) {
  const newVidPath = path.resolve(__dirname,
      `../../../uploads/${videoFile.filename}_thumbs.mp4`);
  hbjs.spawn({
    input: path.resolve(__dirname, '../../../'+videoFile.path),
    output: newVidPath,
  })
      .on('complete', async function() {
        const vidBuffer = fs.readFileSync(newVidPath);
        const param = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `${videoFile.filename}`,
          Body: vidBuffer,
          ContentType: videoFile.mimetype,
          ACL: 'public-read',
        };
        console.log('completed, uploading..');
        const result = await s3.upload(param).promise();
        updateListing(id, ipfs, result);
      })
      .on('error', function(err) {
        console.error(err);
      });
}

/**
 * @param {String} id
 * @param {Object} ipfs
 * @param {Object} s3data
 */
async function updateListing(id, ipfs, s3data) {
  await listing.findByIdAndUpdate(id, {
    ipfs: {
      cid: ipfs.IpfsHash,
      pinSize: ipfs.PinSize,
      pinDate: ipfs.Timestamp,
      isDuplicate: ipfs.isDuplicate,
    },
    filePath: `https://homejab-dev.mypinata.cloud/ipfs/${ipfs.IpfsHash}`,
    thumbnail: s3data.Location,
  });
}
module.exports = {
  upload,
  uploadVid,
};
