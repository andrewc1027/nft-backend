const listing = require('../models/listing');
const city = require('../models/city');
const transaction = require('../models/transaction');
const joi = require('joi');
const fs = require('fs');
const pinata = require('../config/pinata');
const userSvc = require('./userService');
const s3Utils = require('../utils/s3');
const {ObjectId} = require('bson');
const user = require('../models/user');
const qTransform = require('../utils/queryTransform');
const notificationSvc = require('./notificationService');
const agenda = require('../config/agenda');
/**
 * @param {Object} query
 * @param {Number} page
 * @param {Number} limit
 * @param {Object} self
 * @return {Array}
 */
async function getAll(query, page, limit, self) {
  const queries = {};
  queries['deleted'] = {$ne: true};

  if (query.cityUrl) {
    queries['city.url'] = query.cityUrl;
  }

  if (query.city) {
    queries['city.ID'] = new ObjectId(query.city);
  }

  if (query.exclude) {
    queries['_id'] = {$ne: new ObjectId(query.exclude)};
  }

  // Use Creator ID
  if (query.creator) {
    queries['creator.ID'] = new ObjectId(query.creator);
  }

  // Use Owner ID
  if (query.owner) {
    queries['owner'] = query.owner;
    queries['creator.ID'] = {$ne: query.owner};
  }

  if (query.liked) {
    const usr = await user.findById(self._id);
    queries['_id'] = {$in: usr.favorites};
  }

  const listings = await listing
      .paginate(queries,
          {page: page, limit: limit});
  return listings;
}
/**
 * @param {String} id
 */
async function getOne(id) {
  viewCounter(id);
  const detail = await listing.findById(id).orFail(
      () => Error('NotFound'),
  );
  if (detail.deleted) {
    throw new Error('Deleted');
  }
  return detail;
}

/**
 * @param {Object} data
 * @param {File} files
 * @param {Object} user
 * @return {Array}
 */
async function insert(data, files, user) {
  let geoLocations = [];
  if (data.longitude) {
    geoLocations = [data.longitude, data.latitude];
  }
  // Uploading Thumbnail NFT to AWS S3
  const thumbData = await s3Utils.upload(files.file[0]);
  let datacity = {};
  if (data.city) {
    const cityData = await city.findById(data.city);
    if (cityData) {
      datacity = {
        ID: cityData._id,
        name: cityData.name,
        url: cityData.url,
        logoImage: cityData.logoImage,
      };
    }
  }
  // Pre Check if user exists
  await userSvc.find(user._id);
  const item = await listing.create({
    item: data.type,
    name: data.name,
    description: data.description,
    location: data.location,
    address: data.address,
    creator: {
      name: user.username,
      ID: user._id,
    },
    blockchain: data.blockchain,
    city: datacity,
    tags: data.tags,
    fileOriginalName: files.file[0].originalname,
    filePath: thumbData.Location,
    rawFileName: files.raw[0].originalname,
    geoLocation: {
      type: 'Point',
      coordinates: geoLocations,
    },
  });
  if (item.activeDate) {
    console.log('adding agenda schedule');
    agenda.schedule(item.activeDate, '', {listingID: item._id});
  }

  // Uploading Actual NFT to IPFS
  const fileStream = fs.createReadStream(files.raw[0].path);
  pinata.pinFileToIPFS(fileStream, {
    pinataMetadata: {
      name: data.name,
    },
  }).then(async function(result) {
    await listing.findByIdAndUpdate(item._id, {
      ipfs: {
        cid: result.IpfsHash,
        pinSize: result.PinSize,
        pinDate: result.Timestamp,
        isDuplicate: result.isDuplicate,
      },
    });
  });
  // if (item.collections) {
  //   collectionItemCount(item.collections.ID);
  // }
  return item;
}


/**
 * @param {String} id
 * @param {Object} files
 * @param {Object} data
 * @param {Object} socket
 * @return {Array}
 */
async function update(id, files = {}, data, socket) {
  const item = await listing.findById(id).orFail(
      () => Error('Not Found'));

  item.address = data.address;
  item.name = data.name;
  if (files.file) {
    // TODO: handle old file
    const thumbData = await s3Utils.upload(files.file[0]);
    item.fileOriginalName = files.file[0].originalname;
    item.filePath = thumbData.Location;
  }
  if (files.raw) {
    // TODO: handle old file
    const fileStream = fs.createReadStream(files.raw[0].path);
    pinata.pinFileToIPFS(fileStream, {
      pinataMetadata: {
        name: data.name,
        keyvalues: {

        },
      },
    }).then(async function(result) {
      await listing.findByIdAndUpdate(id, {
        rawFileName: files.raw[0].originalname,
        ipfs: {
          cid: result.IpfsHash,
          pinSize: result.PinSize,
          pinDate: result.Timestamp,
          isDuplicate: result.isDuplicate,
        },
      });
    }).catch((err)=>{
      console.log('IPFS Upload Failed', err);
    });
  }
  let dataCity = item.city;
  if (data.city) {
    const cityData = await city.findById(data.city);
    if (cityData) {
      dataCity = {
        ID: cityData._id,
        name: cityData.name,
        url: cityData.url,
      };
    }
  }
  item.city = dataCity;
  if (data.longitude) {
    const geoLocations = [data.longitude, data.latitude];
    item.geoLocation.coordinates = geoLocations;
  }
  await item.save();
  if (data.activeDate) {
    agenda.schedule(data.activeDate, '', {listingID: item._id});
  }
  // if (item.collections) {
  //   collectionItemCount(item.collections.ID);
  // }
  return item;
}

/**
 * @param {String} id
 * @param {Object} user
 * @return {Array}
 */
