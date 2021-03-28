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
    
}