'use strict';
require('dotenv').config();
const PORT = process.env.PORT; // convert this to an envirment variable 

// my application dependencies
const express = require('express'); // node.js framework.
const superagent = require('superagent');
const cors = require('cors'); // cross origin resources sharing
const app = express(); //initalize express app

app.use(cors()); // use cors




app.get('/location', locationCity);
app.get('/weather', weather);
app.get('/parks', park);
app.use('*', notFoundHandler); // 404 not found url
 
app.use(errorHandler);

function notFoundHandler(request, response) {
  response.status(404).send('requested API is Not Found!');
}

function errorHandler(err, request, response, next) {
  response.status(500).send('Sorry, something went wrong');
}
function Map(search_query, gotData)  {
    this.search_query = search_query;
    this.formatted_query = gotData.display_name;
    this.latitude = gotData.lat;
    this.longitude = gotData.lon;
}
let arrLocation = {};
let lat = '';
let lon = '';
function locationCity(request, response) {
    let city = request.query.city;
    if (arrLocation[city]){
        response.send(arrLocation[city]);
    }else {
    let key = process.env.geocode;
    let url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`
    superagent.get(url).then( res => {
        let arrData = res.body[0];
        let newLocation = new Map(city, arrData);
        lat = arrData.lat;
        lon = arrData.lon;

        response.send(newLocation);
    }).catch((err)=> {
        response.send('Maintenance... We will come back soon');
      });}
}
let weatherArr = [];
function Weathers(forecast, time){
    this.forecast = forecast;
    this.time = time;
    weatherArr.push(this);
}
function weather(request, response) {
    let city = request.query.city;
    let key = process.env.cold;
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${lon}&key=${key}`;
    superagent.get(url).then(res => {

        let dataObj = res.body;
        console.log(dataObj)
        dataObj.data.map(element => {
            let time = element.valid_date;
            let dis = element.weather.description;
            let newDay = new Weathers(dis, time);
            
        });
        response.send(weatherArr);
    })
}
let parkArr = [];
function Parking(a,b,c,d,e){
    this.name = a;
    this.address = b;
    this.fee = c;
    this.description = d;
    this.url = e;
    parkArr.push(this);
}
function park(request, response) {
    let key = process.env.parking;
    let url = `https://developer.nps.gov/api/v1/parks?api_key=${key}`;
    superagent.get(url).then(res => {
        let info = res.body.data;
        info.forEach(element => {
            let newUrl = element.url;
            let fullName = element.fullName;
            let newDes = element.description;
            let Fee = element.entranceFees.cost;
            let newFee = '0.00';
            let newAddress = element.addresses[0].line1 + ' ' + element.addresses[0].city + ' ' + element.addresses[0].stateCode + ' ' + element.addresses[0].postalCode;
            let newPark = new Parking(fullName, newAddress, newFee, newDes, newUrl);

        });
        response.send(parkArr);
    })
    
}
app.listen(PORT, () => console.log(`App is listening on ${PORT}`));