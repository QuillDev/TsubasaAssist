const { Canvas, Image } = require('canvas');

const got = require('got')
const HTMLParser = require('node-html-parser');

const imageUtils = require('../General/image-utils');

/**
 * Get data to post as json for scheduled shows
 * @returns {Promise<JSON>}
 */
async function getSchedule() {

    return new Promise(async (resolve) => {
        const scheduleImageData = createScheduleImage();
        const names = getShowNames();

        //wait for those requests to finish
        await Promise.all([scheduleImageData, names]);

        return resolve({img_data: await scheduleImageData, names: await names});
    });
}
/**
 * Create the schedule image based the popularity of the shows airing today
 * @returns {Promise<*>}
 */
async function createScheduleImage() {

    //get the three most popular shows
    const topThree = await getMostPopular();

    //create image objects array
    let imgObjects = [];

    //Construct image dimensions for them
    for(const show in topThree) {

        //make sure top three has the property show
        if(topThree.hasOwnProperty(show)){
            //get the current show
            const currentShow = topThree[show];

            //add the image position to imgObjects
            imgObjects.push( {
                x: 250 * show,
                y: 0,
                src: currentShow.image_url
            });
        }

    }

    //Create the options based on the images
    const options = {
        Canvas: Canvas,
        Image: Image,
        width: 250 * topThree.length,
        height: 350,
    }

    //create the image and get the image data
    let data = imageUtils.mergeAndGetBase64(imgObjects, options)
        .catch(error => console.error(`Error when creating anime schedule, ${error}`));

    return await data;
}

/**
 * Get the names of the shows
 * @returns {Promise<string>}
 */
async function getShowNames() {
    const shows = await getScheduleData();

    let names = ""

    for(let show of shows[getDay()]){
        let title = show.title;

        //if the show title is super long, cut it plz
        if(show.title.length > 50) {
            title = `${title.substring(0, 45)}...`;
        }

        //push the title to the names array.
        names += `${title}\n`;
    }
    return names;
}

/**
 * Gets the three most popular shows airing today and the names of all of the shows airing today
 * @returns {Promise<null|*[]>}
 */
async function getMostPopular() {
    //get the parsed schedule data
    let parsedScheduleData = await parseScheduleData();

    //Sort the data from most members to least members
    parsedScheduleData.sort((a, b) => {
        return b.members - a.members;
    });

    //if the parsed schedule has more than 3 objects, cull off the extras
    if(parsedScheduleData.length > 3){
        parsedScheduleData.splice(3);
    }

    return parsedScheduleData;
}

/**
 * Get the qty of members for a show on MAL
 * @returns {Promise<number>}
 */
async function getShowMembers(show) {

    //Get members for the current show
    let members = got.get(`https://myanimelist.net/anime/${show.mal_id}/`)
        .then(function(res) {

            //if the length of the body is 0 return null
            if(res.body.length === 0){
                return null;
            }

            //get a dom searchable document
            const root = HTMLParser.parse(res.body);

            //return the result of our query selection
            return parseInt(root.querySelector(`.members`).text.split("Members ")[1].split(",").join(""));
        })
        .catch(error => console.error(error));

    return await members;
}
/**
 * Parse through schedule data and retrieve the title and cover for each show in the schedule
 * @returns {Promise<null|[]>}
 */
async function parseScheduleData(){

    //get schedule data for shows currently airing
    const scheduleData = await getScheduleData();

    //get todays name
    const today = getDay();

    //if schedule data is null, return
    if(scheduleData == null){
        return null;
    }

    //If the schedule data has no length or a length of 0 throw an error
    if(scheduleData.length === 0){
        throw "Got no data from schedule data request.";
    }

    //get todays shows
    const todaysShows = scheduleData[today];

    //get the data we want for all of the shows and return it
    return await Promise.all(todaysShows.map(async (show) => {

        return {
            title: show.title,
            image_url: show.image_url,
            mal_id: show.mal_id,
            members: await getShowMembers(show)
        };
    }));
}

/**
 * Get the anime schedule as json data
 * @returns {Promise<*>}
 */
async function getScheduleData() {
    return await got.get(`https://api.jikan.moe/v3/schedule/${getDay()}`)
        .then(res => JSON.parse(res.body));
}

/**
 * Get the current day of the week as a string
 * @returns {string|null}
 */
function getDay() {
    //get the current days index
    let dayIndex = new Date().getDay();

    //Switch statement that returns the day
    switch (dayIndex){
        case 0: return 'sunday';
        case 1: return 'monday';
        case 2: return 'tuesday';
        case 3: return 'wednesday';
        case 4: return 'thursday';
        case 5: return 'friday';
        case 6: return 'saturday';
        default: return null;
    }
}

module.exports.getSchedule = getSchedule;