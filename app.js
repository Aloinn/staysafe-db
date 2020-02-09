// app.js
var express = require('express');
var db = require('./db');
var app = express();
var cors = require("cors");

app.use(express.static('public'));
app.use(cors());

app.set('view engine', 'ejs');

var CrimeController = require('./Crime/CrimeController');
var UserController = require('./User/UserController');
app.use('/crimes', CrimeController);
app.use('/users', UserController);

// TEST AREA
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.post('/test', (req, res)=>{
  console.log(req.body)
  res.status(200).send('cool!');
})
app.get('/test', (req,res)=>{
  console.log('test');
  res.status(200).send('nice!');
})
// END TEST AREA

module.exports = app;
