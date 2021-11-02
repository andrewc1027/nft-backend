const {ObjectId} = require('bson');

/**
 * @param {Number} gte
 * @param {Number} lte
 * @return {Object}
 */
function rangeNumber(gte, lte) {
  const range = {$gte: gte || 0, $lte: lte || 1000};
  return range;
}

/**
 * @param {String} string
 * @param {String} separator
 * @return {Object}
 */
function inQuery(string, separator) {
  const arr = string.split(separator);
  const inQuery = {$in: arr};
  return inQuery;
}

/**
 * @param {String} string
 * @param {String} separator
 * @return {Object}
 */
function inObjectIDQuery(string, separator) {
  const arr = string.split(separator);
  const ids = [];
  arr.forEach((id)=>{
    ids.push(new ObjectId(id));
  });
  console.log(ids);
  const inQuery = {$in: ids};
  return inQuery;
}

/**
 * @param {String} searchString
 * @return {Object}
 */
function regexLike(searchString) {
  const rgx = {$regex: `.*${searchString}.*`, $options: 'i'};
  return rgx;
}

module.exports = {
  rangeNumber,
  inQuery,
  regexLike,
  inObjectIDQuery,
};
