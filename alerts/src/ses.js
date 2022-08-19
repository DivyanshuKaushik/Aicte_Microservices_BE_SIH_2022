const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const ses = new AWS.SES();

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
module.exports = {send_email,mass_mailer}