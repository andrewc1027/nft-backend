const {default: axios} = require('axios');
const {DocumentNotFoundError} = require('mongoose').Error;
const contract = require('../config/homejabContract');
const listingModel = require('../models/listing');
const nftModel = require('../models/nft');

/**
 * @param {Number} token 
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
  if (data.length == 0) {
    throw new DocumentNotFoundError('Token Detail not Found');
  }
  return data[0].metadata;
}

/**
 * 
 * @param {Number} token 
 */
async function getPolygonMetadata(token) {
  const metadata = await contract.methods.getOwner().call();
  console.log(metadata, token);
}

/**
 * 
 * @param {Number} token 
 */
async function getEthMetadata(token) {
  const listing = await listingModel.findOne({tokenIds: {$in: token}, blockchain: 'ethereum'});
  if (listing) {
    const nft = await nftModel.findById(listing.nft[0]).throwIfNotFound();
    console.log(nft.ipfs.file.cid);
    const url = `${process.env.PINATA_GATEWAY}/ipfs/${nft.ipfs.file.cid}`;
    const res = await axios.get(url);
    return res.data;

  } else {
    throw new DocumentNotFoundError('Token Detail not Found');
  }
}

module.exports = {
  getMetadata,
  getPolygonMetadata,
  getEthMetadata,
};