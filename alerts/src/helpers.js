const { Kafka } = require("kafkajs");

// kafka config 
const kafka = new Kafka({
    clientId: "aicte_alerts",
    brokers: [process.env.KAFKA_BROKER],
});
// kafka prodecer 
const producer = kafka.producer();
// kafka consumer 
const consumer = kafka.consumer({ groupId: "aicte_alerts" });

function Response(status=200,message="success",data=[]){
    return {status,message,data};
}

module.exports = {Response,producer,consumer};