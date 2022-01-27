const web3 = require('./web3');
const fs = require('fs');
const abiBuffer = fs.readFileSync('./src/app/abi/abiPolygon.json');
const abiJson = JSON.parse(abiBuffer.toString());
const contract = new web3.eth.Contract(
    abiJson.abi,
    process.env.POLYGON_ADDRESS);
console.log(process.env.POLYGON_ADDRESS);
module.exports = contract;
