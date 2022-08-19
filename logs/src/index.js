const { connectDB, db } = require("./db");
const { consumer } = require("./helpers");

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
            const timestamp = new Date().toISOString();
            console.log(log,timestamp);
            const query = 'insert into aicte.logs (type,message,user_id,user_name,timestamp) values (?,?,?,?,?)';
            await db.execute(query,[log.type,log.message,log.user_id,log.user_name,timestamp]);
        }
    });
}
logs()