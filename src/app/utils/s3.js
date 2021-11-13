require('dotenv').config();
const fs = require('fs');
const s3 = require('../config/s3');
// const sharp = require('sharp');

/**
 * @param {File} file
 */
async function upload(file) {
  // Convert all file to jpeg as thumbnails
  const image = await sharp(file.path)
      .resize({width: 320, length: 180})
      .jpeg({mozjpeg: true})
      .toBuffer();
  console.log(image);

  const fileContent = await fs.readFileSync(image);
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
