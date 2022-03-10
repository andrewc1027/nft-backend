require('dotenv').config();
const s3 = require('../config/s3');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const listing = require('../models/listing');
const nft = require('../models/nft');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);
const {DeleteObjectCommand, PutObjectCommand} = require('@aws-sdk/client-s3');
const {default: axios} = require('axios');

/**
 * @param {String} id
 * @param {File} file
 * @param {Object} socket
 * @param {Object} user
 */
async function upload(id, file, socket, user) {

  let param640 = {}
  let param320 = {}
  if (Object.entries(file).length > 0) {
    // Convert file to thumbnail
    const image640 = await sharp(file.path)
        .resize({width: 640})
        .jpeg({mozjpeg: true})
        .toBuffer()
        .catch((e) => {
          console.log('Error Occured: ', e);
          socket.to(user._id.toString()).emit('error', {error: e});
        });
    param640 = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `640_${file.filename}`,
      Body: image640,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };
    param640.originalName = file.originalname;
    await s3.send(new PutObjectCommand(param640));
    const image320 = await sharp(file.path)
        .resize({width: 320})
        .jpeg({mozjpeg: true})
        .toBuffer()
        .catch((e) => {
          console.log('Error Occured: ', e);
          socket.to(user._id.toString()).emit('error', {error: e});
        });
    param320 = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `320_${file.filename}`,
      Body: image320,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };
    await s3.send(new PutObjectCommand(param320));
  }

  updateImageListing(id, param640, param320);
  console.log(`upload ::: ended`)
}


/**
 * @param {String} id
 * @param {File} videoFile
 * @param {Object} socket
 * @param {Object} user
 */
async function uploadVid(id, videoFile, socket, user) {
  console.log('Processing Video...', videoFile);
  const newVidPath = path.resolve(__dirname,
    `../../../uploads/${id}.gif`);
  const compressedVidPath = path.resolve(__dirname,
    `../../../uploads/${id}_compressed.mp4`);

  if (Object.entries(videoFile).length > 0) {
    // Process video as gif thumbnail
    await processVideo(id, videoFile, newVidPath, 'gif',
      {duration: 5, fps: 10, size: '300x?'}).catch((e) => {
        console.log('Error Occured: ', e);
        socket.to(user._id.toString()).emit('error', {error: e});
      });

    await processVideo(id, videoFile, compressedVidPath, 'mp4_compress',
      {duration: 3*60*60, fps: 15, size: '600x?'}).catch((e) => {
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
        await s3.send(new PutObjectCommand(param));
        updateVideoListing(id, param, 'gif');
      } else if (type == 'mp4_compress') {
        const rawBuffer = fs.readFileSync(newVidPath);
        const param = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `${id}_compressed_vid.mp4`,
          Body: rawBuffer,
          ContentType: 'video/mp4',
          ACL: 'public-read',
        };
        await s3.send(new PutObjectCommand(param));
        updateVideoListing(id, param, 'compress');
      }
    })
    .save(newVidPath);
}

/**
 * @dev for 360 resources
 * @param {String} id
 * @param {Object} file
 * @param {Object} compressed
 */
async function updateListing(id, file, compressed) {
  const item = await listing.findById(id);
  const assets = [];
  if (file) {
    item.thumbnail = `${process.env.AWS_BUCKET_URL}${file}` ?
      `${process.env.AWS_BUCKET_URL}${file}` : item.thumbnail;
  }
  console.log(item.assets, 'update listing');
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
 * @param {string} id
 * @param {Array} thumbnail
 * @param {Array} files
 */
async function upload360(id, thumbnail, files) {
  console.log(thumbnail);
  const fileBuffer = fs.readFileSync(thumbnail.path);
  const param = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${thumbnail.filename}`,
    Body: fileBuffer,
    ContentType: thumbnail.mimetype,
    ACL: 'public-read',
  };
  const item = await s3.send(new PutObjectCommand(param));
  updateListing(id, param.Key, '');
  return item;
}

/**
 * 
 * @param {String} id 
 */
async function compress360(id) {
  console.log('Compressing 360 Resources...');
  let assets = [];
  const item = await listing.findById(id);
  const nfts = await nft.find({listingID: id, deleted: false});
  for (const nft of nfts) {
    console.log(nft);
    const url = nft.ipfs.file.path;
    const filePath = path.resolve(__dirname, '../../../uploads', nft.ipfs.file.originalName);
    const writer = fs.createWriteStream(filePath);

    const response = await axios.get(url, {responseType: 'stream'});
    response.data.pipe(writer);
    writer.on('finish', async function() {
      console.log('writer finish..');
      const image = await sharp(filePath)
        .resize({width: 640})
        .jpeg({mozjpeg: true})
        .toBuffer()
        .catch((e) => {
          console.log('Error Occured: ', e);
        });
      param = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `compressed_640_${nft.ipfs.file.originalName}`,
        Body: image,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
      };
      await s3.send(new PutObjectCommand(param));
      assets.push({
        fileName: nft.ipfs.file.originalName,
        path: `${process.env.AWS_BUCKET_URL}${param.Key}`,
      });
      if (assets.length == nfts.length) {
        console.log('Adding assets..', assets.length);
        item.assets = assets;
        console.log(item.assets, '360 compress');
        await item.save();
      }
    })
  }


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

/**
 * @param {String} id
 * @param {Object} param640 
 * @param {Object} param320 
 */
async function updateImageListing(id, param640, param320) {
  const item = await listing.findById(id);
  const assets = [];
  if (Object.entries(param320).length > 0) {
    item.thumbnail = `${process.env.AWS_BUCKET_URL}${param320.Key}` ?
      `${process.env.AWS_BUCKET_URL}${param320.Key}` : item.thumbnail;
  }
  if (Object.entries(param640).length > 0) {
    const asset = {
      path: `${process.env.AWS_BUCKET_URL}${param640.Key}`,
      fileName: param640.originalName,
    }
    assets.push(asset);
    item.assets = assets;
  }
  await item.save();
}

/**
 * @param {String} id
 * @param {Object} param
 * @param {String} type
 */
async function updateVideoListing(id, param, type) {
  const item = await listing.findById(id);
  const assets = [];
  if (type == 'gif') {
    item.thumbnail = `${process.env.AWS_BUCKET_URL}${param.Key}` ?
      `${process.env.AWS_BUCKET_URL}${param.Key}` : item.thumbnail;
  }
  if (type == 'compress') {
    const asset = {
      path: `${process.env.AWS_BUCKET_URL}${param.Key}`,
      fileName: param.Key
    }
    item.videoThumbnail = `${process.env.AWS_BUCKET_URL}${param.Key}`;
    assets.push(asset);
    item.assets = assets;
  }
  await item.save();
}

module.exports = {
  upload,
  uploadVid,
  uploadFile,
  removeFile,
  upload360,
  compress360,
};
