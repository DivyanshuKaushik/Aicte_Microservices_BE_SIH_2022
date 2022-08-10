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

// routes for events

// get all events 
app.get('/events', async (req, res) => {
    try {
        const query = 'select * from aicte.events'
        const data = (await db.execute(query,[])).rows 
        return res.status(200).json(Response(200, 'Success', data))
    } catch (error) {
        return res.status(500).json(Response(500, 'Error', error))
    }
})

// get venue 
app.get('/events/:id', async (req, res) => {
    try {
        const query = 'select * from aicte.events where id = ?'
        const data = (await db.execute(query,[req.params.id])).rows[0]
        return res.status(200).json(Response(200, 'Success', data))
    } catch (error) {
        return res.status(500).json(Response(500, 'Error', error))
    }
});


// register venue 
app.post('/events',async (req, res) => {
    try {
        const { name,description,caption,status,from_date,to_date,time,image,organiser } = req.body
        if (!(name && description && caption && status && from_date && to_date && time && image && organiser)) {
            return res.status(400).json(Response(400, 'Bad Request', 'Please fill all the fields'))
        }
        const id = uuid.v4()
        const timestamp = new Date().toISOString()
        const query = 'insert into aicte.events (id,name,description,caption,status,from_date,to_date,time,image,organiser,createdat,updatedat) values (?,?,?,?,?,?,?,?,?,?,?,?)'
        await db.execute(query,[id,name,description,caption,status,from_date,to_date,time,image,organiser,timestamp,timestamp])
        return res.status(200).json(Response(200, 'Success', { id, name, description, caption, status, from_date, to_date, time, image,organiser, createdat: timestamp, updatedat: timestamp }))
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(Response(500, 'Error', error))
    }
});

// update venue details
app.put('/events/:id', async (req, res) => {
    try {
        const { name,description,caption,status,from_date,to_date,time,image,organiser } = req.body
        if (!(name && description && caption && status && from_date && to_date && time && image && organiser)){
            return res.status(400).json(Response(400, 'Bad Request', 'Please fill all the fields'))
        }
        const timestamp = new Date().toISOString()
        const update_event = `update aicte.events set name = ?,description = ?,caption = ?,status = ?,from_date = ?,to_date = ?,time = ?,image = ?,organiser = ?,updatedat = ? where id = ?`
        await db.execute(update_event,[name,description,caption,status,from_date,to_date,time,image,organiser,timestamp,req.params.id])
        return res.json(Response(200, 'Success', "Event updated successfully"))
    }
    catch (error) {
        return res.status(500).json(Response(500, 'Error', error))
    }
});

// delete venue
app.delete('/events/:id', async (req, res) => {
    try {
        const delete_venue = `delete from aicte.events where id = ?`
        await db.execute(delete_venue,[req.params.id])
        return res.json(Response(200, 'Success', "Event deleted successfully"))
    }
    catch (error) {
        return res.status(500).json(Response(500, 'Error', error))
    }
})

app.listen(process.env.PORT);

console.log(`Events Server Up!!`);