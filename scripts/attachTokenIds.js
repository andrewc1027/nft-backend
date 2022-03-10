const mongoose = require('mongoose');
require('dotenv').config();

console.log(process.env.MONGO_CONN);
mongoose.connect(process.env.MONGO_CONN);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', async () => {
    console.log('Connected successfully');
    let listingsToUpdate;
    let currentListing, listingsToUpdateNum;
    let listingsUpdated = 0;
    const cursor = db.collection('listings').find({"tokenID": {$exists: true}});
    if (await cursor.hasNext()) {
        listingsToUpdate = cursor.readBufferedDocuments();
        listingsToUpdateNum = listingsToUpdate.length
        for (currentListing of listingsToUpdate) {
            if ('tokenIds' in currentListing) {
                if (currentListing.tokenIds.indexOf(currentListing.tokenID) === -1) {
                    currentListing.tokenIds.push(currentListing.tokenID);
                    await db.collection('listings').findOneAndUpdate({"_id": currentListing._id}, {$set: {"tokenIds": currentListing.tokenIds}})
                    listingsUpdated++;
                    console.log(`Listing ${currentListing._id} updated. tokenID ${currentListing.tokenID} added to tokenIds`)
                } else {
                    console.log(`tokenID ${currentListing.tokenID} for listing ${currentListing._id} already in tokenIds`)
                }
            } else {
                currentListing.tokenIds = [currentListing.tokenID]
                await db.collection('listings').findOneAndUpdate({"_id": currentListing._id}, {$set: {"tokenIds": currentListing.tokenIds}})
                listingsUpdated++;
                console.log(`Listing ${currentListing._id} updated`)
            }
        }
        console.log(`Updated ${listingsUpdated} from ${listingsToUpdateNum} listings containing tokenId.`)
    }
});