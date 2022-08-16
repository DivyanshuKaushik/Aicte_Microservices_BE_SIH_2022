const AWS = require("aws-sdk");
console.log("kafkajs");
const { Kafka, Partitioners } = require("kafkajs");

const kafka = new Kafka({
    clientId: "aicte",
    brokers: ["kafka:9092"],
});

const producer = kafka.producer();
// const producer = kafka.producer({
//     allowAutoTopicCreation: false,
//     transactionTimeout: 30000,
//     createPartitioner: Partitioners.LegacyPartitioner
// });

async function produce() {
    await producer.connect();
    console.log("producer_connected");
    // await producer.send({
    //     topic: "auth",
    //     messages: [{ value: "Hello Kafka" }],
    // });
    // await producer.disconnect();
    // console.log("producer_disconnected");
}

produce();
// const kafka = require("kafka-node");
// const client = new kafka.KafkaClient({kafkaHost: "kafka:9092"});
// const producer = new kafka.HighLevelProducer(client);
// console.log("kafkanode");
// client.on('error', (error) => console.error('Kafka client error:', error));
// producer.on('error', (error) => console.error('Kafka producer error:', error));

// const payload = [{ topic: "test_topic", messages: "Test message"}]
// producer.on("ready", ()=> {
//     console.log("producer is ready");
//     producer.send(payload, function(error, result) {
//         console.log("Sending payload to Kafka");
//         if (error) {
//         console.log( "Sending payload failed: ", error);
//         } else {
//         console.log("Sending payload result:", result);
//         }
//     });
// }
// );
