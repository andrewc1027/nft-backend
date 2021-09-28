const homejab = require('../config/homejabContract');
/**
 * @param {String} nftCID
 * @param {Number} price
 * @param {Number} royalties
 */
async function listNFTForSell(nftCID, price, royalties) {
  console.log(royalties);
  const id = await homejab.methods.mint(royalties).call();
  console.log(id, 'id');
  // const res = await homejab.methods.listForSell(id, 1).call();
  // console.log(res);
  process.exit(1);
}

/**
 * @param {String} NftID
 * @param {Number} price
 */
async function revokeNftSale(NftID, price) {

}

/**
 * @param {Object} user
 * @param {String} NftID
 * @param {Number} price
 */
async function editNFTPrice(user, NftID, price) {

}

/**
 * @param {Object} buyer
 * @param {String} NftID
 */
async function buyNFT(buyer, NftID) {

}

module.exports = {
  listNFTForSell,
  revokeNftSale,
  editNFTPrice,
  buyNFT,
};
