const Agenda = require('agenda');
console.log('agenda config');
// set the collection where the jobs will be save
// the collection can be name anything
const agenda = new Agenda({
  db: {address: process.env.MONGO_CONN, collection: 'jobs'},
});

module.exports = agenda;
