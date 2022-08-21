const AWS = require('aws-sdk');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

AWS.config.update({
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const ses = new AWS.SES();

// sns config for sms
const sns = new AWS.SNS();

const send_sms = (phone,message)=>{
    return new Promise(async(resolve,reject)=>{
        // +13202442539
        try{
            phone = "+91"+phone;
            const params = {
                Message: message + " sns",
                PhoneNumber: phone,
            };
            const res = await sns.publish(params).promise();
            console.log("ses",res);
            client.messages
            .create({
            body: message,
            from: '+13202442539',
            to: phone
            })
            .then(message => console.log(message.sid));
            return resolve(res)

        }catch(error){
            return reject(error)
        }
    }
)}

const send_email = (to,subject,text)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            const params = {
                Destination: {
                    ToAddresses: [to],
                },
                Message: {
                    Body: {
                        Text: { Data: text },
                    },
                    Subject: { Data: subject },
                },
                Source: process.env.SOURCE_EMAIL,
            };
            const res = await ses.sendEmail(params).promise();
            return resolve({message:"Email sent Successfully!",res})
        }catch(error){
            return reject(error)
        }
    })
}
const mass_mailer = (emails,subject,text)=>{
    return new Promise(async(resolve,reject)=>{
        try{
            const params = {
                Destination: {
                    ToAddresses: emails,
                },
                Message: {
                    Body: {
                        Text: { Data: text },
                    },
                    Subject: { Data: subject },
                },
                Source: process.env.SOURCE_EMAIL,
            };
            const res = await ses.sendEmail(params).promise();
            return resolve({message:"Email sent Successfully!",res})
        }catch(error){
            return reject(error)
        }
    })
}
module.exports = {send_email,mass_mailer,send_sms}