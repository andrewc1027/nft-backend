const {ObjectId} = require('bson');
const city = require('../models/city');
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
  const sort = {population: -1};
  if (query.url) {
    queries['url'] = query.url;
  }

  if (query.id) {
    queries['_id'] = new ObjectId(query.id);
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
  filters['parent'] = true;
  const result = await city.paginate(filters, {
    select: 'name _id',
    sort: {population: -1},
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
    population: joi.string().required(),
  });
  const {error} = schema.validate(data, {allowUnknown: true});
  if (error) {
    throw new Error(error.details[0].message);
  }
  const res = await city.create(data);
  return res;
}

module.exports = {
  getAll,
  getOne,
  getAutocomplete,
  add,
};
