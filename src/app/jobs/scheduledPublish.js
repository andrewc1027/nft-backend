const Listing = require('../models/listing');

module.exports = (agenda) => {
  console.log('jobs');
  agenda.define('Scheduled Publish', (job, done) => {
    Listing.findByIdAndUpdate(job.attrs.data.listingID, {
      isPublished: true,
    });
  });
};
