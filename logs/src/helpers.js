const { Kafka } = require("kafkajs");

// kafka config 
const kafka = new Kafka({
    clientId: "aicte_logs",
    brokers: [process.env.KAFKA_BROKER],
});
// kafka prodecer 
const producer = kafka.producer();
// kafka consumer 
const consumer = kafka.consumer({ groupId: "aicte_logs" });

function Response(status=200,message="success",data=[]){
    return {status,message,data};
}

module.exports = {Response,producer,consumer};