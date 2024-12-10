require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// body parser
let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// install & setup mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://porapanw:03UfnfZlpPp6pXBW@cluster0.mzx7v.mongodb.net/?retryWrites=true&w=majority', {
  dbName: 'test',
  serverSelectionTimeoutMS: 30000
 }).then(() => {
  console.log('database connected.')
 }).catch((err) => console.log(err.message));

 // create schema
const shortenSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
});
let Shorten = mongoose.model("Shorten", shortenSchema);
// function for generating short url and save the url
const shortenAndSave = async (url, shortUrl, done) => {
  try {
    const urlData = new Shorten({
      "original_url": url,
      "short_url": shortUrl
    });
    const data = await urlData.save();
    done(null,data);
  } catch (err) {
    console.error(err);
  }
}
// function for searching short url
const findUrl = async (number) => {
  try {
    const urlFound = await Shorten.find({ "short_url": number });
    return urlFound;
  } catch(err) {
    console.error(err);
  }  
}
const findOriginalUrl = async (url) => {
  try {
    const urlFound = await Shorten.find({ "original_url": url });
    return urlFound;
  } catch(err) {
    console.error(err);
  }  
}
// function for checking valid url
const isValidUrl = (url) => {
  const regex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  return regex.test(url);
}

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

// get parameter input from the client
app.route('/api/shorturl')
  .post(async (req, res) => {
    const url = req.body.url;
    try {
      if (url==="" || !isValidUrl(url)) {
        res.json({error: 'invalid url'});
      } else {
        // check if the url already exists
        const data = await findOriginalUrl(url);
        if (data.length === 0) {
          // if doesn't exist 
          // generate short url
          var shortUrl = Math.floor(Math.random()*1000);
          // save in the database
          shortenAndSave(url,shortUrl,(err,data) => {
            if (err) return console.error(err)
            else return console.log(data);
          });
          res.json({
            "original_url": url,
            "short_url": shortUrl
          })
        } else {
          res.json({
            "original_url": data[0].original_url,
            "short_url": data[0].short_url
          })
        }  
      }  
    } catch(err) {
      console.error(err);
    }
  });

// endpoint for /api/shortcut/number
app.get('/api/shorturl/:number', async (req, res) => {
  const number = req.params.number;
  try {
    const data = await findUrl(number);
    if (data.length === 0) {
      res.json({"error":"No short URL found for the given input"})
    } else {
      res.redirect(data[0].original_url)
    }
  } catch (err) {
    console.error(err);
  }  
});