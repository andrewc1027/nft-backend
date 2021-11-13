const mongoose = require('mongoose');
const csv = require('fast-csv');
const fs = require('fs');
const path = require('path');
const {regexLike} = require('../src/app/utils/queryTransform');
require('dotenv').config();

console.log(process.env.MONGO_CONN);
mongoose.connect(process.env.MONGO_CONN);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function() {
  console.log('Connected successfully');

  fs.createReadStream(path.resolve(__dirname, 'update_population.csv'))
      .pipe(csv.parse({headers: true}))
      .on('data', (row) => {
        db.collection('cities').findOneAndUpdate(
            {'name': regexLike(row.name)},
            {$set: {population: row.pop2021}})
            .then(function(data) {
              console.log(row.name, row.pop2021, data.value.name);
            });
      })
      .on('end', (rowCount) => {
        console.log('done', rowCount);
      });
});


