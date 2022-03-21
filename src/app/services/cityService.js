const {ObjectId} = require('bson');
const city = require('../models/city');
const listing = require('../models/listing')
const qTransform = require('../utils/queryTransform');
const joi = require('joi');
/**
 * @param {Object} query
 * @param {Object} user
 * @param {Number} page
 * @param {Number} limit
 * @return {Object}
 */
async function getAll(query, user, page, limit) {
  const queries = {};
  const sort = {index: 1};

  if (query.url) {
    queries['url'] = query.url;
  }
  queries['deleted'] = {$ne: true};
  if (query.name) {
    queries['name'] = qTransform.regexLike(query.name);
  }

  if (query.id) {
    queries['_id'] = new ObjectId(query.id);
  }
  if (query.listed === true || query.listed === 'true') {
    let filter;
    let listedCitiesIds = [];
    let conditions = [];
    if(query.id) {
      conditions.push({"city.ID":query.id});
    }
    conditions.push({isPublished: true});
    conditions.push({deleted: {$ne: true}});
    filter = {$and: conditions}
    const listedCities = await listing.find(
        filter,
        {"city.ID": 1});
    for (let i = 0; i < listedCities.length; i++) {
      listedCitiesIds.push(listedCities[i].city.ID.toString());
    }
    listedCitiesIds = Array.from(new Set(listedCitiesIds));
    queries['_id'] = {$in: listedCitiesIds};
  }
  const collections = await city.paginate(
      queries, {
        page: page,
        limit: limit,
        sort: sort,
        collation: {locale: 'en_US', numericOrdering: true}});
  return collections;
}

/**
 * @param {String} id
 * @return {Object}
 */
async function getOne(id) {
  const item = await city.findById(id).orFail(
      () => Error('Not Found'),
  );
  return item;
}

/**
 * @param {Object} query
 * @param {Number} limit
 */
async function getAutocomplete(query, limit = 10) {
  const filters = {};
  if (query.search) {
    const q = query.search;
    filters['name'] = qTransform.regexLike(q);
  }
  filters['deleted'] = {$ne: true};
  filters['parent'] = true;
  const result = await city.paginate(filters, {
    select: 'name _id',
    sort: {index: 1},
    limit: limit,
    collation: {
      locale: 'en_US',
      numericOrdering: true}, // collation needed to sort string as number
  });
  const x = [];
  result.docs.forEach((coll) => {
    const {_id, name} = coll;
    x.push({value: _id, label: name});
  });
  return x;
}

/**
 * @param {Object} data
 */
async function add(data) {
  const schema = joi.object({
    name: joi.string().required(),
    geoLocation: {
      type: joi.string(),
      coordinates: joi.array(),
    },
  });
  const {error} = schema.validate(data, {allowUnknown: true});
  if (error) {
    throw new Error(error.details[0].message);
  }
  const existingCity = await city.findOne({"name": data.name});
  if (existingCity) {
    return existingCity;
  } else {
    const res = await city.create(data);
    return res;
  }
}

module.exports = {
  getAll,
  getOne,
  getAutocomplete,
  add,
};
