const express = require('express');
const axios = require('axios');
const { Response, alertProducer, logProducer } = require('./helpers');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// for parsing multipart/form-data

// connect to kafka producers 
async function connectProducers() {
    try{
        await alertProducer.connect();
        await logProducer.connect();
        console.log("producer_connected");
    }catch(err){
        console.log(err);
    }
}
connectProducers();


// Short-lived User access tokens are valid for one hour.
// Long-lived User access tokens are valid for 60 days.
// Short-lived Page access tokens are valid for one hour.
// Long-lived Page access tokens are have no expiration date.
const appid = process.env.FACEBOOK_APP_ID
const appsecret = process.env.FACEBOOK_APP_SECRET
const bearer_token =  process.env.BEARER_TOKEN

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
    const user = JSON.parse(req.headers.user)
    const log = {
        type:"social",
        message:"",
        user_id:user.id,
        user_name:user.name
    }
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
            log.message = "Posted to facebook"
            res.json(Response(200, "success", JSON.stringify(data)))

        } else if (url && caption) {
            const data = await axios
                .post(
                    `https://graph.facebook.com/v14.0/${pageid}/photos?url=${url}&message=${caption}&access_token=${pageaccesstoken}`
                )
                .then((res) => { return res.data })
            log.message = "Posted to facebook"
            res.json(Response(200, "success", JSON.stringify(data)))

        } else if (!url && caption) {
            const data = await axios
                .post(
                    `https://graph.facebook.com/v14.0/${pageid}/feed?message=${caption}&access_token=${pageaccesstoken}`
                )
                .then((res) => { return res.data })
            log.message = "Posted to facebook"
            res.json(Response(200, "success", JSON.stringify(data)))

        } else {
            log.message = "Failed to post in facebook"
            res.json(Response(422, "Error", JSON.stringify({ message: "Please enter a url or caption" })))

        }
    } catch (err) {
        log.message = "Failed to post in facebook"
        res.status(500).json(Response(500, 'Error', err))
    }
    // log to db using kafka producer
    await logProducer.send({
        topic: "log",
        messages: [{value:JSON.stringify(log)}],
    })
    return;
})



app.get('/twitter/getuserdetails/:id',async(req,res)=>{
    try {
        const id = req.params.id
        const user = await axios.get(`https://api.twitter.com/2/users?ids=${id}&user.fields=created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld&expansions=pinned_tweet_id&tweet.fields=attachments,author_id,context_annotations,conversation_id,created_at,entities,geo,id,in_reply_to_user_id,lang,non_public_metrics,organic_metrics,possibly_sensitive,promoted_metrics,public_metrics,referenced_tweets,reply_settings,source,text,withheld`, {
            headers: {
                Authorization: `Bearer ${bearer_token}`
            }
        }).then((res) => { return res.data })
        const followers = await axios.get(`https://api.twitter.com/2/users/${id}/followers`, {
            headers: {
                Authorization: `Bearer ${bearer_token}`
            }
        }).then((res) => { return res.data })


        const following = await axios.get(`https://api.twitter.com/2/users/${id}/following`, {
            headers: {
                Authorization: `Bearer ${bearer_token}`
            }
        }).then((res) => { return res.data })
        const timeline = await axios.get(`https://api.twitter.com/2/users/${id}/tweets?expansions=attachments.poll_ids,attachments.media_keys,author_id,geo.place_id,in_reply_to_user_id,referenced_tweets.id,entities.mentions.username,referenced_tweets.id.author_id&tweet.fields=attachments,author_id,context_annotations,conversation_id,created_at,entities,geo,id,in_reply_to_user_id,lang,possibly_sensitive,public_metrics,referenced_tweets,reply_settings,source,text,withheld&user.fields=created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld&media.fields=duration_ms,height,media_key,organic_metrics,preview_image_url,promoted_metrics,public_metrics,type,url,width&place.fields=contained_within,country,country_code,full_name,geo,id,name,place_type&poll.fields=duration_minutes,end_datetime,id,options,voting_status`, {
            headers: {
                Authorization: `Bearer ${bearer_token}`
            }
        }).then((res) => { return res.data })
        const mentions = await axios.get(`https://api.twitter.com/2/users/${id}/mentions?expansions=attachments.poll_ids,attachments.media_keys,author_id,geo.place_id,in_reply_to_user_id,referenced_tweets.id,entities.mentions.username,referenced_tweets.id.author_id&tweet.fields=attachments,author_id,context_annotations,conversation_id,created_at,entities,geo,id,in_reply_to_user_id,lang,possibly_sensitive,public_metrics,referenced_tweets,reply_settings,source,text,withheld&user.fields=created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld&media.fields=duration_ms,height,media_key,organic_metrics,preview_image_url,promoted_metrics,public_metrics,type,url,width&place.fields=contained_within,country,country_code,full_name,geo,id,name,place_type&poll.fields=duration_minutes,end_datetime,id,options,voting_status`, {
            headers: {
                Authorization: `Bearer ${bearer_token}`
            }
        }).then((res) => { return res.data })


        const data = { user,followers,following,timeline , mentions}
        return res.json(Response(200,"success",JSON.stringify(data)))
    } catch (error) {
        return res.status(500).json(Response(500, 'Error', err))
    }
})


