'use strict';
const express = require('express');
const uuid = require('uuid');
const bcrypt = require('bcryptjs')
const {check,validationResult} = require('express-validator')
const { connectDB,db } = require('./db');
const { Response, alertProducer,logProducer } = require('./helpers');

// connect to aws keyspaces 
connectDB()

// connect to kafka producers 
async function connectProducers() {
    try{
        await alertProducer.connect();
        await logProducer.connect()
        console.log("producer_connected");
    }catch(err){
        console.log(err);
    }
}
connectProducers();

const app = express();

// parse req body as json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes for auth

// get all users 
app.get('/users', async(req, res) => {
    const {department} = req.query
    // get users by department 
    if(department){
        const query = 'select * from aicte.users where department = ? allow filtering' 
        const data = (await db.execute(query,[department])).rows 
        // console.log(data);
        return res.status(200).json(Response(200, 'Success', data))
    }
    const query = 'select * from aicte.users'
    const data = (await db.execute(query,[])).rows 
    return res.status(200).json(Response(200, 'Success', data))
});

// get user 
app.get('/users/:id', async(req, res) => {
    const query = 'select * from aicte.users where id = ?'
    const data = (await db.execute(query,[req.params.id])).rows[0]
    res.status(200).json(Response(200, 'Success', data))
});

// get user by org 
app.get('/users/org/:id', async(req, res) => {
    try{
        const query = 'select * from aicte.users where org_id = ? allow filtering'
        const data = (await db.execute(query,[req.params.id])).rows
        res.status(200).json(Response(200, 'Success', data))

    }catch(err){
        console.log(err);
        res.status(500).json(Response(500, 'Error', err))
    }
})

// update profile image 
app.put('/users/profile/:id',async (req,res)=>{
    try{
        const { image } = req.body
        const query = 'update aicte.users set image = ? where id = ?'
        await db.execute(query,[image,req.params.id])
        res.status(200).json(Response(200, 'Success', "User profile updated successfully"))
    }catch(error){
        res.status(500).json(Response(500, 'Error', error))
    }
})

app.post('/users/login',async(req, res) => {
    try{
        const { email, password } = req.body;
        const query = 'select * from aicte.users where email = ? allow filtering'
        const data = (await db.execute(query,[email])).rows[0]
        if(!data){
            return res.status(400).json(Response(400, 'Bad request', 'User not found'))
        }
        const isMatch = await bcrypt.compare(password, data.password)
        if(!isMatch){
            return res.status(400).json(Response(400, 'Bad request', 'Invalid Credentials'))
        }
        return res.status(200).json(Response(200, 'Success', data))
    }catch(err){
        res.status(500).json(Response(500, 'Error', err))
    }
})

