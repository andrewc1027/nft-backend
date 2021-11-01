const Agenda = require('agenda');
console.log('agenda config');
// set the collection where the jobs will be save
// the collection can be name anything
const agenda = new Agenda({
  db: {address: process.env.MONGO_CONN, collection: 'jobs'},
});
  // if there are jobs in the jobsTypes array set up
agenda.on('ready', async () => await agenda.start());

module.exports = agenda;
