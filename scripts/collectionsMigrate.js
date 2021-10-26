const mongoose = require('mongoose');
const csv = require('fast-csv');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

mongoose.connect(process.env.MONGO_CONN);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function() {
  console.log('Connected successfully');
});

let many = [];
fs.createReadStream(path.resolve(__dirname, 'uscities.csv'))
    .pipe(csv.parse({headers: true}))
    .on('data', (row) => {
      console.log(many.length);
      many.push({
        name: `${row.city}, ${row.state_id}`,
        geoLocation: {
          type: row.source,
          coordinates: [row.lng, row.lat],
        },
        density: row.density,
        population: row.population,
        timezone: row.timezone,
        stateCode: row.state_id,
        state: row.state_name,
        parent: true,
        owner: 'Admin',
        url: `${row.city.toLowerCase().split(' ').join('-')}-${row.state_name.toLowerCase().split(' ').join('-')}`,
      });
      if (many.length == 1000) {
        db.collection('cities').insertMany(many).then((data) => {
          console.log(data, 'inserted');
        }).catch((e)=>{
          console.log(e);
        });
        many = [];
      }
    })
    .on('end', (rowCount) => {
      db.collection('cities').insertMany(many).then((data) => {
        console.log(data, 'inserted');
      }).catch((e)=>{
        console.log(e);
      });
      console.log(`Parsed ${rowCount} rows`);
    });


