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
    await consumer.subscribe({ topics: ["log","notify"], fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const timestamp = new Date().toISOString();
            const data = JSON.parse(message.value.toString());
            if(topic==="log"){
                const query = 'insert into aicte.logs (id,type,message,user_id,user_name,timestamp) values (?,?,?,?,?,?)';
                await db.execute(query,[uuid.v4(),data.type,data.message,data.user_id,data.user_name,timestamp]);
            }else if(topic==="notify"){
                const query = 'insert into aicte.notifications (id,message,user_id,createdat) values (?,?,?,?)';
                await db.execute(query,[uuid.v4(),data.message,data.user_id,timestamp]);
            }
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

app.get('/notifications/:id',async(req,res)=>{
    try {
        const {id} = req.params;
        const query = 'select * from aicte.notifications where user_id = ? allow filtering';
        const data = (await db.execute(query,[id])).rows;
        return res.status(200).json(Response(200, 'Success', data))
    } catch (error) {
        console.log(error);
        return res.status(500).json(Response(500, 'Error', error))
    }
})
app.listen(process.env.PORT)

console.log("Logs server up!");