const Listing = require('../../models/listing');

module.exports = (agenda) => {
  agenda.define('Scheduled Publish', async (job, done) => {
    console.log('Activating Listing: ', job.attrs.data._id);
    await Listing.findByIdAndUpdate(job.attrs.data.listingID, {
      isPublished: true,
    });
    done();
  });
};
