// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
const res = require('express/lib/response');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});


// get route parameter input from client
// request to /api/:date?
app.get('/api/:date', (req, res, next) => {
  date = req.params.date;
  next();
}, (req, res) => {
  if ( !Number(date) ){
    let showDate = new Date(date);
    console.log(showDate);
    if (showDate == 'Invalid Date'){
      res.json({ error : "Invalid Date" });
    } else {
      res.json({
        "unix": showDate.getTime(),
        "utc": showDate.toUTCString()
      })
    }    
  } else {
    let showDate = new Date(Number(date));
    res.json({
      "unix": showDate.getTime(),
      "utc": showDate.toUTCString()
    })
}})

// empty date parameter
app.get('/api', (req, res) => {
  let showDate = new Date();
  res.json({
    "unix": showDate.getTime(),
    "utc": showDate.toUTCString()
  })
})