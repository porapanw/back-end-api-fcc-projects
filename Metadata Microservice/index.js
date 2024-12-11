require('dotenv').config()

var express = require('express');
var cors = require('cors');
// multer npm
const multer = require('multer');
var app = express();
app.use(express.json()); // parser for POST
app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// multer setup
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  const data = req.file;
  res.json({
    "name": data.originalname,
    "type": data.mimetype,
    "size": data.size
  });
})


const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
