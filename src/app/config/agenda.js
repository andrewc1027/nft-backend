const Agenda = require('agenda');
const listing = require('../models/listing');
console.log('agenda config');
// set the collection where the jobs will be save
// the collection can be name anything
const agenda = new Agenda({
  db: {address: process.env.MONGO_CONN, collection: 'jobs'},
});
  // if there are jobs in the jobsTypes array set up
agenda.on('ready', async () => {
  console.log('agenda ready'); await agenda.start();
});

agenda.define('auction timer', async (job) => {
  await listing.findByIdAndUpdate(job.attrs.data._id, {
    'bid.activeAuction': false,
  });
  console.log(`Listing ${job.attrs.data._id} auction has been disabled`);
});
module.exports = agenda;
