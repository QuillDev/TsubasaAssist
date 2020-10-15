//Get express and path for serving Pages etc.
const express = require('express');
const morgan = require('morgan');
const path = require('path');

//config dotenv
require('dotenv').config();

//Setup express app
const app = express();

//setup logging using morgan
app.use(morgan(`tiny`));

//Anime module
const anime = require('./Modules/Anime/anime');

//use the public dir for css etc.
app.use(express.static(__dirname + '/public'));

//Get the default route
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + "/Pages/index.htm"));
});

//Lol API Routes

//Anime Routes
app.get('/api/anime/seasonal', (req, res) =>{
    anime.getSchedule()
        .then(response => res.json(response))
        .catch(err => console.error(`Error when running anime schedule module \n${err}`));
});

//Search anime show
app.get('/api/anime/searchShow', (req, res) =>{
    anime.getAnimeData(req.query.q, "anime")
        .then(response => res.json(response))
        .catch(err => console.error(`Error when running searchShow module \n${err}`));
});

//Search anime character
app.get('/api/anime/searchCharacter', (req, res) =>{
    anime.getAnimeData(req.query.q, "character")
        .then(response => res.json(response))
        .catch(err => console.error(`Error when running anime searchCharacter module \n${err}`));
});


//Start app listening
let port = process.env.PORT || 3000;
/**
 * Start listening on the specified port
 */
app.listen(port, () => {
    console.log(`Started Listening on port ${port}`);
})