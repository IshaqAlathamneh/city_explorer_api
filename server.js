'use strict';
const PORT = 3000; // convert this to an envirment variable 

// my application dependencies
const express = require('express'); // node.js framework.
const cors = require('cors'); // cross origin resources sharing

const app = express(); //initalize express app

app.use(cors()); // use cors



app.get('/location', locationCity);
app.get('/weather', weather);
function Map(search_query,display_name, lat, lon)  {
    this.search_query = search_query;
    this.formatted_query = display_name;
    this.latitude = lat;
    this.longitude = lon;
}
function locationCity(request, response) {
    const getLocation = require('./data/location.json');
    let city = request.query.city;
    console.log("city---->", city);
    let newLocation = new Map(city, getLocation[0].display_name, getLocation[0].lat, getLocation[0].lon);
    console.log('----->',newLocation);
    response.send(newLocation);
}
let weatherArr = [];
function Weathers(forecast, time){
    this.forecast = forecast;
    this.time = time;
    weatherArr.push(this);
}
function weather(request, response) {
    if(weatherArr){
        weatherArr = [];
    }
    const getData = require('./data/weather.json');
    let dataArr = getData.data;
    dataArr.forEach(element => {
        let time = element.valid_date;
        let dis = element.weather.description;
        let newDay = new Weathers(dis, time);
        
    });
    response.send(weatherArr);
}
app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });