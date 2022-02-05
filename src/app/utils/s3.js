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
 * @param {Object} socket
 * @param {Object} user
 */
async function upload(id, file, raw, socket, user) {

  let param = {}
  if (Object.entries(file).length > 0) {
    // Convert file to thumbnail
    const image = await sharp(file.path)
      .resize({width: 640})
      .jpeg({mozjpeg: true})
      .toBuffer()
      .catch((e) => {
        console.log('Error Occured: ', e);
        socket.to(user._id.toString()).emit('error', {error: e});
      });
    param = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${file.filename}`,
      Body: image,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };
    console.log('Uplading: ', param);
    await s3.send(new PutObjectCommand(param));
  }


  let rawParam = {};
  if (Object.entries(raw).length > 0) {
    // Convert raw to thumbnail
    console.log('Processing Raw: ', raw);
    const rawImage = await sharp(raw.path)
      .resize({width: 640})
      .toFormat('jpeg')
      .jpeg({
        quality: 60,
        mozjpeg: true,
        force: true,
      })
      .toBuffer()
      .catch((e) => {
        console.log('Error Occured: ', e);
        socket.to(user._id.toString()).emit('error', {error: e});
      });
    rawParam = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${raw.filename}.jpeg`,
      Body: rawImage,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
    };
    console.log('Uplading: ', rawParam);
    await s3.send(new PutObjectCommand(rawParam));
  }

  updateListing(id, param.Key, rawParam.Key || '');
}

/**
 * @param {String} id
 * @param {File} videoFile
 * @param {File} rawFile
 * @param {Object} socket
 * @param {Object} user
 */
async function uploadVid(id, videoFile, rawFile, socket, user) {
  console.log('Processing Video...', videoFile);
  const newVidPath = path.resolve(__dirname,
    `../../../uploads/${id}.gif`);
  const rawThumbPath = path.resolve(__dirname,
    `../../../uploads/${id}.mp4`);

  if (Object.entries(videoFile).length > 0) {
    // Process video as gif thumbnail
    await processVideo(id, videoFile, newVidPath, 'gif',
      {duration: 5, fps: 10, size: '300x?'}).catch((e) => {
        console.log('Error Occured: ', e);
        socket.to(user._id.toString()).emit('error', {error: e});
      });
  }

  if (Object.entries(rawFile).length > 0) {

    // Process video raw as thumbnail
    await processVideo(id, rawFile, rawThumbPath, 'mp4',
      {duration: 15, fps: 30, size: '300x?'}).catch((e) => {
        console.log('Error Occured: ', e);
        socket.to(user._id.toString()).emit('error', {error: e});
      });
  }
}

/**
 *@param {String} id
 *@param {Object} videoFile
 *@param {String} newVidPath
 *@param {String} type
 *@param {String} options
 */
async function processVideo(id, videoFile, newVidPath, type, options) {
  ffmpeg(path.resolve(__dirname, '../../../' + videoFile.path))
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
        console.log('Uplading: ', param);
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
        console.log('Uplading: ', rawParam);
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
    console.log('Thumbnail ', key);
    item.thumbnail = `${process.env.AWS_BUCKET_URL}${key}` ?
      `${process.env.AWS_BUCKET_URL}${key}` : item.thumbnail;
  }
  if (rawKey != '') {
    console.log('Raw Thumbnail ', rawKey);
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
 * @param {Object} thumbnail
 */
async function upload360(id, thumbnail) {
  const fileBuffer = fs.readFileSync(thumbnail.path);
  const param = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${thumbnail.name}`,
    Body: fileBuffer,
    ContentType: thumbnail.mimetype,
    ACL: 'public-read',
  };
  console.log('Uplading: ', param);
  const item = await s3.send(new PutObjectCommand(param));
  updateListing(id, param.Key, '');
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
  upload360,
};
