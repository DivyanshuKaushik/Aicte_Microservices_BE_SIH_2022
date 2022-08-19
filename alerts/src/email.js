const { consumer } = require("./helpers");
const { send_email, mass_mailer } = require("./ses");

// connect consumer 
async function connnecConsumer() {
    await consumer.connect();
    console.log("consumer_connected");
}
connnecConsumer();

// alert mail consumer 
async function consume_alert() {
    await consumer.subscribe({ topics: ["alert","mass_mail"], fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const { value } = message;
            const { email,subject,text} = JSON.parse(value);
            switch (topic) {
                case "alert":
                    console.log(email,topic);
                    // console.log(email,subject,text);
                    // await send_email(email,subject,text);
                    return;
                case "mass_mail":
                    console.log(email,topic);
                    return;
                default:
                    return;

            }
        }
    });
}
consume_alert()

// mass mail consumer 
async function consume_massmail() {
    await consumer.subscribe({ topic: "mass_mail", fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const { value } = message;
            const { email,subject,text} = JSON.parse(value);
            console.log(email,topic);
        }
    });
}
// consume_massmail()
    
const emails = ["ddspidy@gmail.com","divyanshukaushik44@gmail.com","techxos.hosting@gmail.com"]
async function consume() {

    await consumer.connect();
    console.log("consumer_connected");
    await consumer.subscribe({ topic: "auth" });
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log("consuming");
            // console.log(topic);
            // console.log(JSON.parse(message.value.toString()));
            console.log(message.value.toString());
            // await mass_mailer(emails,"Test Email from aicte backend",message.value.toString());
        }
    });

}
// consume();

// async function sendemail(){
//     const data = await send_email("ddspidy@gmail.com","aicte.envision.alpha@gmail.com","test","test");
// }
// sendemail();
