'use strict';

const express = require('express');
const mongoose = require('mongoose');
const cassandra = require('cassandra-driver');
const uuid = require('uuid');
const fs = require('fs');
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

const aws_user = "Divyanshu-at-179683962947";
const aws_pass = "rIB+JBT0gofd1TZFrTLq2Ras0nUBA+QO3yoOvu0iFnE=";
const auth = new cassandra.auth.PlainTextAuthProvider(aws_user, aws_pass);
const sslOptions1 = {
    ca: [fs.readFileSync(__dirname + "/sf-class2-root.crt", "utf-8")],
    host: "cassandra.ap-south-1.amazonaws.com",
    rejectUnauthorized: true,
};
const db = new cassandra.Client({
    contactPoints: ["cassandra.ap-south-1.amazonaws.com"],
    localDataCenter: "ap-south-1",
    authProvider: auth,
    sslOptions: sslOptions1,
    protocolOptions: { port: 9142 },
    queryOptions: { consistency: cassandra.types.consistencies.localQuorum },
});
async function connect(){
    await db.connect();
    console.log('Connected to Cassandra');
    const userQuery = "create table if not exists aicte.users (id UUID PRIMARY KEY,name text,email text,phone text,role text,password text,department text)"
    // await db.execute(userQuery,[]);
}
connect()

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
});


const User = mongoose.model('User', userSchema);
// // App
const app = express();
app.get('/', async(req, res) => {
    const mongo = await User.find()
    const query = 'select * from aicte.users'
    const cassandra = (await db.execute(query,[])).rows 
    // console.log(await db.execute("consistency",[]))
  res.json({mongo,cassandra})
// res.send("hello")
});

app.get('/add', async(req, res) => {
    const user = new User({
        name: 'John',
        email: "hello"})
    // await user.save();
    const save_user = `insert into aicte.users (id,name,email,phone,role,password,department) values (?,?,?,?,?,?,?)`
    await db.execute(save_user,[uuid.v4(),"name","email","phone","role","password","department"])
  res.json({msg:'user added'});
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);