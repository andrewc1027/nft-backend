/* eslint-disable quotes */
const notification = require('../models/notification');
const user = require('../models/user');
// const mail = require('../config/mail');
const mail = require('../config/sendgrid');
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
    if (self.email != '') {
      itemPurchasedEmail({
        email: self.email,
        listingName: listing.name,
        lisgtingPrice: listing.price,
        downloadLink: listing.downloadLink,
      });
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
    itemSoldEmail({
      email: owner.email,
      listingName: listing.name || '',
      listingPrice: listing.price || 0,
    })
  }
  // for (const usrID of listing.subscribers) {
  //   const usr = await user.findById(usrID);
  //   if (usr.notifications.itemSold) {
  //     await notification.create({
  //       title: `${listing.name}: Item Sold`,
  //       event: 'Item Sold',
  //       listing: listing._id,
  //       userID: usr._id,
  //       createdAt: Date.now(),
  //     });
  //     if (usr.email != '') {
  //       const template = JSON.parse(templateFile);
  //       let payload = template.Template.HtmlPart;
  //       payload = payload.replace('${username}', usr.username);
  //       payload = payload.replace('${price}', listing.price);
  //       payload = payload.replace('${filePath}', listing.filePath);

  //       sendEmail(payload, {
  //         to: usr.email,
  //         subject: 'Item Sold',
  //       });
  //     }
  //     await socket.to(usr._id.toString()).emit('itemSold', {
  //       listing: listing._id,
  //       image: listing.filePath,
  //       price: listing.price,
  //       name: listing.name,
  //     });
  //   }
  // }
}

/**
 * @param {Object} listing
 * @param {Number} newPrice
 * @param {Object} socket
 */
// async function priceChange(listing, newPrice, socket) {
//   const templateFile = fs.readFileSync(
//     path.resolve(__dirname, '../../../email-template/priceChange.json'),
//   );
//   const notif = {
//     title: `${listing.name}: price has changed`,
//     event: 'Price Change',
//     listing: listing._id,
//     createdAt: Date.now(),
//   };
//   for (const usrID of listing.subscribers) {
//     const usr = await user.findById(usrID);
//     if (usr.notifications.priceChange) {
//       notif['userID'] = usr._id,
//         await notification.create(notif);
//       if (usr.email != '') {
//         const template = JSON.parse(templateFile);
//         let payload = template.Template.HtmlPart;
//         payload = payload.replace('${username}', usr.username);
//         payload = payload.replace('${oldPrice}', listing.price);
//         payload = payload.replace('${newPrice}', newPrice);
//         payload = payload.replace('${filePath}', listing.filePath);

//         sendEmail(payload, {
//           to: usr.email,
//           subject: 'Price Change',
//         });
//       }
//       await socket.to(usr._id.toString()).emit('priceChange', {
//         listing: listing._id,
//         image: listing.filePath,
//         name: listing.name,
//         newPrice: newPrice,
//         oldPrice: listing.price,
//       });
//     }
//   }
// }

/**
 * @param {String} template
 * @param {Object} data
 */
async function sendEmail(template, data) {
  try {
    await mail.send({
      to: data.to,
      from: 'support@homejab.com',
      templateId: template,
      dynamicTemplateData: {
        subject: data.subject,
        username: data.username,
        link: data.link,
        linkWord: data.linkWord,
        body: data.body,
      }
    });
  } catch (e) {
    console.log(e);
  }
}

/**
 * @param {Object} user
 * @param {Object} socket
 * @param {string} path
 */
async function downloadReady(user, socket, path) {
  await socket.to(user._id.toString()).emit('downloadReady', {
    msg: 'Your Download is Ready',
    path: path,
  });
  console.log('Notification sent:', user._id.toString(), path);
}

/**
 * @param {Object} data
 */
async function itemPurchasedEmail(data) {
  sendEmail('d-506cd402ff5c42bdbf5a582cf1bf7ebb', {
    to: data.email,
    subject: 'Your NFT purchase',
    body: `Congratulations!  Your purchase for ${data.listingName} is complete for ${data.listingPrice}. \
    You can access the files for your NFT here: ${downloadLink} \ \
    You can also access from your profile on https://nft.homejab.com. `,
    buttonText: 'Homejab Web',
    buttonLink: process.env.HOMEJAB_WEB,
  });
}

async function itemSoldEmail(data) {
  sendEmail('d-506cd402ff5c42bdbf5a582cf1bf7ebb', {
    to: data.email,
    subject: 'Your NFT is sold',
    body: `Congratulations!  Your purchase for ${data.listingName} is complete for ${data.listingPrice}. \
    Funds from this sale will be deposited in your crypto wallet.`,
    buttonText: 'Homejab Web',
    buttonLink: process.env.HOMEJAB_WEB,
  })
}

/**
 * @param {Object} data
 */
async function sendInvite(data) {
  console.log(`${process.env.HOMEJAB_WEB}?invite=${data.hash}`);
  sendEmail('d-506cd402ff5c42bdbf5a582cf1bf7ebb', {
    to: data.email,
    subject: 'Invitation to HomeJab NFT Marketplace!',
    buttonLink: `${process.env.HOMEJAB_WEB}?invite=${data.hash}`,
    username: data.username,
    body: 'Please click the link below to accept your invitation to the HomeJab NFT Marketplace. Thank you for being part of this exciting new project!',
    buttonText: 'Accept Invitation',
  });
}

/**
 * @param {Object} data
 */
async function sendVerifyRequest(data) {
  console.log(`${process.env.HOMEJAB_WEB}?verify=${data.hash}`);
  sendEmail('d-506cd402ff5c42bdbf5a582cf1bf7ebb', {
    to: data.email,
    subject: 'Please verify your email',
    textLink: `${process.env.HOMEJAB_WEB}?verify=${data.hash}`,
    body: 'Please click the link below to verify your email address',
    text: 'Verify Your Email',
  });
}

module.exports = {
  itemPurchased,
  itemSold,
  // priceChange,
  downloadReady,
  sendInvite,
  sendVerifyRequest,
};
