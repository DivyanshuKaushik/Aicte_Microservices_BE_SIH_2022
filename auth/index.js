'use strict';

const express = require('express');
const mongoose = require('mongoose');

// Constants
const PORT = 4000;
const HOST = '0.0.0.0';
mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true })
.then(() => {
    console.log('Connected to MongoDB');
    console.log(process.env.MONGO_URI)
}).catch(err => {
    console.log('Error connecting to MongoDB:', err.message);
});

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
});

const User = mongoose.model('User', userSchema);
// // App
const app = express();
app.get('/', async(req, res) => {
//     const users = await User.find()
//   res.json(users);
res.send("hello")
});

app.get('/add', async(req, res) => {
    const user = new User({
        name: 'John',
        email: "hello"})
    await user.save();
  res.json({msg:'user added'});
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);