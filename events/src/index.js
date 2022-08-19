'use strict';
const express = require('express');
const uuid = require('uuid');
const { connectDB,db } = require('./db');
const { Response , alertProducer, logProducer} = require('./helpers');

const app = express();

// parse req body as json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// connect to aws keyspaces 
connectDB()

// connect to kafka producers 
async function connectProducers() {
    await alertProducer.connect();
    await logProducer.connect();
    console.log("producer_connected");
}
connectProducers();

// routes for events

// get all events 
app.get('/events', async (req, res) => {
    try {
        const user = JSON.parse(req.headers.user)
        const query = 'select * from aicte.events'
        const data = (await db.execute(query,[])).rows 

        // send alert to kafka
        const msg = {
            email:"divyanshukaushik44@gmail.com",
            subject:"Test email from aicte backend",
            text:`events fetched by ${user.name}`
        }
        // await alertProducer.send({
        //     topic: "alert",
        //     messages: [{value:JSON.stringify(msg)}],
        // })
        // await alertProducer.send({
        //     topic: "mass_mail",
        //     messages: [{value:JSON.stringify(msg)}],
        // })
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
    const user = JSON.parse(req.headers.user)
    const log = {
        type:"event_register",
        message:"",
        user_id:user.id,
        user_name:user.name
    }
    try {
        const { name,description,caption,status,from_date,to_date,time,image,organiser } = req.body
        if (!(name && description && caption && status && from_date && to_date && time && image && organiser)) {
            return res.status(400).json(Response(400, 'Bad Request', 'Please fill all the fields'))
        }
        const id = uuid.v4()
        const timestamp = new Date().toISOString()
        const query = 'insert into aicte.events (id,name,description,caption,status,from_date,to_date,time,image,organiser,createdat,updatedat) values (?,?,?,?,?,?,?,?,?,?,?,?)'
        await db.execute(query,[id,name,description,caption,status,from_date,to_date,time,image,organiser,timestamp,timestamp])
        log.message = `created event ${name} with id ${id}`
        res.status(200).json(Response(200, 'Success', { id, name, description, caption, status, from_date, to_date, time, image,organiser, createdat: timestamp, updatedat: timestamp }))
    }
    catch (error) {
        log.message = "error in registering event"
        res.status(500).json(Response(500, 'Error', error))
    }
    // log to db using kafka producer
    await logProducer.send({
        topic: "log",
        messages: [{value:JSON.stringify(log)}],
    })
    return;
});

// update venue details
app.put('/events/:id', async (req, res) => {
    const user = JSON.parse(req.headers.user)
    const log = {
        type:"event_update",
        message:"",
        user_id:user.id,
        user_name:user.name
    }
    try {
        const { name,description,caption,status,from_date,to_date,time,image,organiser } = req.body
        if (!(name && description && caption && status && from_date && to_date && time && image && organiser)){
            return res.status(400).json(Response(400, 'Bad Request', 'Please fill all the fields'))
        }
        const timestamp = new Date().toISOString()
        const update_event = `update aicte.events set name = ?,description = ?,caption = ?,status = ?,from_date = ?,to_date = ?,time = ?,image = ?,organiser = ?,updatedat = ? where id = ?`
        await db.execute(update_event,[name,description,caption,status,from_date,to_date,time,image,organiser,timestamp,req.params.id])
        log.message = `updated event ${name} with id ${req.params.id}`
        res.json(Response(200, 'Success', "Event updated successfully"))
    }
    catch (error) {
        log.message = "error in updating event with id "+req.params.id
        res.status(500).json(Response(500, 'Error', error))
    }
    // log to db using kafka producer
    await logProducer.send({
        topic: "log",
        messages: [{value:JSON.stringify(log)}],
    })
    return;
});

// delete venue
app.delete('/events/:id', async (req, res) => {
    const user = JSON.parse(req.headers.user)
    const log = {
        type:"event_delete",
        message:"deleted event with id "+req.params.id,
        user_id:user.id,
        user_name:user.name
    }
    try {
        const delete_venue = `delete from aicte.events where id = ?`
        await db.execute(delete_venue,[req.params.id])
        log.type = "delete"
        res.json(Response(200, 'Success', "Event deleted successfully"))
    }
    catch (error) {
        log.message = "error in deleting event with id "+req.params.id
        res.status(500).json(Response(500, 'Error', error))
    }
    // log to db using kafka producer
    await logProducer.send({
        topic: "log",
        messages: [{value:JSON.stringify(log)}],
    })
    return;
})

// invite user to event 
app.post('/events/:id/invite', async (req, res) => {
    const user = JSON.parse(req.headers.user)
    const log = {
        type:"event_invite",
        message:"",
        user_id:user.id,
        user_name:user.name
    }
    try{
        const event_id = req.params.id
        const users = req.body.users
        if (!users) {
            return res.status(400).json(Response(400, 'Bad Request', 'Please fill all the fields'))
        }
        const query = 'insert into aicte.invites (id,event_id,user_id,name,email,phone,createdat,updatedat) values (?,?,?,?,?,?,?,?)'
        await users.forEach(async (user)=>{
            const timestamp = new Date().toISOString()
            const invite_id = uuid.v4()
            // find user 
            const find_user = `select * from aicte.invites where user_id = ? and event_id = ? allow filtering`
            const user_data = (await db.execute(find_user,[user.id,event_id])).rows
            // console.log(user);
            if (user_data.length > 0) return;
            await db.execute(query,[invite_id,event_id,user.id,user.name,user.email,user.phone,timestamp,timestamp])
        })
        
        log.message = `invited users to event with id ${event_id}`
        res.json(Response(200, 'Success', "Invites sent successfully"))
    }catch(err){
        log.message = "error in inviting users to event with id "+req.params.id
        res.status(500).json(Response(500, 'Error', err))
    }
    // log to db using kafka producer
    await logProducer.send({
        topic: "log",
        messages: [{value:JSON.stringify(log)}],
    })
    return;
})

// get invited users for event 
app.get('/events/:id/invites', async (req, res) => {
    try {
        const query = 'select * from aicte.invites where event_id = ? allow filtering'
        const data = (await db.execute(query,[req.params.id])).rows
        return res.status(200).json(Response(200, 'Success', data))
    } catch (error) {
        return res.status(500).json(Response(500, 'Error', error))
    }
})

// get events for users who are invited to event
app.get('/events/invited/:user_id', async (req, res) => {
    try {
        const query = 'select * from aicte.invites where user_id = ? allow filtering'
        const data = (await db.execute(query,[req.params.user_id])).rows
        // find events from id's of events
        const find_events = 'select * from aicte.events where id = ?'
        const events = await Promise.all(data.map(async ({event_id})=>{
            const event = (await db.execute(find_events,[event_id])).rows[0]
            return event
        }))
        return res.status(200).json(Response(200, 'Success', events))
    } catch (error) {
        return res.status(500).json(Response(500, 'Error', error))
    }
})

app.listen(process.env.PORT);

console.log(`Events Server Up!!`);