const notification = require('../models/notification');
const user = require('../models/user');

/**
 * @param {Object} self
 * @param {Object} listing
 * @param {Object} socket
 */
async function itemPurchased(self, listing, socket) {
  if (self.notifications.successfulPurchase) {
    await notification.create({
      title: `${listing.name}: Item Purchased`,
      listing: listing._id,
      event: 'Item Purchased',
      userID: self._id,
      createdAt: Date.now(),
    });
    socket.to(self._id.toString()).emit('itemPurchased', listing);
  }
  await itemSold(listing, socket);
}

/** ]
 * @param {Object} listing
 * @param {Object} socket
 */
async function itemSold(listing, socket) {
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
      await socket.to(usr._id.toString()).emit('itemSold', listing);
      // Send Email Here
    }
  }
}

/**
 * @param {Object} listing
 * @param {Object} socket
 */
async function priceChange(listing, socket) {
  for (const usrID of listing.subscribers) {
    const usr = await user.findById(usrID);
    console.log(usr.notifications.priceChange);
    if (usr.notifications.priceChange) {
      await notification.create({
        title: `${listing.name}: price has changed`,
        event: 'Price Change',
        listing: listing._id,
        userID: usr._id,
        createdAt: Date.now(),
      });
      await socket.to(usr._id.toString()).emit('priceChange', listing);

      // Send Email Here
    }
  }
}

module.exports = {
  itemPurchased,
  itemSold,
  priceChange,
};
