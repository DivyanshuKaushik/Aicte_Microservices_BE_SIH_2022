const { consumer } = require("./helpers");
const { send_email, mass_mailer } = require("./ses");

// connect consumer 
async function connectConsumer() {
    await consumer.connect();
    console.log("consumer_connected");
}

// alert mail consumer 
async function consume_alert() {
    await consumer.subscribe({ topics: ["alert","mass_mail"], fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const { value } = message;
            const { email,subject,text} = JSON.parse(value);
            switch (topic) {
                case "alert":
                    // console.log(email,subject,text,topic);
                    await send_email(email,subject,text);
                    return;
                case "mass_mail":
                    // console.log(email,topic);
                    await mass_mailer(email,subject,text);
                    return;
                default:
                    return;

            }
        }
    });
}
module.exports = {connectConsumer,consume_alert};