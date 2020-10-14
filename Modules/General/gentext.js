const tti = require('text-to-image');
const uuid = require('uuid');
const fs = require('fs')

async function GenText(text, width = 512) {


    let name = process.cwd() + "\\tmp\\" + uuid.v4() + ".png";

    let imgdata = await tti.generate(`${text}`, {
        maxWidth: width,
        fontSize: 56,
        fontFamily: 'Segoe UI Black',
        textAlign: "center",
        lineHeight: 80,
        margin: 0,
        bgColor: "transparent",
        textColor: "white",
    });

    //format the data for png image format
    const data = imgdata.replace(/^data:image\/\w+;base64,/, '');

    let lock = new Promise((resolve) => {
        fs.writeFile(name, data, {
            encoding: 'base64'
        }, function (err) {
            if (err) console.error(err);
            else {
                return resolve(true);
            }
        });
    });

    await lock;

    return name;
}

/**
 * Deletes files for left over temp files
 * @param {Object} objects 
 */
async function cleanupFiles(objects) {

    //iterate through all th objects
    for (let object in objects) {
        let cur = objects[object];

        //if the file is in the tmp dir
        if (cur.src.includes("\\tmp\\")) {

            //delete it
            fs.unlink(cur.src, (err) => {
                if (err) {
                    console.error(err);
                }
            });
        }
    }
}

module.exports.GenText = GenText;
module.exports.cleanupFiles = cleanupFiles;