require('dotenv').config();
const s3 = require('../config/s3');
const sharp = require('sharp');
const Mpeg = require('ffmpeg');

/**
 * @param {File} file
 */
async function upload(file) {
  // Convert all file to jpeg as thumbnails
  const image = await sharp(file.path)
      .resize({width: 640})
      .jpeg({mozjpeg: true})
      .toBuffer();
  console.log(image);

  const param = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${file.filename}`,
    Body: image,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };

  const result = await s3.upload(param).promise();
  return result;
}

/**
 * @param {File} videoFile
 */
async function uploadVid(videoFile) {
  const process = new Mpeg(videoFile.path);
  process.then(function(video) {
    video.setVideoSize('640x?', true, true, '#fff');
    video.setVideoDuration('00:00:15');
    video.setVideoFormat('avi');
    video.setVideoFrameRate(25);
    video.save(__dirname+'../../../uploads'+videoFile.filename+'_thumbs.avi');
  });
}
module.exports = {
  upload,
  uploadVid,
};
