/* eslint-disable quotes */
const notification = require('../models/notification');
const user = require('../models/user');
const mail = require('../config/mail');

/**
 * @param {Object} self
 * @param {Object} listing
 * @param {Object} socket
 */
async function itemPurchased(self, listing, socket) {
  if (self.notifications.successfulPurchase) {
    await notification.create({
      title: `${listing.name}: Successful Purchase`,
      listing: listing._id,
      event: 'Successful Purchase',
      userID: self._id,
      createdAt: Date.now(),
    });
    await socket.to(self._id.toString()).emit('successfulPurchase', {
      listing: listing._id,
      image: listing.filePath,
      price: listing.price,
      name: listing.name,
    });
    const data = JSON.stringify({
      "username": self.username,
      "price": listing.price,
      "filePath": listing.filePath,
    });
    sendEmail('successfulPurchase', data, [self.email]);
  }
  await itemSold(listing, socket);
}

/** ]
 * @param {Object} listing
 * @param {Object} socket
 */
async function itemSold(listing, socket) {
  await socket.to(listing.owner).emit('itemSold', {
    listing: listing._id,
    image: listing.filePath,
    price: listing.price,
    name: listing.name,
  });
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
      await socket.to(usr._id.toString()).emit('itemSold', {
        listing: listing._id,
        image: listing.filePath,
        price: listing.price,
        name: listing.name,
      });
      const data = JSON.stringify({
        "username": usr.username,
        "price": listing.price,
        "filePath": listing.filePath,
      });
      sendEmail('itemSold', data, [usr.email]);
    }
  }
}

/**
 * @param {Object} listing
 * @param {Number} newPrice
 * @param {Object} socket
 */
async function priceChange(listing, newPrice, socket) {
  const notif = {
    title: `${listing.name}: price has changed`,
    event: 'Price Change',
    listing: listing._id,
    createdAt: Date.now(),
  };
  for (const usrID of listing.subscribers) {
    const usr = await user.findById(usrID);
    if (usr.notifications.priceChange) {
      notif['userID'] = usr._id,
      await notification.create(notif);
      if (usr.email != '') {
        const data = JSON.stringify({
          "username": usr.username,
          "oldPrice": listing.price,
          "newPrice": newPrice,
        });
        sendEmail('priceChange', data, [usr.email]);
      }
      await socket.to(usr._id.toString()).emit('priceChange', {
        listing: listing._id,
        image: listing.filePath,
        name: listing.name,
        newPrice: newPrice,
        oldPrice: listing.price,
      });
    }
  }
}

/**
 * @param {String} template
 * @param {JSON} data
 * @param {String} to
 */
async function sendEmail(template, data, to) {
  mail.sendTemplatedEmail({
    Template: template,
    TemplateData: data,
    Destination: {
      ToAddresses: to,
    },
    Source: 'jon@homejab.com',
  }, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else console.log(data); // successful response
  });
}

module.exports = {
  itemPurchased,
  itemSold,
  priceChange,
};
