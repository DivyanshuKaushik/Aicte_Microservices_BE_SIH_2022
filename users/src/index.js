'use strict';
const express = require('express');
const uuid = require('uuid');
const bcrypt = require('bcryptjs')
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
    const data = (await db.execute(query,[])).rows 
    res.status(200).json(Response(200, 'Success', data))
});

// get user 
app.get('/users/:id', async(req, res) => {
    const query = 'select * from aicte.users where id = ?'
    const data = (await db.execute(query,[req.params.id])).rows[0]
    res.status(200).json(Response(200, 'Success', data))
});

// register new user 
app.post('/users', async(req, res) => {
    try{
        let { name, email, password,phone,role,department } = req.body
        if (!(name &&  email &&  password && phone && role && department)){
            return res.status(400).json(Response(400, 'Bad Request', 'Please fill all the fields'))
        }
        const findUser = "select * from aicte.users where email = ? allow filtering"
        const existing_user = await db.execute(findUser,[email])
        if (existing_user.rows.length){
            return res.status(400).json(Response(400, 'Bad Request', 'User already exists'))
        }
        const id = uuid.v4()
        password = await bcrypt.hash(password,12)
        const timestamp = new Date()
        const save_user = `insert into aicte.users (id,name,email,phone,role,password,department,createdAt,updatedAt) values (?,?,?,?,?,?,?,?,?)`
        await db.execute(save_user,[id,name, email,phone,role,password,department,timestamp,timestamp])
        res.json(Response(200, 'Success', { id, name, email, password,phone,role,department,createdAt:timestamp,updatedAt:timestamp }))

    }catch(err){
        res.status(500).json(Response(500, 'Error', err))
    }
});

// update user details 
app.put('/users/:id', async(req, res) => {
    try{
        let { name, email,phone,role,department } = req.body
        if (!(name &&  email  && phone && role && department)){
            return res.status(400).json(Response(400, 'Bad Request', 'Please fill all the fields'))
        }
        const id = req.params.id
        const timestamp = new Date()
        const update_user = `update aicte.users set name = ?, email = ?, phone = ?, role = ?, department = ?, updatedAt = ? where id = ?`
        await db.execute(update_user,[name, email,phone,role,department,timestamp,id])
        res.json(Response(200, 'Success', "User updated successfully"))
    }   
    catch(err){
        res.status(500).json(Response(500, 'Error', err))
    }
});

// update user password 
app.patch('/users/:id/password', async(req, res) => {
    try{
        let { password } = req.body
        if (!password){
            return res.status(400).json(Response(400, 'Bad Request', 'Please fill all the fields'))
        }
        const id = req.params.id
        const timestamp = new Date()
        const update_user = `update aicte.users set password = ?, updatedAt = ? where id = ?`
        password = await bcrypt.hash(password,12)
        await db.execute(update_user,[password,timestamp,id])
        res.json(Response(200, 'Success', "Password updated successfully"))
    }
    catch(err){
        res.status(500).json(Response(500, 'Error', err))
    }
});

// delete user 
app.delete('/users/:id', async(req, res) => {
    try{
        const query = 'delete from aicte.users where id = ?'
        await db.execute(query,[req.params.id])
        res.status(200).json(Response(200, 'Success', 'User deleted successfully'))
    }catch(err){
        res.status(500).json(Response(500, 'Error', err))
    }
});

app.listen(process.env.PORT);

console.log(`Users Server Up!!`);