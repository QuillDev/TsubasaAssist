//Get express and path for serving Pages etc.
const express = require('express');
const app = express();
const path = require('path');

//config dotenv
require('dotenv').config();

//Anime module
const anime = require('./Modules/Anime/anime');

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


//Start app listening
let port = process.env.PORT || 3000;
/**
 * Start listening on the specified port
 */
app.listen(port, () => {
    console.log(`Started Listening on port ${port}`);
})