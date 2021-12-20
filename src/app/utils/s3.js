require('dotenv').config();
const s3 = require('../config/s3');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const listing = require('../models/listing');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);
const {DeleteObjectCommand, PutObjectCommand} = require('@aws-sdk/client-s3');
/**
 * @param {String} id
 * @param {File} file
 */
async function upload(id, file) {
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

  await s3.send(new PutObjectCommand(param));
  updateListing(id, param.Key);
}

/**
 * @param {String} id
 * @param {File} videoFile
 */
async function uploadVid(id, videoFile) {
  console.log('Processing Video...', videoFile);
  const newVidPath = path.resolve(__dirname,
      `../../../uploads/${id}.gif`);
  ffmpeg(path.resolve(__dirname, '../../../'+videoFile.path))
      .duration(5)
      .fps(10)
      .size('300x?')
      .on('start', function(cli) {
        console.log('Running: ', cli);
      })
      .on('progress', function(progress) {
        console.log('Processing: ', progress.percent);
      })
      .on('error', function(err, stdout, stderr) {
        console.log('Cannot process video: ' + err.message);
      })
      .on('end', async function(stdout, stderr) {
        console.log('Compress Done For: ', newVidPath, stdout);
        const vidBuffer = fs.readFileSync(newVidPath);
        const param = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `${id}.gif`,
          Body: vidBuffer,
          ContentType: 'image/gif',
          ACL: 'public-read',
        };
        await s3.send(new PutObjectCommand(param));
        updateListing(id, param.Key);
      })
      .save(newVidPath);
}

/**
 * @param {String} id
 * @param {String} key
 */
async function updateListing(id, key) {
  await listing.findByIdAndUpdate(id, {
    thumbnail: `${process.env.AWS_BUCKET_URL}${key}`,
  });
}

/**
 * @param {Object} file
 */
async function uploadFile(file) {
  const fileBuffer = fs.readFileSync(file.path);
  const param = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${file.name}`,
    Body: fileBuffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };
  const item = await s3.send(new PutObjectCommand(param));
  return item;
}

/**
 * @param {String} key
 */
async function removeFile(key) {
  await s3.send(new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  }));
}
module.exports = {
  upload,
  uploadVid,
  uploadFile,
  removeFile,
};
