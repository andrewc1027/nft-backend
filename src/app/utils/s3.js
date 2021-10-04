require('dotenv').config();
const fs = require('fs');
const s3 = require('../config/s3');

/**
 * @param {File} file
 */
async function upload(file) {
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
