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
 * @param {File} raw
 */
async function upload(id, file, raw) {
  // Convert file to thumbnail
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

  // Convert raw to thumbnail
  const rawImage = await sharp(raw.path)
      .resize({width: 640})
      .toFormat('jpeg')
      .jpeg({
        quality: 60,
        mozjpeg: true,
        force: true,
      })
      .toBuffer();
  const rawParam = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${raw.filename}.jpeg`,
    Body: rawImage,
    ContentType: 'image/jpeg',
    ACL: 'public-read',
  };
  await s3.send(new PutObjectCommand(rawParam));
  updateListing(id, param.Key, rawParam.Key);
}

/**
 * @param {String} id
 * @param {File} videoFile
 * @param {File} rawFile
 */
async function uploadVid(id, videoFile, rawFile) {
  console.log('Processing Video...', videoFile);
  const newVidPath = path.resolve(__dirname,
      `../../../uploads/${id}.gif`);
  const rawThumbPath = path.resolve(__dirname,
      `../../../uploads/${id}.mp4`);

  // Process video as gif thumbnail
  await processVideo(id, videoFile, newVidPath, 'gif',
      {duration: 5, fps: 10, size: '300x?'});


  // Process video raw as thumbnail
  await processVideo(id, rawFile, rawThumbPath, 'mp4',
      {duration: 15, fps: 30, size: '300x?'});
}

/**
 *@param {String} id
 *@param {Object} videoFile
 *@param {String} newVidPath
 *@param {String} type
 *@param {String} options
 */
async function processVideo(id, videoFile, newVidPath, type, options) {
  ffmpeg(path.resolve(__dirname, '../../../'+videoFile.path))
      .duration(options.duration)
      .fps(options.fps)
      .size(options.size)
      .on('start', function(cli) {
        console.log('Running: ', cli);
      })
      .on('error', function(err, stdout, stderr) {
        console.log('Cannot process video: ' + err.message);
      })
      .on('end', async function(stdout, stderr) {
        console.log('Compress Done For: ', newVidPath, stdout);
        if (type == 'gif') {
          const vidBuffer = fs.readFileSync(newVidPath);
          const param = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `${id}.gif`,
            Body: vidBuffer,
            ContentType: 'image/gif',
            ACL: 'public-read',
          };
          await s3.send(new PutObjectCommand(param));
          updateListing(id, param.Key, '');
        } else if (type == 'mp4') {
          const rawBuffer = fs.readFileSync(newVidPath);
          const rawParam = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `${id}.mp4`,
            Body: rawBuffer,
            ContentType: 'video/mp4',
            ACL: 'public-read',
          };
          await s3.send(new PutObjectCommand(rawParam));
          updateListing(id, '', rawParam.Key);
        }
      })
      .save(newVidPath);
}

/**
 * @param {String} id
 * @param {String} key
 * @param {String} rawKey
 */
async function updateListing(id, key, rawKey) {
  const item = await listing.findById(id);
  if (key != '') {
    item.thumbnail = `${process.env.AWS_BUCKET_URL}${key}` ?
    `${process.env.AWS_BUCKET_URL}${key}` : item.thumbnail;
  }
  if (rawKey != '') {
    item.rawThumbnail = `${process.env.AWS_BUCKET_URL}${rawKey}` ?
    `${process.env.AWS_BUCKET_URL}${rawKey}` : item.rawThumbnail;
  }

  await item.save();
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
