const mongoose = require('mongoose');
const csv = require('fast-csv');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log(process.env.MONGO_CONN);
mongoose.connect(process.env.MONGO_CONN);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', async () => {
    console.log('Connected successfully');
    let listingsToUpdate;
    const cursor = db.collection('listings').find({"listingID": {$exists: true}});
    if (await cursor.hasNext()) {
        listingsToUpdate = cursor.readBufferedDocuments();
        let currentListing;
        for (currentListing of listingsToUpdate) {
            if ('listingIds' in currentListing) {
                if (currentListing.listingIds.indexOf(currentListing.listingID) === -1) {
                    currentListing.listingIds.push(currentListing.listingID);
                }
            }
                console.log(currentListing)
        }
    }

    console.log(listingsToUpdate)
});

console.log("exit")