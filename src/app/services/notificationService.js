const notification = require('../models/notification');
const user = require('../models/user');
const socket = require('../config/socket');

/**
 * @param {Object} self
 * @param {Object} listing
 */
async function itemPurchased(self, listing) {
  if (self.notifications.successfulPurchase) {
    await notification.create({
      title: `${listing.name}: Item Purchased`,
      listing: listing._id,
      event: 'Item Purchased',
      userID: self._id,
      createdAt: Date.now(),
    });
    socket.to(self._id).emit('itemPurchased', {

    });
    // Send Email Here
  }
}

/** ]
 * @param {Object} listing
 */
async function itemSold(listing) {
  for (const usrID of listing.subscribers) {
    const usr = await user.findById(usrID);
    if (usr.notifications.itemSold) {
      await notification.create({
        title: `${listing.name}: Item Sold`,
        event: 'Item Sold',
        listing: listing._id,
        userID: usr._id,
        createdAt: Date.now(),
      });
      socket.to(self._id).emit('itemSold', {

      });
      // Send Email Here
    }
  }
}

/**
 * @param {Object} listing
 */
async function priceChange(listing) {
  for (const usrID of listing.subscribers) {
    const usr = await user.findById(usrID);
    if (usr.notifications.priceChange) {
      await notification.create({
        title: `${listing.name}: price has changed`,
        event: 'Price Change',
        listing: listing._id,
        userID: usr._id,
        createdAt: Date.now(),
      });
      socket.to(self._id).emit('itemPriceChanged', {

      });
      // Send Email Here
    }
  }
}

module.exports = {
  itemPurchased,
  itemSold,
  priceChange,
};
