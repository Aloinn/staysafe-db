var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var config = require('../config');
const Crypto = require('crypto')
const jwt = require('jsonwebtoken');
var unirest = require("unirest");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));
var User = require('./User')

function validatePhone(phone) {
    var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return re.test(String(phone));
}

// CREATE NEW USER
router.post('/register', (req, res)=>{
  if(req.body.csrf_key != config.csrf_key){return res.status(400).send('Invalid CSRF!')}
  let salt = Crypto.randomBytes(16).toString('base64')
  let hash = Crypto.createHmac('sha512',salt).update(req.body.password).digest("base64");
  let password = salt + "$" + hash;
  req.body.password = password;

  if(!validatePhone(req.body.phone))
  {return res.status(400).send("Invalid phone number!")}

  User.create({
    phone     : req.body.phone,
    password  : req.body.password,
  },(err, user)=>{
    if(err){return res.status(500).send("The cellphone has already been taken!")}
    res.status(200).send(user);
  });
});
/*
router.post('/test',(req, res)=>{
  var req = unirest("POST", "https://d7sms.p.rapidapi.com/secure/send");

  req.headers({
  	"x-rapidapi-host": "d7sms.p.rapidapi.com",
  	"x-rapidapi-key": "0aa0a63842msh11ce74f04b3ed91p1b24c0jsncf449daf9ced",
  	"authorization": "Basic YWxhaTc4MjE6d3B2cm45Y3Q=",
  	"content-type": "application/json",
  	"accept": "application/json"
  });

  req.type("json");
  req.send({
  	"to": 16475441929,
  	"from": "SMSInfo",
  	"content": "Hello"
  });

  req.end(function (res) {
  	if (res.error){console.log(res.error)};

  	console.log(res.body);
  });
})*/

// LOGIN
router.post('/login', (req, res)=>{
  console.log(req.body.phone)
  User.findOne({ 'phone' : req.body.phone}, (err, user)=>{
    if(req.body.csrf_key != config.csrf_key){return res.status(400).send('Invalid CSRF!')}
    if(err){return res.status(500).send('Server error')}
    if(!user){return res.status(404).send('No users exist with credentials')}


    // Getting old password
    let passwordFields = user.password.split('$');
    let salt = passwordFields[0];
    let old_hash = passwordFields[1];

    let new_hash = Crypto.createHmac('sha512',salt).update(req.body.password).digest("base64");

    /// CHECKING PASSWORDS
    if(new_hash===old_hash){

      // USER AUTHENTICATED!
      var token = jwt.sign({data: user._id}, config.secret, { expiresIn: '1h'})
      req.body.auth = true;
      req.body.token = token;
      res.status(200).send(req.body.token)
    } else {
      // USER NOT AUTHENTICATED
      return res.status(401).send('Invalid password!')
    }
  })
})

module.exports = router;
