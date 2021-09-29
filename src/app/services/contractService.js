const homejab = require('../config/homejabContract');
/**
 * @param {uint256} tokenID
 * @param {uint256} price
 */
async function sellNft(tokenID, price) {
  const res = await homejab.methods.listForSell(tokenID, price).call();
  return res;
}

/**
 * @param {uint256} royalties
 * @return {uint256}
 */
async function mint(royalties) {
  const tokenID = await homejab.methods.mint(royalties).call();
  return tokenID;
}

/**
 * @param {uint256} price
 * @param {uint256} royalties
 */
async function mintAndSell(price, royalties) {
  await homejab.methods.mintAndList(royalties, price).call();
}

/**
 * @param {String} tokenID
 */
async function revokeNftSale(tokenID) {
  homejab.methods.revokeSell(tokenID).call();
}

/**
 * @param {Object} user
 * @param {String} tokenID
 * @param {Number} price
 */
async function editNFTPrice(user, tokenID, price) {
  await homejab.methods.editPrice(tokenID, price).call();
}

/**
 * @param {Object} buyer
 * @param {String} tokenID
 */
async function buyNFT(buyer, tokenID) {
  await homejab.methods.buy(tokenID).call();
}

module.exports = {
  sellNft,
  mint,
  mintAndSell,
  revokeNftSale,
  editNFTPrice,
  buyNFT,
};