app.get('/twitter/oauth1',async(req,res)=>{
    try {
        var config = {
            method: 'post',
            url: 'https://api.twitter.com/oauth/request_token?oauth_consumer_key=FWMrpUyDPqytfKmKgALcOIwIO&oauth_signature_method=HMAC-SHA1&oauth_timestamp=1661407847&oauth_nonce=t9hMopGUkw4&oauth_version=1.0&oauth_signature=UQ%2BjzQsTS2cDMdgta1LElNLoYLM%3D',
            headers: { 
              'Cookie': 'guest_id=v1%3A166080890446027164; guest_id_ads=v1%3A166080890446027164; guest_id_marketing=v1%3A166080890446027164; personalization_id="v1_V1dSLbAwLmw/L+5ExL+NWA=="'
            }
          };

        const result = await axios(config)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                console.log(error);
                return JSON.stringify(error)
            });


        const splitdata = result.split("&")

        oauth_token = splitdata[0].split("=")[1]
        oauth_token_secret = splitdata[1].split("=")[1]
        const data = { result, oauth_token, oauth_token_secret }
        return res.json(Response(200, "success", JSON.stringify(data)))
    } catch (error) {
        console.log(error);
        return res.status(500).json(Response(500, 'Error', err))
    }
})


app.post('/twitter/oauth2',async(req,res)=>{
    try {
        const oauth_token = req.body.oauthtoken
        const oauth_verifier = req.body.oauthverifier
        var config = {
            method: 'post',
            url: `https://api.twitter.com/oauth/access_token?oauth_token=${oauth_token}&oauth_verifier=${oauth_verifier}`,
            headers: {
                'Authorization': `OAuth oauth_consumer_key="FWMrpUyDPqytfKmKgALcOIwIO",oauth_token=${oauth_token},oauth_signature_method="HMAC-SHA1",oauth_timestamp="1660859032",oauth_nonce="d0PfPhxlSmO",oauth_version="1.0",oauth_verifier=${oauth_verifier},oauth_signature="95%2FAu88cLeqrrWwJb9O3c4B%2FhK8%3D"`,
                'Cookie': '_twitter_sess=BAh7CSIKZmxhc2hJQzonQWN0aW9uQ29udHJvbGxlcjo6Rmxhc2g6OkZsYXNo%250ASGFzaHsABjoKQHVzZWR7ADoPY3JlYXRlZF9hdGwrCORvcLCCAToMY3NyZl9p%250AZCIlN2RiOTY3MTFmMzZlMjYzNTcxNjRhNDBjYzA1YTIwZjc6B2lkIiUxNzli%250ANzM5YjMyZWM2NjFmZWVhNjQxNzM2YTNjOGEwYw%253D%253D--41466ed8522b77ece776a3a1456bfccc6ed97a7d; guest_id=v1%3A166080890446027164; guest_id_ads=v1%3A166080890446027164; guest_id_marketing=v1%3A166080890446027164; personalization_id="v1_V1dSLbAwLmw/L+5ExL+NWA=="; lang=en'
            }
        };
        const data = await axios(config)
            .then(function (response) {
                console.log(response);
                return response.data;

            })
            .catch(function (error) {
                console.log(error);
            });

        return res.json(Response(200, "success", JSON.stringify(data)))
    } catch (error) {
        return res.status(500).json(Response(500, 'Error', err))
    }
})


app.post('/twitter/createtweet',async(req,res)=>{
    const user = JSON.parse(req.headers.user)
    const log = {
        type:"social",
        message:"",
        user_id:user.id,
        user_name:user.name
    }
    try {
        const text = req.body.text
        const mediaids = req.body.mediaids
        const oauth_token = req.body.twitter_oauth_token
        const oauth_verifier = req.body.twitter_oauth_verifier
        var input
        if (mediaids && mediaids.length > 0) {
            input = JSON.stringify({
                "text": text,
                "media": {
                    "media_ids": mediaids
                }
            });
        } else {
            input = JSON.stringify({
                "text": text,
            });
        }

        var config = {
            method: 'post',
            url: 'https://api.twitter.com/2/tweets',
            headers: {
                'Authorization': `OAuth oauth_consumer_key="FWMrpUyDPqytfKmKgALcOIwIO",oauth_token=${oauth_token},oauth_signature_method="HMAC-SHA1",oauth_timestamp="1660860939",oauth_nonce="7ggTwFTnSKq",oauth_version="1.0",oauth_verifier=${oauth_verifier},oauth_signature="APTlLxhgksI4CB3ewWFG9dogJgg%3D"`,
                'Content-Type': 'application/json',
                'Cookie': 'guest_id=v1%3A166080890446027164; guest_id_ads=v1%3A166080890446027164; guest_id_marketing=v1%3A166080890446027164; personalization_id="v1_V1dSLbAwLmw/L+5ExL+NWA=="'
            },
            data: input
        };
        const data = await axios(config).then((res) => { return res.data })
        log.message = "Tweet created successfully"
        res.json(Response(200, "success", JSON.stringify(data)))
    } catch (error) {
        log.message = "Failed to tweet"
        res.status(500).json(Response(500, 'Error', err))
    }
    // log to db using kafka producer
    await logProducer.send({
        topic: "log",
        messages: [{value:JSON.stringify(log)}],
    })
    return;
})



app.listen(process.env.PORT)
console.log("Socials Server Up!");