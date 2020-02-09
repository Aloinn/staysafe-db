var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var config = require('../config');
const Crypto = require('crypto')
const jwt = require('jsonwebtoken');

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
