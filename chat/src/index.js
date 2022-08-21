"use strict";
const express = require("express");
const mongoose = require("mongoose");
const { Response, alertProducer, logProducer } = require("./helpers");

const app = express();

// parse req body as json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// // connect to kafka producers
// async function connectProducers() {
//     await alertProducer.connect();
//     await logProducer.connect();
//     console.log("producer_connected");
// }
// connectProducers();

// connect to mongo db
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("mongo_connected"))
    .catch((err) => console.log(err));

// mongo model for chats
const chatSchema = new mongoose.Schema({
  from_user: { type: String, required: true },
  to_user: { type: String, required: true },
  by_user: { type: String, required: true },
  message: { type: String, required: true },
},{ timestamps: true });

const Chat = mongoose.model("Chat", chatSchema);

const commonChatSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    user_name: { type: String, required: true },
    user_email: { type: String, required: true },
    message: { type: String, required: true },
},{ timestamps: true });

const CommonChat = mongoose.model("CommonChat", commonChatSchema);

// model for chat inbox 
const chatInboxSchema = new mongoose.Schema({
    user1: { type: String, required: true },
    user2: { type: String, required: true },
    user1_name: { type: String, required: true },
    user2_name: { type: String, required: true },
    lastmessage: { type: String, required: true },
},{ timestamps: true });
const ChatInbox = mongoose.model("ChatInbox", chatInboxSchema);
// routes for chats

// get inbox
app.get('/inbox',async(req,res)=>{
    try{
        const user = JSON.parse(req.headers.user);
        const inbox = await ChatInbox.find({$or:[{user1:user.id},{user2:user.id}]}).sort({updatedAt:-1});
        return res.status(200).json(Response(200,"success",inbox));
    }catch(err){
        return res.status(500).json(Response(500, "Error", error));
    }
})
// send message
app.post("/sendMessage", async (req, res) => {
    try {
        const user = JSON.parse(req.headers.user);
        const { to, message ,to_name} = req.body;
        if (user.id == to) {
            return res
                .status(400)
                .json(
                    Response(
                        400,
                        "Error",
                        "You cannot send message to yourself"
                    )
                );
        }
        const inbox = await ChatInbox.findOne({
            $or: [{ user1: user.id, user2: to }, { user1: to, user2: user.id }],
        });
        // update message in inbox or create inbox if not exists
        if(inbox){
            await ChatInbox.findByIdAndUpdate(inbox._id, {lastmessage:message});
        }else{
            const chatInbox = new ChatInbox({
                user1: user.id,
                user2: to,
                user1_name: user.name,
                user2_name: to_name,
                lastmessage: message,
            });
            await chatInbox.save();
        } 
        const chat = new Chat({
            from_user: user.id,
            to_user: to,
            by_user: user.id,
            message: message,
        });
        await chat.save()
        return res
            .status(200)
            .json(Response(200, "Success", "Sent successfully"));
    } catch (error) {
        return res.status(500).json(Response(500, "Error", error));
    }
});
// chat for everyone 
app.post('/commonChat', async (req, res) => {
    try {
        const user = JSON.parse(req.headers.user);
        const { message } = req.body;
        const chat = new CommonChat({
            user_id: user.id,
            user_name: user.name,
            user_email: user.email,
            message: message,
        });
        await chat.save()
        return res
            .status(200)
            .json(Response(200, "Success", "Sent successfully"));
    } catch (error) {
        return res.status(500).json(Response(500, "Error", error));
    }
})
// get all messages
app.get('/commonChats', async (req, res) => {
    try {
        const chats = await CommonChat.find();
        return res
            .status(200)
            .json(Response(200, "Success", chats));
    } catch (error) {
        return res.status(500).json(Response(500, "Error", error));
    }
})

// get messages
app.get("/getMessages/:seconduser", async (req, res) => {
    try {
        const user = JSON.parse(req.headers.user);
        const seconduser = req.params.seconduser;
        const data = await Chat.find({
            $or: [
                { $and: [{ from_user: user.id }, { to_user: seconduser }] },
                { $and: [{ from_user: seconduser }, { to_user: user.id }] },
            ],
        });
        return res.status(200).json(Response(200, "Success", data));
    } catch (error) {
        return res.status(500).json(Response(500, "Error", error));
    }
});

app.listen(process.env.PORT);

console.log(`Chats Server Up!!`);
