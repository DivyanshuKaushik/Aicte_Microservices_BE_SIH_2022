'use strict';
const express = require('express');
const uuid = require('uuid');
const { connectDB,db } = require('./db');
const { Response } = require('./helpers');

// connect to aws keyspaces 
connectDB()

const app = express();

// parse req body as json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes for auth

// get all users 
app.get('/users', async(req, res) => {
    const query = 'select * from aicte.users'
    const cassandra = (await db.execute(query,[])).rows 
    res.json(Response(200, 'Success', cassandra))
});

// register new user 
app.post('/users', async(req, res) => {
    const { name, email, password,phone,role,department } = req.body
    const id = uuid.v4()
    const timestamp = new Date()
    const save_user = `insert into aicte.users (id,name,email,phone,role,password,department,createdAt,updatedAt) values (?,?,?,?,?,?,?,?,?)`
    await db.execute(save_user,[id,name, email, password,phone,role,department,timestamp,timestamp])
    res.json(Response(200, 'Success', { id, name, email, password,phone,role,department,createdAt:timestamp,updatedAt:timestamp }))
});

app.listen(process.env.PORT);

console.log(`Auth Server Up!!`);