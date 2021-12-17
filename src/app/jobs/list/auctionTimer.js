const Listing = require('../../models/listing');

module.exports = (agenda) => {
  agenda.define('Auction Timer', async (job, done) => {
    await Listing.findByIdAndUpdate(job.attrs.data._id, {
      'bid.activeAuction': false,
    });
    console.log(`Listing ${job.attrs.data._id} auction has been disabled`);
    done();
  });
};
