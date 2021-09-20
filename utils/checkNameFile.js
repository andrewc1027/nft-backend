const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const config = require('config');
const { Image, validateImages } = require('../models/image');
// const { File, validateFile } = require('../models/file');
const _ = require('lodash');



async function checkFileName(model, arrayofItem) { //проверка на уникальность картинки в базе по имени
    console.log("checkImagesName");
    console.log(model);
    console.log(arrayofItem);
    let checkArrayofItem = _.cloneDeep(arrayofItem)
    let n = getRandomInt(1, 1000)
    let checkModel = model;
    switch (checkModel) {
        case 'Image':
            console.log("!!!!!!!!!!!!!!IMAGE!!!!!!!!!!!!!");
            if (typeof checkArrayofItem.length == 'undefined') {
                console.log("OBJECT!!!!!!");
                const images = await Image.find()
                    //console.log(images);
                let checkImgName = checkArrayofItem.name
                let newName = checkArrayofItem.name.substr(0, checkArrayofItem.name.length - 4);
                let endName = checkArrayofItem.name.substr(checkArrayofItem.name.length - 4);
                console.log("newName", newName);
                console.log("endName", endName);

                for (let item of images) {
                    if (item.file_name == checkImgName) {
                        let n = getRandomInt(1, 1000)
                        console.log("ITEM", item);
                        checkArrayofItem.name = newName + `_${n}` + endName
                        console.log("checkArrayofItem.name", checkArrayofItem.name);

                    }

                }
                console.log("checkArrayofItem", checkArrayofItem);
                return checkArrayofItem

            } else {
                console.log("!!!!!ARRAY");
                const images = await Image.find()
                    //console.log(images);
                let checkImgName = ""
                let newName = ""
                let endName = ""
                for (let i = 0; i < checkArrayofItem.length; i++) {
                    checkImgName = checkArrayofItem[i].name
                    newName = checkArrayofItem[i].name.substr(0, checkArrayofItem[i].name.length - 4);
                    endName = checkArrayofItem[i].name.substr(checkArrayofItem[i].name.length - 4);

                    for (let item of images) {
                        if (item.file_name == checkArrayofItem[i].name) {
                            let n = getRandomInt(1, 1000)
                            console.log("ITEM", item);
                            checkImgName = newName + `_${n}` + endName
                            checkArrayofItem[i].name = checkImgName

                        }

                    }
                }


                console.log("checkArrayofItem", checkArrayofItem);

                return checkArrayofItem

            }
        case 'File':
            console.log("!!!!!!!!!!!!!!FILE!!!!!!!!!!!!!");
            console.log(checkArrayofItem);
            if (typeof checkArrayofItem.length == 'undefined') {
                console.log("OBJECT!!!!!!");
                const videos = await File.find()
                console.log(videos);
                let checkImgName = checkArrayofItem.name
                let newName = checkArrayofItem.name.substr(0, checkArrayofItem.name.length - 4);
                let endName = checkArrayofItem.name.substr(checkArrayofItem.name.length - 4);
                console.log("newName", newName);
                console.log("endName", endName);

                for (let item of videos) {
                    if (item.file_name == checkImgName) {
                        let n = getRandomInt(1, 1000)
                        console.log("ITEM", item);
                        checkArrayofItem.name = newName + `_${n}` + endName
                        console.log("checkArrayofItem.name", checkArrayofItem.name);

                    }

                }
                console.log("checkArrayofItem", checkArrayofItem);
                return checkArrayofItem

            } else {
                console.log("!!!!!ARRAY");
                const images = await File.find()
                    //console.log(images);
                let checkImgName = ""
                let newName = ""
                let endName = ""
                for (let i = 0; i < checkArrayofItem.length; i++) {
                    checkImgName = checkArrayofItem[i].name
                    newName = checkArrayofItem[i].name.substr(0, checkArrayofItem[i].name.length - 4);
                    endName = checkArrayofItem[i].name.substr(checkArrayofItem[i].name.length - 4);

                    for (let item of images) {
                        if (item.file_name == checkArrayofItem[i].name) {
                            let n = getRandomInt(1, 1000)
                            console.log("ITEM", item);
                            checkImgName = newName + `_${n}` + endName
                            checkArrayofItem[i].name = checkImgName

                        }

                    }
                }


                console.log("checkArrayofItem", checkArrayofItem);

                return checkArrayofItem

            }

    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

exports.checkFileName = checkFileName;
exports.getRandomInt = getRandomInt;