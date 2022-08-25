const { Kafka } = require("kafkajs");

// kafka config 
const kafka_alerts = new Kafka({
    clientId: "aicte_alerts",
    brokers: [process.env.KAFKA_BROKER],
});
const kafka_logs = new Kafka({
    clientId: "aicte_logs",
    brokers: [process.env.KAFKA_BROKER],
});
// kafka prodecer 
const alertProducer = kafka_alerts.producer();
const logProducer = kafka_logs.producer();

function Response(status=200,message="success",data=[]){
    return {status,message,data};
}

module.exports = {Response,alertProducer,logProducer};