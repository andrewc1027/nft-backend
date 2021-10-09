const listing = require('../models/listing');
const collection = require('../models/collection');
const transaction = require('../models/transaction');
const joi = require('joi');
const fs = require('fs');
const pinata = require('../config/pinata');
const userSvc = require('./userService');
const s3Utils = require('../utils/s3');
const {ObjectId} = require('bson');
const user = require('../models/user');
/**
 * @param {Object} query
 * @param {Number} page
 * @param {Number} limit
 * @param {Object} self
 * @return {Array}
 */
async function getAll(query, page, limit, self) {
  const queries = {};

  // Use Collection ID
  if (query.collection) {
    queries['collections.ID'] = new ObjectId(query.collection);
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
      () => Error('Not Found'),
  );
  return detail;
}

/**
 * @param {Object} data
 * @param {File} files
 * @param {Object} user
 * @return {Array}
 */
async function insert(data, files, user) {
  let tags = [];
  if (data.tags) {
    tags = data.tags.split(',');
  }
  let geoLocations = [];
  if (data.longitude) {
    geoLocations = [data.longitude, data.latitude];
  }
  // Uploading Thumbnail NFT to AWS S3
  const thumbData = await s3Utils.upload(files.file[0]);
  let dataColl = {};
  if (data.collection) {
    const coll = await collection.findById(data.collection);
    if (coll) {
      dataColl = {
        ID: coll._id,
        name: coll.name,
        url: coll.url,
        logoImage: coll.logoImage,
      };
    }
  }
  // Pre Check if user exists
  await userSvc.find(user._id);
  const item = await listing.create({
    name: data.name,
    description: data.description,
    location: data.location,
    address: data.address,
    creator: {
      name: user.username,
      ID: user._id,
    },
    blockchain: data.blockchain,
    collections: dataColl,
    tags: tags,
    fileOriginalName: files.file[0].originalname,
    filePath: thumbData.Location,
    rawFileName: files.raw[0].originalname,
    geoLocation: {
      type: 'Point',
      coordinates: geoLocations,
    },
  });

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
  if (item.collections) {
    collectionItemCount(item.collections.ID);
  }
  return item;
}


/**
 * @param {String} id
 * @param {Object} files
 * @param {Object} data
 * @return {Array}
 */
async function update(id, files, data) {
  const item = await listing.findByIdAndUpdate(id, data).orFail(
      () => Error('Not Found'));
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
  let dataColl = {};
  if (data.collection) {
    const coll = await collection.findById(data.collection);
    if (coll) {
      dataColl = {
        ID: coll._id,
        name: coll.name,
        url: coll.url,
        logoImage: coll.logoImage,
      };
    }
  }
  item.collections = dataColl;
  if (data.longitude) {
    const geoLocations = [data.longitude, data.latitude];
    item.geoLocation.coordinates = geoLocations;
  }
  await item.save();
  if (item.collections) {
    collectionItemCount(item.collections.ID);
  }
  return item;
}

/**
 * @param {String} id
 * @param {Object} user
 * @return {Array}
 */
async function remove(id, user) {
  const exs = await listing.findByIdAndDelete(id).orFail(
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
 */
async function purchase(id, data, user) {
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
async function likeCounter(id, self) {
  const item = await listing.findById(id);
  const users = await user.findById(self._id);
  if (users.favorites.includes(id)) {
    const index = users.favorites.indexOf(id);
    users.favorites.splice(index, 1);
    await users.save();
    item.likes = item.likes-1;
  } else {
    users.favorites.push(id);
    await users.save();
    item.likes = item.likes+1;
  }
  await item.save();
}

/**
 * Add Nft to published listing
 * @param {String} id
 * @param {Object} data
 * @param {Object} user
 */
async function publish(id, data, user) {
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

  return listedItem;
}

/**
 * @param {Object} query
 * @param {Number} page
 * @param {Number} limit
 */
async function explore(query, page, limit) {
  const filters = {};
  filters['isPublished'] = true;
  const listings = await listing.paginate(filters, {page: page, limit: limit});
  return listings;
}

/**
 * @param {String} collectionID
 */
async function collectionItemCount(collectionID) {
  const listings = await listing.find({'collections.ID': collectionID});
  console.log(listings, collectionID);
  await collection.findByIdAndUpdate(collectionID, {
    listingCount: listings.length,
  }).orFail(
      () => Error('Not Found'),
  );
  return listings;
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
};
