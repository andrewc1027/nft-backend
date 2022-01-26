const {default: axios} = require('axios');
const {DocumentNotFoundError} = require('mongoose').Error;

/**
 * @param {String} token 
 * @return {Array}
 */
async function getMetadata(token) {
  const url = `https://api.pinata.cloud/data/pinList?metadata[keyvalues]={"token": {"value": ${token}, "op":"eq"}}`;
  const response = await axios({
    url: url,
    method: 'GET',
    headers: {
      pinata_api_key: process.env.PINATA_API_KEY,
      pinata_secret_api_key: process.env.PINATA_SECRET_KEY,
    },
  });
  const data = response.data.rows;
  if (!data) {
    throw new DocumentNotFoundError('Token Detail not Found');
  }
  return data[0].metadata;
}

module.exports = {
  getMetadata,
};