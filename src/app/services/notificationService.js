/* eslint-disable quotes */
const notification = require('../models/notification');
const user = require('../models/user');
const mail = require('../config/mail');
const fs = require('fs');
const path = require('path');
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
    const templateFile = fs.readFileSync(
        path.resolve(__dirname, '../../../email-template/purchaseSuccessful.json'),
    );
    if (self.email != '') {
      const template = JSON.parse(templateFile);
      let payload = template.Template.HtmlPart;
      payload = payload.replace('${username}', self.username);
      payload = payload.replace('${price}', listing.price);
      payload = payload.replace('${filePath}', listing.filePath);
      console.log('sending email purchase');
      sendEmail(payload, [self.email]);
    }
    await socket.to(self._id.toString()).emit('successfulPurchase', {
      listing: listing._id,
      image: listing.filePath,
      price: listing.price,
      name: listing.name,
    });
  }
  await itemSold(listing, socket);
}

/** ]
 * @param {Object} listing
 * @param {Object} socket
 */
async function itemSold(listing, socket) {
  const templateFile = fs.readFileSync(
      path.resolve(__dirname, '../../../email-template/itemSold.json'),
  );
  await socket.to(listing.owner).emit('itemSold', {
    listing: listing._id,
    image: listing.filePath,
    price: listing.price,
    name: listing.name,
  });
  const owner = await user.findById(listing.owner);
  if (owner.email != '') {
    const template = JSON.parse(templateFile);
    let payload = template.Template.HtmlPart;
    payload = payload.replace('${username}', owner.username);
    payload = payload.replace('${price}', listing.price);
    payload = payload.replace('${filePath}', listing.filePath);

    sendEmail(payload, [owner.email]);
  }
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
      if (usr.email != '') {
        const template = JSON.parse(templateFile);
        let payload = template.Template.HtmlPart;
        payload = payload.replace('${username}', usr.username);
        payload = payload.replace('${price}', listing.price);
        payload = payload.replace('${filePath}', listing.filePath);

        sendEmail(payload, [usr.email]);
      }
      await socket.to(usr._id.toString()).emit('itemSold', {
        listing: listing._id,
        image: listing.filePath,
        price: listing.price,
        name: listing.name,
      });
    }
  }
}

/**
 * @param {Object} listing
 * @param {Number} newPrice
 * @param {Object} socket
 */
async function priceChange(listing, newPrice, socket) {
  const templateFile = fs.readFileSync(
      path.resolve(__dirname, '../../../email-template/priceChange.json'),
  );
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
        const template = JSON.parse(templateFile);
        let payload = template.Template.HtmlPart;
        payload = payload.replace('${username}', usr.username);
        payload = payload.replace('${oldPrice}', listing.price);
        payload = payload.replace('${newPrice}', newPrice);
        payload = payload.replace('${filePath}', listing.filePath);

        sendEmail(payload, [usr.email]);
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
 * @param {String} to
 */
async function sendEmail(template, to) {
  mail.sendEmail({
    Destination: {
      ToAddresses: to,
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: template,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Subject',
      },
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
