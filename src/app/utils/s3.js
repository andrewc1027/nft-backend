require('dotenv').config();
const fs = require('fs');
const s3 = require('../config/s3');
const sharp = require('sharp');

/**
 * @param {File} file
 */
async function upload(file) {
  // Code dynamic compress here
  const image = sharp(file.path);
  const meta = await sharp.metadata();
  const {format} = meta;

  const config = {
    jpeg: {quality: 80},
    png: {compressionLevel: 8},
  };

  await image[format](config[format]);
  const fileContent = await fs.readFileSync(file.path);
  const param = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${file.filename}`,
    Body: fileContent,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };

  const result = await s3.upload(param).promise();
  return result;
}

module.exports = {
  upload,
};
