const got = require('got');

/**
 * Get anime data for the given query
 * @param query the query to get data for
 * @returns {Promise<*>} Data about the show as JSON
 */
async function getAnimeData(query, type = "anime"){

    //create a promise to resolve for our requests
    return new Promise( (async (resolve) => {
        try {
            let animeData = await got.get(`https://api.jikan.moe/v3/search/${type}?q=${query}&page=1`)
                .then(res => JSON.parse(res.body))
                .catch(error => console.error(`Problem processing search request for query ${query}\n${error}`));

            //if the data is null
            if(animeData === null) {
                throw `[AnimeSearch.js] Anime data for query ${query} came back null!`;
            }

            //if the data is empty
            if(animeData.length === 0){
                throw `[AnimeSearch.js] Anime data for query ${query} came back empty! (length of 0)`
            }

            //if results is null
            if(animeData['results'] == null){
                throw `[AnimeSearch.js] Results came back null for query ${query}`
            }

            //if results are empty
            if(animeData['results'].length == 0){
                throw `[AnimeSearch.js] Results came back empty! ${query}`;
            }

            return resolve(animeData['results'][0]);
        }
        catch (error){
            console.error(`[AnimeSearch.js] Error occurred when getting anime data for query ${query}\n${error}`);

            //resolve to an error
            resolve({error: error});
        }
    }));
}

module.exports.getAnimeData = getAnimeData;