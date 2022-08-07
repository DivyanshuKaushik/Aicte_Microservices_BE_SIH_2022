'use strict';
const express = require('express');
const uuid = require('uuid');
const multer = require('multer');
const { connectDB,db } = require('./db');
const { Response, uploadImage } = require('./helpers');

// connect to aws keyspaces 
connectDB()

const app = express();

// parse req body as json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// multer config 
const storage = multer.memoryStorage();
const fileFilter = (req,file,cb) => {
    if (
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/webp" ||
        file.mimetype === "image/svg" ||
        file.mimetype === "image/png"
    ) {
        cb(null, true);
    } else {
        cb(new Error("Image uploaded is not of type jpg/jpeg or png"), false);
    }
};
const limits = {
    fileSize: 1024*1024*5,
}
const upload = multer({ storage, fileFilter, limits });

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
app.post('/events',upload.single('image'),async (req, res) => {
    try {
        const { name,description,caption,status,from_date,to_date,time } = req.body
        console.log(req.file);
        if (!(name && description && caption && status && from_date && to_date && time && req.file)) {
            return res.status(400).json(Response(400, 'Bad Request', 'Please fill all the fields'))
        }
        const id = uuid.v4()
        const timestamp = new Date().toISOString()
        const image = await uploadImage(req.file.buffer, id)
        const query = 'insert into aicte.events (id,name,description,caption,status,from_date,to_date,time,image,createdat,updatedat) values (?,?,?,?,?,?,?,?,?,?,?)'
        const data = (await db.execute(query,[id,name,description,caption,status,from_date,to_date,time,image,timestamp,timestamp])).rows[0]
        return res.status(200).json(Response(200, 'Success', data))
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(Response(500, 'Error', error))
    }
});

// update venue details
app.put('/events/:id', async (req, res) => {
    try {
        let { name,email,phone,state,city,address,pincode,capacity,website } = req.body
        if (!(name &&  email &&  phone && state && city && address && pincode && capacity)){
            return res.status(400).json(Response(400, 'Bad Request', 'Please fill all the fields'))
        }
        website = website ? website : ''
        const timestamp = new Date().toISOString()
        const update_venue = `update aicte.events set name = ?,email = ?,phone = ?,state = ?,city = ?,address = ?,pincode = ?,capacity = ?,website = ?,updatedAt = ? where id = ?`
        await db.execute(update_venue,[name, email,phone,state,city,address,pincode,capacity,website,timestamp,req.params.id])
        return res.json(Response(200, 'Success', "Venue updated successfully"))
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