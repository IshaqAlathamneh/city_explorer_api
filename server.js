'use strict';
require('dotenv').config();
const PORT = process.env.PORT; // convert this to an envirment variable 

// my application dependencies
const express = require('express'); // node.js framework.
const superagent = require('superagent');
const cors = require('cors'); // cross origin resources sharing
const pg = require('pg');
const app = express(); //initalize express app

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.log("PG PROBLEM!!!") );
app.use(cors()); // use cors



app.get('/', homePage);
app.get('/location', forDataBase);
app.get('/weather', weather);
app.get('/parks', park);
app.get('/movies', movies);
app.get('/yelp', yelp);

app.use('*', notFoundHandler); // 404 not found url
 
app.use(errorHandler);

function notFoundHandler(request, response) {
  response.status(404).send('requested API is Not Found!');
}

function errorHandler(err, request, response, next) {
  response.status(500).send('Sorry, something went wrong');
}
function homePage (request, response) {
    response.send('Hello Guys')
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
// let SQL = '';

let condition = false;
function forDataBase(request, response) {
    condition = false;
    let city = request.query.city;
    console.log(city)
    let SQL = `SELECT * FROM location WHERE search_query = $1`;
    let values = [city]
    client.query(SQL, values).then(result=> {
        // console.log(result.rows);
        // response.send(result.rows);
        if (result.rowCount){
            console.log('heloooo', result)
            response.send(result.rows[0])
            lat = result.rows[0].latitude;
            lon = result.rows[0].longitude;
        }else {
            console.log('in location function')
            // let city = request.query.city;
            let key = process.env.GEOCODE_API_KEY;
            let url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`
            console.log(url);
            superagent.get(url).then( res => {
                let arrData = res.body[0];
                let newLocation = new Map(city, arrData);
                lat = arrData.lat;
                lon = arrData.lon;
                let SQL = 'INSERT INTO location (search_query, formatted_query, latitude, longitude) VALUES($1, $2, $3, $4) RETURNING *';
                let values = [city, newLocation.formatted_query, lat, lon];
                client.query(SQL, values).then(()=>{

                    response.send(newLocation);
                }).catch(err=>{
                    console.log('query Eroor', err)
                })
        }).catch( error => {
            console.log('ERROR', error);
            response.status(500).send('So sorry, something went wrong.');
          });
       
    }}).catch(err=>{
        console.log('sec err', err)
    })
        
    
}

// function locationCity(request, response) {
   
      
//     }

let weatherArr = [];
function Weathers(forecast, time){
    this.forecast = forecast;
    this.time = time;
    weatherArr.push(this);
}
function weather(request, response) {
    weatherArr = [];
    let city = request.query.city;
    let key = process.env.WEATHER_API_KEY;
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${lon}&key=${key}`;
    superagent.get(url).then(res => {

        let dataObj = res.body;
        // console.log(dataObj)
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
    parkArr = [];
    let key = process.env.PARKS_API_KEY;
    let url = `https://developer.nps.gov/api/v1/parks?api_key=${key}&limit=10`;
    superagent.get(url).then(res => {
        let info = res.body.data;
        info.forEach(element => {
            let newUrl = element.url;
            let fullName = element.fullName;
            let newDes = element.description;
            let Fee = element.entranceFees[0].cost;
            let newFee = Fee;
            let newAddress = element.addresses[0].line1 + ' ' + element.addresses[0].city + ' ' + element.addresses[0].stateCode + ' ' + element.addresses[0].postalCode;
            let newPark = new Parking(fullName, newAddress, newFee, newDes, newUrl);

        });
        response.send(parkArr);
    })
    
}
let movieArr = [];
function Movie(t,o,avgv,tv,p,r,i){
    this.title = t;
    this.overview = o;
    this.average_votes = avgv;
    this.total_votes = tv;
    this.popularity = p;
    this.released_on = r;
    this.image_url = i;
    movieArr.push(this);
}
function movies(request, response){
    movieArr = [];
    let movie_key = process.env.MOVIE_API_KEY;
    let url = `http://api.themoviedb.org/3/movie/top_rated?api_key=${movie_key}&query=${request.query.city}`
    superagent.get(url).then(res => {
        let movieData = res.body.results;
        movieData.forEach(element => {   
        let a = element.title;
        let b = element.overview;
        let c = element.vote_average;
        let d = element.vote_count;
        let e = element.popularity;
        let f = element.release_date;
        let g = 'https://image.tmdb.org/t/p/w500/' + element.poster_path;
        let newMovie = new Movie(a,b,c,d,e,f,g);
    });
        
        response.send(movieArr)
    })

}
let yelpArr = [];
function Yelp(n,img,p,r,u){
    this.name = n;
    this.image_url = img;
    this.price = p;
    this.rating = r;
    this.url = u;
    yelpArr.push(this)
}
let startIndex = 0;
function yelp(request, response) {
    
    console.log('booooody',request.query)
    let yelp_key = process.env.YELP_API_KEY;
    let url = `https://api.yelp.com/v3/businesses/search?term=restaurants&location=${request.query.search_query}&limit=25`;
    superagent.get(url)
    .set('Authorization', `Bearer ${yelp_key}`)
    .then(res => {
        let yelpData = res.body.businesses;
        // console.log('yelpData---->',yelpData);
        yelpArr = [];
          yelpData.forEach(element => {
              
              let a = element.name;
              let b = element.image_url;
              let c = element.price;
              let d = element.rating;
              let e = element.url;
              let newYelp = new Yelp(a,b,c,d,e);
            });
            return yelpArr;
        
        }).then((x)=> {
            // console.log(x)
            // console.log('yelp Arr ---------->',yelpArr);
            // const page = request.query.page;
            // const limit = request.query.limit 
            let endIndex = startIndex + 5;
            const resul = yelpArr.slice(startIndex, endIndex);
            startIndex +=5;
            response.send(resul);
        }).catch( error => {
            console.log('ERROR', error);
            response.status(500).send('So sorry, something went wrong.');
          });
        
}
client.connect()
  .then( () => {
    app.listen(PORT, () => {
      console.log("Connected to database:", client.connectionParameters.database) //show what database we connected to
      console.log('Server up on', PORT);
    });
  })
  .catch(err => {
    console.log('ERROR', err);
  });