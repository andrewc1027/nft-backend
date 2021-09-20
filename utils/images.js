const fs = require('fs');
const sharp = require('sharp');

function prepareImagesUrls(images, imageBase, thumbBase) {
  return images.map( (img) => { 
    // img.url = imageBase + img.file_name;
    img.url = imageBase + img.file_name;
    if(typeof(thumbBase) === 'string') img.thumbUrl = thumbBase + img.file_name;
    else img.thumbUrl = null;
    return img; 
  });
}

function cropOutside2size(urlFrom, urlTo, sz ,images) {

  let isSucceded = false;
  for(const image of images) {
    const fileFrom = urlFrom+'/'+image.file_name;
    console.log(fileFrom)

    isSucceded = sharp(fileFrom)
    .resize(sz.x, sz.y, {
      fit:'outside'
    })
    .toFile(urlTo+'/'+image.file_name)
    .then( info => {
      console.log("CROP DONE:")
      // console.log(info)
      // isSucceded = true
      return true
    })
    .catch(
      err => {
        console.log("CROP ERROR:")
        console.log(err)
        return false
      }
    )
  }

  return isSucceded
}

function prepareUrl4Array(items, fieldName, imageBase) {
  return items.map((item) => {
    item[fieldName] = prepareImagesUrls(item[fieldName], imageBase);
    return item;
  });
}
function prepareImagesUrls(images, imageBase) {
    return images.map((img) => {
      img.url = imageBase + img.file_name;
      return img;
    });
  }

exports.prepareImagesUrls = prepareImagesUrls;
exports.cropOutside2size = cropOutside2size;
exports.prepareUrl4Array = prepareUrl4Array;