// register new user 
app.post('/users',[check('email',"Enter valid Email!").notEmpty().isEmail(),check("password",'Enter valid password').notEmpty()], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(Response(400, 'Bad request', errors.array()));
    }
    // const user = JSON.parse(req.headers.user)
    // const log = {
    //     type:"event_register",
    //     message:"",
    //     user_id:user.id,
    //     user_name:user.name
    // }
    try{
        let { name, email, password,phone,role,department,org_id,org_name } = req.body
        const unhashedPassword = password;
        if(password.length < 8){
            return res.status(400).json(Response(400, 'Bad Request', 'Password must be atleast 8 characters long'))
        }
        if (!(name &&  email &&  password && phone && role && department && org_id && org_name)) {
            return res.status(400).json(Response(400, 'Bad Request', 'Please fill all the fields'))
        }
        const findUser = "select * from aicte.users where email = ? allow filtering"
        const existing_user = await db.execute(findUser,[email])
        if (existing_user.rows.length){
            return res.status(400).json(Response(400, 'Bad Request', 'User already exists'))
        }
        const id = uuid.v4()
        password = await bcrypt.hash(password,12)
        const timestamp = new Date().toISOString()
        const save_user = `insert into aicte.users (id,name,email,phone,role,password,department,org_id,org_name,createdat,updatedat) values (?,?,?,?,?,?,?,?,?,?,?)`
        await db.execute(save_user,[id,name, email,phone,role,password,department,org_id,org_name,timestamp,timestamp])
        // send mail to user 
        await alertProducer.send({
            topic: 'alert',
            messages: [{value: JSON.stringify({
                email,
                subject:`Welcome to AICTE Portal ${org_name==="aicte" ? "." : "for " + org_name}`,
                text:`You have been registered to AICTE Portal. Please login to continue using credentials email: ${email} password:${unhashedPassword} Thank you.`
            })}]
        })
        // send notification 
        // await logProducer.send({
        //     topic:"notify",
        //     messages:[{value:JSON.stringify({
        //         user_id:id,
        //         message:`Welcome to AICTE Event Management Portal`
        //     })}]
        // })
        // log.message = `created new user ${name}`
        res.json(Response(200, 'Success', { id, name, email, password,phone,role,department,org_id,org_name,createdat:timestamp,updatedat:timestamp }))

    }catch(err){
        console.log(err);
        // log.message = "failed to create new user"
        res.status(500).json(Response(500, 'Error', err))
    }
    // log to db using kafka producer
    // await logProducer.send({
    //     topic: "log",
    //     messages: [{value:JSON.stringify(log)}],
    // })
    // return;
});
function generatePassword() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}
// create org user 
app.post('/users/org',[check('email',"Enter valid Email!").notEmpty().isEmail()], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(Response(400, 'Bad request', errors.array()));
    }
    const user = JSON.parse(req.headers.user)
    const log = {
        type:"user_register",
        message:"",
        user_id:user.id,
        user_name:user.name
    }
    try{
        const { name, org_name,email ,phone } = req.body
        if (!(name &&  email && phone)) {
            return res.status(400).json(Response(400, 'Bad Request', 'Please fill all the fields'))
        }
        const findUser = "select * from aicte.users where email = ? allow filtering"
        const existing_user = await db.execute(findUser,[email])
        if (existing_user.rows.length){
            return res.status(400).json(Response(400, 'Bad Request', 'User already exists'))
        }
        let password = generatePassword()
        const unhashedPassword = password;
        const id = uuid.v4()
        password = await bcrypt.hash(password,12)
        const role = 'poc'
        const timestamp = new Date().toISOString()
        const save_user = `insert into aicte.users (id,name,email,phone,role,password,org_id,org_name,createdat,updatedat) values (?,?,?,?,?,?,?,?,?,?)`
        await db.execute(save_user,[id,name, email,phone,role,password,id,org_name,timestamp,timestamp])
        // send mail to user 
        await alertProducer.send({
            topic: 'alert',
            messages: [{value: JSON.stringify({
                email,
                subject:`Welcome to AICTE Portal for ${org_name}`,
                text:`You have been registered to AICTE Portal. Please login to continue using credentials email: ${email} password:${unhashedPassword} Thank you.`
            })}]
        })
        // send notification 
        await logProducer.send({
            topic:"notify",
            messages:[{value:JSON.stringify({
                user_id:id,
                message:`Welcome to AICTE Event Management Portal`
            })}]
        })
        log.message = `created new user ${name}`
        res.json(Response(200, 'Success', { id, name, email, password,phone,role,department,org_id,org_name,createdat:timestamp,updatedat:timestamp }))

    }catch(err){
        console.log(err);
        log.message = "failed to create new user"
        res.status(500).json(Response(500, 'Error', err))
    }
    // log to db using kafka producer
    await logProducer.send({
        topic: "log",
        messages: [{value:JSON.stringify(log)}],
    })
    return;
});
// create mass users 
app.post('/createMassUsers',async(req,res)=>{
    try{
        const users = JSON.parse(req.body.users)
        for(let i = 0; i < users.length; i++){
            const {name, email,phone,role,department,org_id,org_name} = users[i]
            if(!(name &&  email &&  phone && role && department && org_id && org_name)){
                continue
            }
            const id = uuid.v4()
            let password = generatePassword()
            const unhashedPassword = password;
            password = await bcrypt.hash(password,12)
            const findUser = "select * from aicte.users where email = ? allow filtering"
            const existing_user = await db.execute(findUser,[email])
            if (existing_user.rows.length){
                continue;
            }
            const timestamp = new Date().toISOString()
            const save_user = `insert into aicte.users (id,name,email,phone,role,password,department,org_id,org_name,createdat,updatedat) values (?,?,?,?,?,?,?,?,?,?,?)`
            await db.execute(save_user,[id,name, email,phone,role,password,department,org_id,org_name,timestamp,timestamp])
            // send mail to user 
            await alertProducer.send({
                topic: 'alert',
                messages: [{value: JSON.stringify({
                    email,
                    subject:`Welcome to AICTE Portal for ${org_name}`,
                    text:`You have been registered to AICTE Portal. Please login to continue using credentials email: ${email} password:${unhashedPassword} Thank you.`
                })}]
            })
            // send notification 
            await logProducer.send({
                topic:"notify",
                messages:[{value:JSON.stringify({
                    user_id:id,
                    message:`Welcome to AICTE Event Management Portal`
                })}]
            })
        }
        res.json(Response(200, 'Success', 'Users created successfully'))
    }catch(err){
        res.status(500).json(Response(500, 'Error', err))
    }
})

// update user details 
app.put('/users/:id', async(req, res) => {
    try{
        let { name, email,phone,role,department } = req.body
        if (!(name &&  email  && phone && role && department)){
            return res.status(400).json(Response(400, 'Bad Request', 'Please fill all the fields'))
        }
        const id = req.params.id
        const timestamp = new Date().toISOString()
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
        const timestamp = new Date().toISOString()
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