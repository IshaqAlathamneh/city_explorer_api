'use strict';
// My depend..
const express = require('express');
const cors = require('cors');
const PORT = 3000;
const app = express();
app.use(cors());

app.listen(PORT, ()=> console.log(`This app is working an port ${PORT}`));
app.get('/location', location);
app.get('/weather', weather);
function location(request, response) {
    const getLocation = require('./data/location.json');
    let city = request.query.city;
    console.log("city---->", city);
    let obj = {
        search_query: getLocation[0].display_name,
        formatted_query: getLocation[0].display_name,
        latitude : getLocation[0].lat,
        longitude : getLocation[0].lon
    }
    response.send(obj);
}
function weather() {

}