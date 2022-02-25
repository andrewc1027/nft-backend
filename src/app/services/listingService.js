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
 * @param {Object} user
 */
async function getOne(id, user = {}) {
  viewCounter(id);
  const detail = await listing.findById(id).orFail(
    () => Error('NotFound'),
  ).populate('nfts',
    // eslint-disable-next-line max-len
    'ipfs.file.originalName ipfs.file.path ipfs.raw.originalName ipfs.raw.path');
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

  if (data.resource != '360 Tour' && !files.raw) {
    throw new Error('Raw file needed for verification purpose');
  }

  if (data.resource == '360 Tour' && !files.thumbnail) {
    throw new Error('Please provide thumbnail file');
  }

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
  handleNfts(item._id, files.file, files.raw, files.thumbnail, data.resource, '', socket, user);
  // if (item.collections) {
  //   collectionItemCount(item.collections.ID);
  // }
  return item;
}

/**
 * @param {ObjectId} id
 * @param {Array} files
 * @param {Array} raws
 * @param {Array} thumbnail
 * @param {String} resources
 * @param {String} deletedFiles
 * @param {Object} socket
 * @param {Object} user
 */
async function handleNfts(id, files, raws, thumbnail, resources,
  deletedFiles, socket, user) {
  console.log('Handling File');

  if (resources == '360 Tour') {
    nftService.handle360(id, files);
  } else {
    nftService.handle(id, files, raws);
  }


  // Upload first nft on array as thumbnail
  let fileObj = {};
  let rawObj = {};
  if (files && files.length > 0) {
    fileObj = files[0];
  }
  if (raws && raws.length > 0) {
    rawObj = raws[0];
  }

  if ((resources == 'Video' && files || resources == 'Video' && raws)) {
    s3Utils.uploadVid(id, fileObj, rawObj, socket, user);
  } else if ((resources == 'Image' && files) || (resources == 'Image' && raws)) {
    s3Utils.upload(id, fileObj, rawObj, socket, user);
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

  if (item.isPublished) {
    if (Object.entries(files).length > 0) {
      throw new Error('Not Allowed to update nft files after minting/publishing');
    }
    if (data.address || data.city || data.blockchain) {
      throw new Error('Not Allowed to update address, city and blockchain after minting publishing');
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
  console.log(files);
  if (data.filesForDelete) {
    let ids = [];
    ids = data.filesForDelete.split(',');
    await nftService.remove(ids);
  }
  if (Object.entries(files).length > 0) {
    // eslint-disable-next-line max-len
    handleNfts(item._id, files.file, files.raw, files.thumbnail, item.resource);
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
  const item = await listing.findById(id).select('downloadLink owner price name').where({
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
    quantity: 1,
    event: 'Purchasing',
  });

  await listing.findByIdAndUpdate(id, {
    owner: user._id,
    isPublished: false,
    bid: {},
  });
  nftService.hashMetadata(id, item.tokenID, user._id);
  await notificationSvc.itemPurchased(user, item, socket);
  return trade;
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
    copies: joi.number().required(),
    tokenID: joi.string().required(),
    activeDate: joi.date().optional(),
    buyerAddress: joi.string().optional(),
    sellMethod: joi.string(),
    endDate: joi.date().greater(Date.now()),
  });
  const {error} = schema.validate(data);
  if (error) {
    throw new Error(error);
  }
  const item = await listing.findById(id).orFail(
    () => Error('Not Found'),
  );
  const check = await listing.findOne({
    tokenID: data.tokenID,
    blockchain: item.blockchain,
    _id: {$ne: new ObjectId(id)},
  });
  if (check) {
    throw new ValidationError('Token ID already used by another listing.');
  }
  let published = false;
  if (data.activeDate == undefined) {
    published = true;
  }

  if (item.owner != user._id) {
    throw new Error('Not Authorized to publish this listing');
  }
  let royalties = 0;

  if (item.tokenID) {
    royalties = item.royalties;
  } else if (!item.tokenID && !data.royalties) {
    if (data.royalties != 0) {
      throw new ValidationError('Royalties required');
    }
  } else {
    royalties = data.royalties;
  }

  if (item.tokenID && data.royalties) {
    throw new ValidationError('Not Allowed to Change Royalties');
  }
  item.owner = user._id;
  item.price = data.price;
  item.royalties = royalties;
  item.activeDate = data.activeDate;
  item.buyerAddress = data.buyerAddress;
  item.tokenID = data.tokenID;
  item.isPublished = published;
  item.bid = {
    highest: data.price,
    endDate: data.endDate,
  },
    item.sellMethod = data.sellMethod;
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
    ors.push({'address': qTransform.regexLike(q)});
    ors.push({'city.name': qTransform.regexLike(q)});
  }

  if (query.keyword) {
    const q = query.keyword.split(',');
    for await (const s of q) {
      ors.push({'name': qTransform.regexLike(s)});
      ors.push({'address': qTransform.regexLike(s)});
      ors.push({'city.name': qTransform.regexLike(s)});
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
    page, limit, sort: {[field[0]]: orderBy},
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
  let nftPath = '';
  if (item.resource == '360 Tour' && !item.downloadLink) {
    throw new Error('Downloadable Resources are not found');
  }
  if (item.resource == '360 Tour') {
    nftPath = item.downloadLink;
  } else {
    const gem = await nftService.getByListingId(id);
    nftPath = `${process.env.PINATA_GATEWAY}/ipfs/${gem[0].ipfs.file.cid}`;
  }
  return nftPath;
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
    list.rawFileName = nfts[0].ipfs.raw.originalName;
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
};
