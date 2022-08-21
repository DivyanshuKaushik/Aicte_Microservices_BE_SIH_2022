const express = require('express');
const uuid = require('uuid');
const { connectDB, db } = require("./db");
const { consumer, Response } = require("./helpers");

const app = express();

// parse req body as json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// connect to database
connectDB();

// connect to kafka consumer 
async function connectConsumer(){
    try{
        await consumer.connect();
        console.log("consumer_connected");
    }catch(err){
        console.log(err);
    }
}
connectConsumer();

// consume logs
async function logs(){
    console.log("logging activities");
    await consumer.subscribe({ topic: "log", fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const log = JSON.parse(message.value.toString());
            console.log(log)
            const timestamp = new Date().toISOString();
            const query = 'insert into aicte.logs (id,type,message,user_id,user_name,timestamp) values (?,?,?,?,?,?)';
            await db.execute(query,[uuid.v4(),log.type,log.message,log.user_id,log.user_name,timestamp]);
        }
    });
}
logs()

app.get('/logs', async(req, res) => {
    try{
        const {year,month,day} = req.query;
        const query = 'select * from aicte.logs';
        const data = (await db.execute(query,[])).rows 
        let logs;
        if(year && month && day){
            logs = data.filter(log => log.timestamp.split('T')[0] === `${year}-${month}-${day}`)
        }else if(year && month){
            logs = data.filter(log => log.timestamp.split('T')[0].split('-')[1] === `${month}` && log.timestamp.split('T')[0].split('-')[0] === `${year}`)
        }else if(year){
            logs = data.filter(log => log.timestamp.split('T')[0].split('-')[0] === `${year}`)
        }else{  
            logs = data
        }
        logs = logs.sort(function(x, y){
            return new Date(y.timestamp).getTime() - new Date(x.timestamp).getTime();
        })
        // console.log(logs);
        return res.status(200).json(Response(200, 'Success', logs))
    }catch(error){
        console.log(error);
        return res.status(500).json(Response(500, 'Error', error))
    }
})

app.listen(process.env.PORT)

console.log("Logs server up!");