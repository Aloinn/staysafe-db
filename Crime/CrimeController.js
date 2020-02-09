var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));
var Crime = require('./Crime')

router.post('/', (req, res)=>{
  jwt.verify(req.body.token, secretOrPublicKey, [options, callback])
  (async () =>{
    try{
      Crime.create({
        latitude   : req.body.latitude,
        longitude  : req.body.longitude,
        crime      : req.body.crime,
        date        : new Date(),
      },
      function(err, crime){
        if(err){return res.status(500).send("There was a problem with request!")}
        res.status(200).send(crime);
      });
    } catch(err){console.log(err)}
  })()
})

router.get('/', (req, res)=>{
  Crime.find({}, function(err, users){
    if(err){return res.status(500).send("There was a problem finding the crimes!")}
    res.status(200).send(users);
  })
})

module.exports = router;
