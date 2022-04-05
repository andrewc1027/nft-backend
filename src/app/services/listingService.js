const listing = require('../models/listing');
const city = require('../models/city');
const transaction = require('../models/transaction');
const bid = require('../models/bid');
const joi = require('joi');
const userSvc = require('./userService');
const s3Utils = require('../utils/s3');
const {ObjectId} = require('bson');
const user = require('../models/user');
const qTransform = require('../utils/queryTransform');
const notificationSvc = require('./notificationService');
const agenda = require('../config/agenda');
const nftService = require('../services/nftService');
const ValidationError = require('joi').ValidationError;
const {default: axios} = require('axios');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const bidSvc = require('./bidService');

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

  if (query.name) {
    queries['name'] = qTransform.regexLike(query.name);
  }

  if (query.city) {
    queries['city.ID'] = new ObjectId(query.city);
  }

  if (query.exclude) {
    queries['_id'] = {$ne: new ObjectId(query.exclude)};
  }

  // Use Creator ID
  if (query.creator) {
    queries['creator'] = new ObjectId(query.creator);
    queries['owner'] = query.creator;
  }

  // Use Creator ID
  if (query.seller) {
    queries['creator'] = new ObjectId(query.seller);
    queries['owner'] = {$ne: query.seller};
  }

  // Use Owner ID
  if (query.owner) {
    queries['owner'] = query.owner;
    queries['creator'] = {$ne: query.owner};
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
 * @param {Object} user
 * @param {Boolean} incPageViewCounter
 */
async function getOne(id, user = {}, incPageViewCounter=true) {
  if (incPageViewCounter) {
    await viewCounter(id);
  }
  const detail = await listing.findById(id).orFail(
    () => Error('NotFound'),
  ).populate('nfts',
    // eslint-disable-next-line max-len
    'ipfs.file.originalName ipfs.file.path ipfs.raw.originalName ipfs.raw.path')
    .populate('creator', 'username walletAddress');
  if (detail.deleted) {
    throw new Error('Deleted');
  }
  if ((detail.isPublished == false && user._id == undefined) ||
    (detail.isPublished == false && user._id != detail.owner)) {
    throw new Error('NotFound');
  }
  return detail;
}

/**
 * @param {String} resource
 * @param {Object} data
 */
function validate(resource, data) {
  let schema = {};
  if (resource == '360 Tour') {
    schema = joi.object({
      name: joi.string().required(),
      address: joi.string().required(),
      city: joi.string().required(),
      link360: joi.string().required(),
    }).unknown(true);
  } else if (resource == 'Image' || resource == 'Video') {
    schema = joi.object({
      name: joi.string().required(),
      address: joi.string().required(),
      city: joi.string().required(),
    }).unknown(true);
  } else {
    throw new Error('Resource Type Needed');
  }
  const {error} = schema.validate(data);
  if (error) {
    throw new Error(error);
  }
}

/**
 * @param {Object} data
 * @param {File} files
 * @param {Object} user
 * @param {Object} socket
 * @return {Array}
 */
async function insert(data, files, user, socket) {
  let link360 = '';
  if (data.resource == '360 Tour') {
    link360 = data.link360;
  }
  validate(data.resource, data);
  let geoLocations = [];
  if (data.longitude) {
    geoLocations = [data.longitude, data.latitude];
  }

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
  let tagStr = '';
  if (data.tags) {
    let tags = data.tags.split(',');
    tags = tags.filter((item) => item);
    const uniqueTags = [...new Set(tags)];
    tagStr = uniqueTags.join(',');
  }
  // Pre Check if user exists
  await userSvc.find(user._id);

  if (data.resource == '360 Tour' && !files.thumbnail) {
    throw new Error('Please provide thumbnail file');
  }

  const item = await listing.create({
    item: data.type,
    name: data.name,
    description: data.description,
    location: data.location,
    address: data.address,
    creator: user._id,
    owner: user._id,
    blockchain: data.blockchain,
    city: datacity,
    tags: tagStr,
    geoLocation: {
      type: 'Point',
      coordinates: geoLocations,
    },
    activeDate: data.activeDate || null,
    resource: data.resource,
    link360: link360,
    createdAt: Date.now(),
  });

  // Uploading Jpg NFT to IPFS
  handleNfts(item._id, files.file, files.thumbnail, data.resource, '', socket, user);
  // if (item.collections) {
  //   collectionItemCount(item.collections.ID);
  // }
  return item;
}

/**
 * @param {ObjectId} id
 * @param {Array} files
 * @param {Array} thumbnail
 * @param {String} resources
 * @param {String} deletedFiles
 * @param {Object} socket
 * @param {Object} user
 */
async function handleNfts(id, files, thumbnail, resources,
  deletedFiles, socket, user) {
  console.log('Handling File');

  if (resources == '360 Tour') {
    nftService.handle360(id, files);
  } else {
    nftService.handle(id, files);
  }


  // Upload first nft on array as thumbnail
  let fileObj = {};
  if (files && files.length > 0) {
    fileObj = files[0];
  }
  if (resources == 'Video' && files) {
    s3Utils.uploadVid(id, fileObj, socket, user);
  } else if (resources == 'Image' && files) {
    s3Utils.upload(id, fileObj, socket, user);
  } else if (resources == '360 Tour' && thumbnail) {
    s3Utils.upload360(id, thumbnail[0], files);
  }
}

/**
 * @param {String} id
 * @param {Object} files
 * @param {Object} data
 * @param {Object} user
 * @return {Array}
 */
async function update(id, files = {}, data, user) {
  const item = await listing.findOne({_id: id, owner: user._id}).orFail(
      () => Error('Not Found'));
  if (item.tokenIds.length !== 0) {
    if (Object.entries(files).length > 0) {
      throw new Error('Not Allowed to update nft files after minting.');
    }
    if ((data.address && data.address !== item.address) ||
        (data.city && data.city !== item.city.ID.toString()) ||
        (data.blockchain && data.blockchain !== item.blockchain)) {
      throw new Error('Not Allowed to update address, city and blockchain after minting.');
    }
  }
  let tagStr = item.tags;
  if (data.tags) {
    const tags = data.tags.split(',');
    const uniqueTags = [...new Set(tags)];
    tagStr = uniqueTags.join(',');
  }

  if (item.resource == '360 Tour') {
    item.link360 = data.link360 || item.link360;
  }
  item.address = data.address || item.address;
  item.name = data.name || item.name;
  item.description = data.description || item.description;
  item.blockchain = data.blockchain || item.blockchain;
  item.tags = tagStr;
  item.resource = data.resource || item.resource;
  item.updatedAt = Date.now();
  if (data.filesForDelete) {
    let ids = [];
    ids = data.filesForDelete.split(',');
    await nftService.remove(ids);
  }
  if (Object.entries(files).length > 0) {
    // eslint-disable-next-line max-len
    handleNfts(item._id, files.file, files.thumbnail, item.resource);
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
  const item = await listing.findById(id).orFail(() => new Error('Not Found'));
  if (item.owner != user._id) {
    throw new Error('Not Authorized to delete this listing');
  }
  await item.delete();

  /**
   *  We Can't remove file from IPFS,
   *  but we can unpin it so it'll get removed by IPFS garbage collector
   */
  // TODO: unpin not working, exs empty

  return item;
}

/**
 * @param {String} id
 * @param {Object} data
 * @param {Object} user
 * @param {Object} socket
 */
async function purchase(id, data, user, socket) {
  // What if there's 2 simultaneous purchase ?
  let item = await listing.findById(id).select('downloadLink owner price name tokenIds copies copiesLeft').where({
    isPublished: true,
  }).orFail(
    () => Error('Listing Not Found'),
  );

  item = await validatePurchase(id, item, data);
  const sellerId = item.owner;
  const trade = await transaction.create({
    to: user._id,
    from: item.owner,
    price: item.price,
    date: Date.now(),
    listingID: id,
    tokenId: data.tokenId,
    quantity: 1,
    event: 'Purchasing',
  });
  if (!item.copiesLeft && item.copies > 1) {
    await recreateById(id, data, user);
    item.copiesLeft = item.copies - 1;
  } else if (item.copiesLeft == 1 || item.copies == 1) {
    item.owner = user._id;
    item.isPublished = false;
    item.tokenIds = [data.tokenId];
  }
  await item.save();

  // nftService.hashMetadata(id, item.tokenID, user._id);
  await notificationSvc.itemPurchased(user, item, socket, sellerId);
  return trade;
}

/**
 *
 * @param {String} id
 * @param {Object} item
 * @param {Object} data
 */
async function validatePurchase(id, item, data) {
  const schema = joi.object({
    tokenId: joi.number().required(),
  });
  const {error} = schema.validate(data, {presence: 'required'});
  if (error) {
    const err = new Error();
    err.message = error.message;
    throw err;
  }

  const check = await listing.findOne({
    tokenIds: data.tokenId,
    blockchain: item.blockchain,
    _id: {$ne: new ObjectId(id)},
  });
  if (check) {
    throw new ValidationError('Token ID already used by another listing.');
  }

  return item;
}

/**
 * @param {String} id
 */
async function viewCounter(id) {
  const item = await listing.findById(id);
  if (item) {
    await listing.findByIdAndUpdate(id, {
      views: item.views + 1,
    });
  }
}

/**
 * @param {String} id
 * @param {Object} self
 */
async function likeCounter(id, self = {}) {
  const item = await listing.findById(id);
  if (self._id == undefined) {
    item.likes++;
    await item.save();
  } else {
    const users = await user.findById(self._id);
    if (users.favorites.includes(id)) {
      const index = users.favorites.indexOf(id);
      users.favorites.splice(index, 1);
      await users.save();
      item.likes = item.likes - 1;

      // Remove User from listing subs list to avoid sending notif to them
      const usrIdx = item.subscribers.indexOf(self._id);
      if (usrIdx > -1) {
        item.subscribers.splice(usrIdx, 1);
      }
    } else {
      users.favorites.push(id);
      await users.save();
      item.likes = item.likes + 1;

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
    royalties: joi.number().max(10).optional(),
    copies: joi.number().required().when('sellMethod', {
      is: 'Auction', then: joi.number().max(1)
    }),
    activeDate: joi.date().optional(),
    buyerAddress: joi.string().optional(),
    royalties: joi.number().optional(),
    sellMethod: joi.string(),
    endDate: joi.date().greater(Date.now()),
    tokenIds: joi.array().when('sellMethod', {is: 'Auction', then: joi.array().required()}),
  });
  const {error} = schema.validate(data);
  if (error) {
    throw new Error(error);
  }
  const item = await listing.findById(id).orFail(
    () => Error('Not Found'),
  );

  let published = false;
  if (data.activeDate == undefined) {
    published = true;
  }

  if (item.owner != user._id) {
    throw new Error('Not Authorized to publish this listing');
  }

  let royalties = 0;
  if (item.tokenIds.length > 0) {
    royalties = item.royalties;
  } else if (!item.tokenID && !data.royalties) {
    if (data.royalties != 0) {
      throw new ValidationError('Royalties required');
    }
  } else {
    royalties = data.royalties;
  }

  if (item.tokenIds.length > 0 && data.royalties !== item.royalties) {
    throw new ValidationError('Not Allowed to Change Royalties');
  }

  if (!("tokenIds" in item) || item.tokenIds.length === 0) {
    item.tokenIds = data.tokenIds ??= [];
  }

  item.royalties = royalties;
  item.owner = user._id;
  item.price = data.price;
  item.activeDate = data.activeDate;
  item.buyerAddress = data.buyerAddress;
  item.isPublished = published;
  item.bid = {
    highest: data.price,
    endDate: data.endDate,
  };
  item.sellMethod = data.sellMethod;
  item.copies = data.copies ??= 1;
  await item.save();

  makeZip(id);

  if (data.activeDate) {
    console.log('adding agenda schedule');
    await agenda.schedule(data.activeDate, 'Scheduled Publish',
      {_id: item._id},
    );
  }
  nftService.hashMetadata(id, data.tokenID, user._id);
  return item;
}

/**
 * @param {String} id
 * @param {Object} user
 */
async function depublish(id, user) {
  const item = await listing.findById(id).orFail(() => new Error('Not Found'));
  if (item.owner != user._id) {
    throw new Error('Unauthorized to depublish this listing');
  }
  item.isPublished = false;
  item.bid = {};
  await bid.updateMany({listing: id}, {status: 'Closed'});
  return await item.save();
}

/**
 * @param {Object} query
 * @param {Number} page
 * @param {Number} limit
 * @param {String} sort
 */
async function explore(query, page, limit, sort = 'bid.highest:asc') {
  const field = sort.split(':');
  const orderBy = field[1] == 'asc' ? '-1' : '1';
  const filters = {};
  filters['isPublished'] = true;
  filters['deleted'] = false;
  const ors = [];
  if (query.city) {
    filters['city.ID'] = qTransform.inObjectIDQuery(query.city, ',');
  }
  if (query.cityUrl) {
    filters['city.url'] = query.cityUrl;
  }
  if (query.search) {
    const q = query.search;
    ors.push({'name': qTransform.regexLike(q)});
    ors.push({'description': qTransform.regexLike(q)});
    ors.push({'address': qTransform.regexLike(q)});
    ors.push({'city.name': qTransform.regexLike(q)});
    ors.push({'tags': qTransform.regexLike(q)});
    ors.push({'blockchain': qTransform.regexLike(q)});
    ors.push({'resource': qTransform.regexLike(q)});
    ors.push({'sellMethod': qTransform.regexLike(q)});
  }

  if (query.keyword) {
    const q = query.keyword.split(',');
    for await (const s of q) {
      ors.push({'name': qTransform.regexLike(s)});
      ors.push({'address': qTransform.regexLike(s)});
      ors.push({'city.name': qTransform.regexLike(s)});
      ors.push({'description': qTransform.regexLike(s)});
      ors.push({'tags': qTransform.regexLike(s)});
    }
  }

  if (query.exclude) {
    filters['_id'] = {$ne: new ObjectId(query.exclude)};
  }

  if (query.price) {
    const prc = query.price.split(',');
    filters['price'] = qTransform.rangeNumber(prc[0], prc[1]);
  }
  if (query.tags) {
    const q = query.tags.split(',');
    for await (const s of q) {
      ors.push({'tags': qTransform.regexLike(s)});
    }
  }
  if (query.resource) {
    filters['resource'] = qTransform.inQuery(query.resource, ',');
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
  if (ors.length > 0) {
    filters['$or'] = ors;
  }
  const listings = await listing.paginate(filters, {
    page,
    limit,
    sort: {
      [field[0]]: orderBy,
      _id: 1,
    },
    // select: {
    //   "name": 1,
    //   "address": 1,
    //   "city": 1,
    //   "geoLocation": 1,
    //   "thumbnail": 1,
    //   "bid.highest": 1,
    //   "price": 1,
    //   "likes": 1,
    // },
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
  // Filter unique item
  let unique = [...new Set(tags)];
  unique = unique.filter((n) => n);
  return unique;
}

/**
 * @param {String} id
 * @param {object} user
 */
async function finishAuction(id, user) {
  const bids = await bid.findOne({
    'deleted': false,
    'listing': new ObjectId(id),
  }).sort('-price').orFail(
    () => Error('Bids Not Found for this listing'),
  );

  const soldPrice = bids.price;
  const item = await listing.findOneAndUpdate({
    '_id': id,
    'owner': user._id,
  }, {
    isPublished: false,
    bid: {},
    owner: bids.bidder.id,
  }).orFail((e) => Error('Cannot find your listing'));
  const trade = await transaction.create({
    from: item.owner,
    to: item.bid.highestBidder,
    price: soldPrice,
    date: Date.now(),
    listingID: id,
    quantity: 1,
    event: 'Auction',
    tokenId: item.tokenIds[0] ??= 0,
  });
  nftService.hashMetadata(id, item.tokenID, item.bid.highestBidder);
  await bidSvc.close(id);
  return trade;
}

/**
 * @param {String} id
 */
async function makeZip(id) {
  console.log('Making Zip for: ', id);
  const nfts = await nftService.getByListingId(id);
  const zipFile = [];
  for await (const nft of nfts) {
    const response = await axios({
      url: nft.ipfs.file.path,
      method: 'GET',
      responseType: 'stream',
    });
    const outPath = path.resolve(__dirname, '../../../uploads/',
      nft.ipfs.file.originalName);
    const writer = response.data.pipe(fs.createWriteStream(outPath));
    writer.on('finish', () => {
      const file = {
        name: nft.ipfs.file.originalName,
        path: outPath,
      };
      zipFile.push(file);
      if (zipFile.length == nfts.length) {
        zip(id, zipFile);
      }
    });
  }
}

/**
 * @param {String} id
 * @param {Array} files
 * @param {Object} user
 * @param {Object} socket
 */
async function zip(id, files) {
  console.log('Compressing Zip for :', id, files.length);
  const archive = archiver('zip', {zlib: {level: 9}});
  archive.on('error', function(err) {
    console.log(err);
  });
  const zipName = `${id}_${Date.now()}.zip`;
  const zipPath = path.resolve(
    __dirname, `../../../uploads/${zipName}`);
  const pipe = fs.createWriteStream(zipPath);
  archive.pipe(pipe);
  for await (const file of files) {
    archive.file(file.path, {name: file.name});
  }
  pipe.on('close', async function() {
    console.log('Uploading Zip for: ', id, zipName)
    await s3Utils.uploadFile({
      name: zipName,
      ext: 'zip',
      mimetype: 'application/zip',
      path: zipPath,
    });
  });
  archive.finalize();

  console.log('Updating Download Link: ', id);
  await listing.findByIdAndUpdate(id, {
    downloadLink: `${process.env.AWS_BUCKET_URL}${zipName}`,
  });
}

/**
 * @param {String} id
 * @param {Object} user
 */
async function download(id, user) {
  const item = await listing.findById(id).select('+downloadLink');
  return item;
}

async function indexer() {
  const listings = await listing.find({
    assets: []
  });
  console.log('Listings Found: ', listings.length);
  let count = 0;
  for (const list of listings) {
    console.log(count++, '/', listings.length);
    const nfts = await nftService.getByListingId(list._id);
    console.log('NFTs found: ', nfts.length);
    if (nfts.length == 0) {
      continue;
    }
    const [writerFile, raw] = await retrieveIPFSFile(nfts[0].ipfs.file);
    writerFile.on('finish', () => {
      console.log('Updating file of: ', list._id);
      s3Utils.upload(list._id, {
        path: raw,
        filename: nfts[0].ipfs.file.originalName,
        mimetype: 'image/jpeg',
      }, {});
    });
    list.save();
  }
}


/**
 * @dev get file from ipfs to compressed it as thumbnail
 * @param {Object} fileObj
 * @return {writer}
 */
async function retrieveIPFSFile(fileObj) {
  const url = fileObj.path;
  const response = await axios({
    url: url,
    method: 'GET',
    responseType: 'stream',
  });
  const endFile = path.resolve(__dirname, '../../../uploads/',
    fileObj.originalName);
  const writer = response.data.pipe(fs.createWriteStream(endFile));
  return [writer, endFile];
}

/**
 * @param {String} id
 * @param {Object} data
 * @param {Object} user
 */
async function recreateById(id, data, user) {
  const item = await listing.findById(id).select('+downloadLink');
  const newListing = item.toObject();
  delete newListing['_id'];
  delete newListing['__v'];
  newListing.copies = 1;
  newListing.copiesLeft = 1;
  newListing.tokenIds = [data.tokenId];
  newListing.owner = user._id;
  newListing.isPublished = false;
  const saved = await listing.create(newListing);
  return saved._id;
}

/**
 * @param {String} username
 * @param {Number} page
 * @param {Number} limit
 * @param {String} sort
 */
async function getListingsByUsername(username, page, limit, sort = 'bid.highest:asc') {
  const field = sort.split(':');
  const orderBy = field[1] === 'asc' ? '1' : '-1';
  const user = await userSvc.getUserByUsername(username, "_id");
  let queries = {};
  queries['isPublished'] = {$eq: true};
  queries['deleted'] = {$ne:true};
  queries['owner'] = user._id.toString();
  const collections = await listing.paginate(queries,{
    page: page,
    limit: limit,
    sort: {[field[0]]: orderBy},
    collation: {locale: 'en_US', numericOrdering: true},
  });
  return collections;
}

/**
 *
 * @param username
 * @param {Number} page
 * @param {Number} limit
 * @param {String} sort
 */
async function getSoldListingsByUsername(username, page, limit,sort = 'bid.highest:asc') {
  const field = sort.split(':');
  const orderBy = field[1] === 'asc' ? '1' : '-1';
  const user = await userSvc.getUserByUsername(username, "_id");
  let queries = {};
  queries['creator'] = user._id;
  queries['owner'] = {$ne: user._id.toString()};
  queries['deleted'] = {$ne: true};
  const collections = await listing.paginate(queries, {
    page: page,
    limit: limit,
    sort: {[field[0]]: orderBy},
    collation: {locale: 'en_US', numericOrdering: true},
  });
  return collections;
}

async function getMarkers(query, page, limit, sort = 'bid.highest:asc') {
  const field = sort.split(':');
  const orderBy = field[1] == 'asc' ? '-1' : '1';
  const filters = {};
  filters['isPublished'] = true;
  filters['deleted'] = false;
  const ors = [];
  if (query.city) {
    filters['city.ID'] = qTransform.inObjectIDQuery(query.city, ',');
  }
  if (query.cityUrl) {
    filters['city.url'] = query.cityUrl;
  }
  if (query.search) {
    const q = query.search;
    ors.push({'name': qTransform.regexLike(q)});
    ors.push({'description': qTransform.regexLike(q)});
    ors.push({'address': qTransform.regexLike(q)});
    ors.push({'city.name': qTransform.regexLike(q)});
    ors.push({'tags': qTransform.regexLike(q)});
    ors.push({'blockchain': qTransform.regexLike(q)});
    ors.push({'resource': qTransform.regexLike(q)});
    ors.push({'sellMethod': qTransform.regexLike(q)});
  }

  if (query.keyword) {
    const q = query.keyword.split(',');
    for await (const s of q) {
      ors.push({'name': qTransform.regexLike(s)});
      ors.push({'address': qTransform.regexLike(s)});
      ors.push({'city.name': qTransform.regexLike(s)});
      ors.push({'description': qTransform.regexLike(s)});
      ors.push({'tags': qTransform.regexLike(s)});
    }
  }

  if (query.exclude) {
    filters['_id'] = {$ne: new ObjectId(query.exclude)};
  }

  if (query.price) {
    const prc = query.price.split(',');
    filters['price'] = qTransform.rangeNumber(prc[0], prc[1]);
  }
  if (query.tags) {
    const q = query.tags.split(',');
    for await (const s of q) {
      ors.push({'tags': qTransform.regexLike(s)});
    }
  }
  if (query.resource) {
    filters['resource'] = qTransform.inQuery(query.resource, ',');
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
  if (ors.length > 0) {
    filters['$or'] = ors;
  }
  const markers = await listing.paginate(filters, {
    page, limit,
    sort: {
      [field[0]]: orderBy,
      _id: 1,
    },
    select: {
      "geoLocation": 1,
      "address": 1,
    },
  });
  return markers;
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
  depublish,
  explore,
  getTags,
  finishAuction,
  download,
  indexer,
  getListingsByUsername,
  getSoldListingsByUsername,
  getMarkers,
};
