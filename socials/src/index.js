const express = require('express');
const axios = require('axios');
const { Response } = require('./helpers');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// for parsing multipart/form-data


// Short-lived User access tokens are valid for one hour.
// Long-lived User access tokens are valid for 60 days.
// Short-lived Page access tokens are valid for one hour.
// Long-lived Page access tokens are have no expiration date.
const appid = process.env.FACEBOOK_APP_ID
const appsecret = process.env.FACEBOOK_APP_SECRET

// routes for app
app.post('/getlonglivedaccesstoken', async (req, res) => {
    try {
        const shortlivedaccesstoken = req.body.shortlivedaccesstoken
        // app id app secret from env
        // const data = await axios.get(`https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${appid}&client_secret=${appsecret}&fb_exchange_token=${shortlivedaccesstoken}`).then((res) => { return res.data }).catch((err) => { console.log(err) });
        const longlivedaccesstoken = await axios.get(`https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${appid}&client_secret=${appsecret}&fb_exchange_token=${shortlivedaccesstoken}`).then((res) => { return res.data })

        // const pageaccesstoken = await axios.get(`https://graph.facebook.com/${pageid}?fields=access_token&access_token=${longlivedaccesstoken}`).then((res) => { return res.data }).catch((err) => { console.log(err) });
        const data = {
            longlivedaccesstoken
        }
        return res.json(Response(200, "success", JSON.stringify(data)))
    } catch (err) {
        return res.status(500).json(Response(500, 'Error', err))
    }
})

app.get('/getuserpages/:longlivedaccesstoken', async (req, res) => {

    try {

        const longlivedaccesstoken = req.params.longlivedaccesstoken
        const data = await axios.get(`https://graph.facebook.com/v14.0/me?fields=accounts{access_token,category,cover,emails,id,link,username,picture{url,height,is_silhouette,cache_key,width},name},email,first_name,last_name,name_format,name,short_name,permissions{permission,status},picture{height,cache_key,is_silhouette,url,width}&access_token=${longlivedaccesstoken}`).then((res) => { return res.data })
        console.log(data);
        return res.json(Response(200, "success", JSON.stringify(data)))
    } catch (err) {
        return res.status(500).json(Response(500, 'Error', err))

    }
})


app.post('/pagedata/:id', async (req, res) => {
    try {
        const pageid = req.params.id
        const pageaccesstoken = req.body.pageaccesstoken
        const data = await axios.get(`https://graph.facebook.com/v14.0/${pageid}?fields=feed{created_time,from,full_picture,icon,id,message,message_tags,place,shares,story,story_tags,attachments{description,description_tags,media,media_type,title,type,subattachments,url,target},comments{attachment,comment_count,created_time,from,id,like_count,message,message_tags,reactions{name,type,username,pic,id},user_likes,likes{pic,name,username,id,link},comments{message,from},permalink_url},likes{pic,name,link,id,username},permalink_url,reactions{pic,name,type,id,link,username},properties,sharedposts,to{pic,username,name,link,id},status_type},access_token,can_post,category,category_list,followers_count,id,is_always_open,name,name_with_location_descriptor,page_token,unread_message_count,unread_notif_count,unseen_message_count,username,verification_status,website,conversations{id,link,can_reply,former_participants,is_subscribed,message_count,name,participants,senders,snippet,wallpaper,updated_time,unread_count,subject,messages{created_time,from,id,is_unsupported,sticker,message,story,tags,to,attachments{file_url,size,video_data,name,image_data,id,mime_type},thread_id},scoped_thread_key},picture{height,cache_key,is_silhouette,width,url},fan_count,photos{album,created_time,from,icon,images,link,name,likes{name,pic,link,id,username}},cover,about,emails,engagement,link,location,current_location,bio,birthday,phone&access_token=${pageaccesstoken}`).then((res) => { return res.data })
        return res.json(Response(200, "success", JSON.stringify(data)))
    } catch (err) {
        return res.status(500).json(Response(500, 'Error', err))

    }
})

app.post('/uploadpost', async (req, res) => {
    try {
        const url = req.body.url
        const caption = req.body.caption
        const pageid = req.body.pageid
        const pageaccesstoken = req.body.pageaccesstoken

        if (url && !caption) {
            const data = await axios
                .post(
                    `https://graph.facebook.com/v14.0/${pageid}/photos?url=${url}&access_token=${pageaccesstoken}`
                )
                .then((res) => { return res.data })
            return res.json(Response(200, "success", JSON.stringify(data)))

        } else if (url && caption) {
            const data = await axios
                .post(
                    `https://graph.facebook.com/v14.0/${pageid}/photos?url=${url}&message=${caption}&access_token=${pageaccesstoken}`
                )
                .then((res) => { return res.data })
            return res.json(Response(200, "success", JSON.stringify(data)))

        } else if (!url && caption) {
            const data = await axios
                .post(
                    `https://graph.facebook.com/v14.0/${pageid}/feed?message=${caption}&access_token=${pageaccesstoken}`
                )
                .then((res) => { return res.data })
            return res.json(Response(200, "success", JSON.stringify(data)))

        } else {
            return res.json(Response(422, "Error", JSON.stringify({ message: "Please enter a url or caption" })))

        }
    } catch (err) {
        return res.status(500).json(Response(500, 'Error', err))
    }
})

app.listen(process.env.PORT)
console.log("Socials Server Up!");