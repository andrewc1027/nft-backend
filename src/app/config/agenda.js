const Agenda = require('agenda');
const Listing = require('../models/listing');
const {close} = require('../services/bidService');
console.log('agenda config');
// set the collection where the jobs will be save
// the collection can be name anything
const agenda = new Agenda({
  db: {address: process.env.MONGO_CONN, collection: 'jobs'},
});

agenda.on('ready', async () => {
  console.log('Agenda Ready');
  await agenda.start();
},
);

const graceful = () => {
  agenda.stop(() => process.exit(0));
};

process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);

agenda.define('Scheduled Publish', async (job, done) => {
  console.log('Activating Listing: ', job.attrs.data._id);
  await Listing.findByIdAndUpdate(job.attrs.data._id, {
    isPublished: true,
    activeDate: null,
  }).orFail( (e) => new Error(e));
  done();
});

agenda.define('Auction Timer', async (job, done) => {
  await Listing.findByIdAndUpdate(job.attrs.data._id, {
    'isPublished': false,
  }).orFail( (e) => new Error(e));
  console.log(`Listing ${job.attrs.data._id} auction has been disabled`);
  // Close all bid from this listing, and set highest price as the winning bid.
  await close(job.attrs.data._id);
  done();
});

module.exports = agenda;
