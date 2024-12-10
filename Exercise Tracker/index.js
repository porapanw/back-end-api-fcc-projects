require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(express.json());

// root route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// MongoDB setup and connection
mongoose
  .connect('mongodb+srv://porapanw:03UfnfZlpPp6pXBW@cluster0.mzx7v.mongodb.net/?retryWrites=true&w=majority', 
    {
      dbName: 'test',
      serverSelectionTimeoutMS: 30000
    }
  )
  .then(() => { console.log('database connected.') })
  .catch((err) => console.log(err.message));
// schema and model
const userSchema = new mongoose.Schema({
  "username": String
});
const exerciseSchema = new mongoose.Schema({
  "username": String,
  "description": String,
  "duration": Number,
  "date": String
});
const Users = mongoose.model('Users', userSchema);
const Exercises = mongoose.model('Exercises', exerciseSchema);

// utility functions
// add new user
const addNewUser = async (username) => {
  try {
    const newUser = new Users({"username": username});
    return await newUser.save();
  } catch(err) { console.error(err); }
}
// add new exercises
const addNewExercise = async (user,desc,dur,date) => {
  try {
    const newExercise = new Exercises({
      "username": user,
      "description": desc,
      "duration": dur,
      "date": date,
    });
    return await newExercise.save();
  } catch(err) { console.error(err); }
}
// search from username
const searchUser = async (username) => {
  try {
    return await Users.find({"username": username});
  } catch(err) { console.error(err); }
}
// search from id
const searchId = async (id) => {
  try {
    return await Users.find({"_id": id});
  } catch(err) { console.error(err); }
}
// search exercise from username

// API endpoint
// POST /api/users
app.route('/api/users')
  .post(async (req, res) => {
  const username = req.body.username;
  try {
    // check if username already existed
    const checkUser = await searchUser(username);
    if ( checkUser.length === 0) {
      // add new user
      await addNewUser(username);
    } 
    const user = await searchUser(username);
    // console.log(user);
    // console.log(user[0].username);
    res.json({
      "username": user[0].username,
      "_id": user[0]._id 
    })
  } catch(err) { console.error(err); }  
})
  .get(async (req, res) => {
    const users = await Users.find();
    res.json(users);
  })
;

app.route('/api/users/:_id/exercises')
  .post(async (req, res) => {
    const id = req.params._id;  // Get ID from the URL parameter
    console.log("Received ID:", id);  // Log the received ID

    const description = req.body.description;
    const duration = parseInt(req.body.duration);
    let date = req.body.date;

    if (!date) {
      date = new Date();
    } else {
      date = new Date(date);
    }
    const DateString = date.toDateString();
    
    try {
      const user = await searchId(id);
      // console.log("Found user:", user);  // Log the user found by ID
      
      if (!user || user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const newExercise = await addNewExercise(user[0].username, description, duration, DateString);
      
      return res.json({
        username: user[0].username,
        description: newExercise.description,
        duration: Number(newExercise.duration),
        date: newExercise.date,
        _id: id
      });
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });


// // POST /api/users/:_id/exercises
// app.route('/api/users/:_id/exercises')
//   .post(async (req, res) => {
//   const id = req.params._id;
//   const idForm = req.body[":_id"];
//   const description = req.body.description;
//   const duration = parseInt(req.body.duration);
//   var date = req.body.date;
//   if ( !date ) {
//     date = new Date()
//   } else {
//     date = new Date(date);
//   }
//   const DateString = date.toDateString();
//   // use req.body.id as req.body.params
//   // req.params._id = id;
//   // find user
//   console.log(id);
//   const user = await searchId(id);
//   console.log(user);
//   // if user can't be found
//   if (!user) {
//     return res.status(404).json({ error: 'User not found' });
//   }
//   // add new exercises
//   const newExercise = await addNewExercise(user[0].username,description,duration,DateString,id);
//   res.json({
//     username: user[0].username,
//     description: newExercise.description,
//     duration: Number(newExercise.duration),
//     date: newExercise.DateString,
//     _id: id
//   })
// });

// GET /api/users/:_id/logs
app.get('/api/users/:_id/logs', async (req, res) => {
  const id = req.params._id;
  const { from, to, limit } = req.query;
  try {
    const user = await Users.find({"_id": id});
    const exercises = await Exercises.find({ "username": user[0].username} )
    // console.log(exercises);

    var log = await Exercises.find({ "username": user[0].username })
        .select('description duration date -_id');
    
    var filteredLog = log;
    var limitLog;

    if ( from || to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      filteredLog = log.filter(data => {
        const dataDate = new Date(data.date);
        return dataDate >= fromDate && dataDate <= toDate;
      })    
    }

    if (limit) {
      limitLog = filteredLog.slice(0, parseInt(limit));
    }

    res.json({
      "username": user[0].username,
      "count": exercises.length,
      "_id": id,
      "log": (limit) ? limitLog : log
    })

  } catch(err) { console.error(err); }
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
