const mergeImages = require('merge-images');
const fs = require('fs');

async function mergeAndGetBase64(objects, options){
    let b64 = await mergeImages(objects, options);

    //check if the base64 string came back null
    if(b64 == null) {
        throw "B64 String came back null while merging images";
    }

    return b64.replace(/^data:image\/png;base64,/, "")
}

async function mergeAndSave(objects, options, path = "debug.png") {
    let data = await mergeAndGetBase64(objects, options);

    let lock = new Promise((resolve) => {
        fs.writeFile(path, data, {encoding: 'base64'}, function (err) {
            //if there was an error log it
            if (err) {
                console.error(err);
            } else {
                //resolve the promise
                return resolve(true);
            }
        });
    });

    await lock;

    return path;
}

module.exports.mergeAndSave = mergeAndSave;
module.exports.mergeAndGetBase64 = mergeAndGetBase64;