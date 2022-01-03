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

/**
 *@param {String} tokenId
 *@param {String} bidIndex
 *@param {String} userAddr
 */
async function acceptBid(tokenId, bidIndex, userAddr) {
  console.log(tokenId, bidIndex);
  const trx = await homejab.methods.acceptBid(tokenId, bidIndex)
      .send({from: '0xdf1ae3ecff4e32431e9010b04c36e901f7ed388b'})
      .once('confirmation', (confirmation, receipt) => {
        console.log(confirmation, receipt);
      })
      .on('error', (error) => {
        console.log(error);
      });
  console.log(trx);
  return trx;
}

module.exports = {
  sellNft,
  mint,
  mintAndSell,
  revokeNftSale,
  editNFTPrice,
  buyNFT,
  acceptBid,
};