async function remove(id, user) {
  const exs = await listing.deleteById(id).orFail(
      () => Error('Not Found'),
  );

  /**
   *  We Can't remove file from IPFS,
   *  but we can unpin it so it'll get removed by IPFS garbage collector
   */
  // TODO: unpin not working, exs empty
  pinata.unpin(exs.ipfs.cid).then((result) => {
    listing.findByIdAndDelete(id);
  });
  return exs;
}

/**
 * @param {String} id
 * @param {Object} data
 * @param {Object} user
 * @param {Object} socket
 */
async function purchase(id, data, user, socket) {
  // What if there's 2 simultaneous purchase ?
  const item = await listing.findById(id).where({
    isPublished: true,
  }).orFail(
      () => Error('Listing Not Found'),
  );
  const trade = await transaction.create({
    to: user._id,
    from: item.owner,
    price: item.price,
    date: Date.now(),
    listingID: id,
    listingCID: item.ipfs.cid,
    quantity: 1,
    event: 'Purchasing',
  });

  await listing.findByIdAndUpdate(id, {
    owner: user._id,
    isPublished: false,
  });
  await notificationSvc.itemPurchased(user, item, socket);
  return trade;
}

/**
 * @param {String} id
 */
async function viewCounter(id) {
  const item = await listing.findById(id);
  await listing.findByIdAndUpdate(id, {
    views: item.views+1,
  });
}

/**
 * @param {String} id
 * @param {Object} self
 */
async function likeCounter(id, self = {}) {
  const item = await listing.findById(id);
  if (self._id==undefined) {
    item.likes++;
    await item.save();
  } else {
    const users = await user.findById(self._id);
    if (users.favorites.includes(id)) {
      const index = users.favorites.indexOf(id);
      users.favorites.splice(index, 1);
      await users.save();
      item.likes = item.likes-1;

      // Remove User from listing subs list to avoid sending notif to them
      const usrIdx = item.subscribers.indexOf(self._id);
      if (usrIdx > -1) {
        item.subscribers.splice(usrIdx, 1);
      }
    } else {
      users.favorites.push(id);
      await users.save();
      item.likes = item.likes+1;

      // Add User to listing subs list for notification purpose
      item.subscribers.push(self._id);
    }
    await item.save();
  }
}

/**
 * Add Nft to published listing
 * @param {String} id
 * @param {Object} data
 * @param {Object} user
 * @param {Object} socket
 */
async function publish(id, data, user, socket) {
  const schema = joi.object({
    price: joi.number().required(),
    royalties: joi.number().required(),
    copies: joi.number().required(),
    tokenID: joi.string().required(),
    activeDate: joi.date().optional(),
    buyerAddress: joi.string().optional(),
  });
  const {error} = schema.validate(data);
  if (error) {
    throw new Error(error);
  }
  const listedItem = await listing.findByIdAndUpdate(id, {
    owner: user._id,
    price: data.price,
    royalties: data.royalties,
    activeDate: data.activeDate,
    buyerAddress: data.buyerAddress,
    tokenID: data.tokenID,
    isPublished: true,
  });
  if (data.price != listedItem.price) {
    await notificationSvc.priceChange(listedItem, data.price, socket);
  }
  return listedItem;
}

/**
 * @param {Object} query
 * @param {Number} page
 * @param {Number} limit
 * @param {String} sort
 */
async function explore(query, page, limit, sort = 'price:asc') {
  const field = sort.split(':');
  const orderBy = field[1] == 'asc' ? '1' : '-1';
  const filters = {};
  filters['isPublished'] = true;
  filters['deleted'] = false;
  if (query.city) {
    filters['city.ID'] = new ObjectId(query.city);
  }
  if (query.cityUrl) {
    filters['city.url'] = query.cityUrl;
  }
  if (query.search) {
    const q = query.search;
    const or = [
      {'name': qTransform.regexLike(q)},
      {'address': qTransform.regexLike(q)},
      {'city.name': qTransform.regexLike(q)},
    ];
    filters['$or'] = or;
  }

  if (query.exclude) {
    filters['_id'] = {$ne: new ObjectId(query.exclude)};
  }

  if (query.price) {
    const prc = query.price.split(',');
    filters['price'] = qTransform.rangeNumber(prc[0], prc[1]);
  }
  if (query.tags) {
    filters['tags'] = qTransform.regexLike(query.tags);
  }
  if (query.type) {
    filters['type'] = query.type;
  }
  if (query.bounds) {
    const [south, west, north, east] = query.bounds.split(',');
    filters['geoLocation'] = {
      $geoWithin: {
        $geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [
                west,
                south,
              ],
              [
                west,
                north,
              ],
              [
                east,
                north,
              ],
              [
                east,
                south,
              ],
              [
                west,
                south,
              ],
            ],
          ],
        },
      },
    };
  }
  const listings = await listing.paginate(filters, {
    page, limit, sort: {field: orderBy},
  });
  return listings;
}

// /**
//  * @param {String} collectionID
//  */
// async function collectionItemCount(collectionID) {
//   const listings = await listing.find({'collections.ID': collectionID});
//   await city.findByIdAndUpdate(collectionID, {
//     listingCount: listings.length,
//   }).orFail(
//       () => Error('Not Found'),
//   );
//   return listings;
// }

/**
 *
 */
async function getTags() {
  const list = await listing.find({isPublished: true});
  let tags = [];
  list.forEach((row) => {
    const tag = row.tags.split(',');
    tags = tags.concat(tag);
  });
  const index = tags.indexOf('');
  console.log(index);
  tags = tags.splice(index);
  const unique = tags.filter((v, i, a) => a.indexOf(v) === i);
  return unique;
}

module.exports = {
  getAll,
  getOne,
  insert,
  update,
  remove,
  purchase,
  likeCounter,
  publish,
  explore,
  getTags,
};
