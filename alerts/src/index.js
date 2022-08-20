'use strict';
const express = require('express');
const { Response } = require('./helpers');
const { mass_mailer } = require('./ses');
const { connectConsumer, consume_alert } = require('./email');
const app = express();

// parse req body as json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// connect to kafka consumer 
connectConsumer();
// run email consumers 
consume_alert();

// mass mailer routes 
app.post("/massMailer", async (req, res) => {
    try {
        const { emails,subject,text } = req.body;
        // send mail to every invited user using kafka producer
        // if invites are more than 50 then send mail in batches of 50
        if (emails.length > 50) {
            const batches = Math.ceil(emails.length/50)
            for (let i = 0; i < batches; i++) {
                // slice emails array into batches of 50 
                let batch;
                if((i+1)*50 > emails.length)
                    batch = emails.slice(i*50,emails.length)
                else
                    batch = emails.slice(i*50,(i+1)*50)

                // send mail to batch of emails
                await mass_mailer(batch,subject,text);
            }
        }else{
            await mass_mailer(emails,subject,text);
        }
        return res.status(200).json(Response(200, "Success", "Sent mail to all users"));
    } catch (error) {
        return res.status(500).json(Response(500, "Error", error));
    }
}),

app.listen(process.env.PORT);

console.log(`Alerts Server Up!!`);