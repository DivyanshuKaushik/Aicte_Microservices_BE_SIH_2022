const { RESTDataSource } = require('apollo-datasource-rest');

class socialsAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'http://socials:4000';
    }
    willSendRequest(req) {
        req.headers.set("user",JSON.stringify(this.context.req.user));
    }

    async fbGetLongLivedAccessToken(shortlivedaccesstoken) {
        try {
            return await this.post('/getlonglivedaccesstoken',shortlivedaccesstoken);
        } catch (error) {
            throw Error(JSON.stringify(error.extensions.response.body))
        }
    }
    async fbGetUserPages(longlivedaccesstoken){
        try {
            return await this.get(`/getuserpages/${longlivedaccesstoken}`);
        } catch (error) {
            throw Error(JSON.stringify(error.extensions.response.body))
        }
    }
    async fbPageData(data){
        try {
            return await this.post(`/pagedata/${data.id}`,data)
        } catch (error) {
            throw Error(JSON.stringify(error.extensions.response.body))
        }
    }
    async fbUploadPost(data){
        try {
            return await this.post(`/uploadpost`,data)
        } catch (error) {
            throw Error(JSON.stringify(error.extensions.response.body))
        }
    }

    async twCreateTweet(data){
        try {
            return await this.post(`/twitter/createtweet`,data)
        } catch (error) {
            throw Error(JSON.stringify(error.extensions.response.body))
        }
    }

    async twOauth2(data){
        try {
            return await this.post(`/twitter/oauth2`,data)
        } catch (error) {
            throw Error(JSON.stringify(error.extensions.response.body))
        }
    }

    async twOauth1(){
        try {
            return await this.get(`/twitter/oauth1`);
        } catch (error) {
            throw Error(JSON.stringify(error.extensions.response.body))
        }
    }
    async twGetUserDetails(userid){
        try {
            return await this.get(`/twitter/getuserdetails/${userid}`);
        } catch (error) {
            throw Error(JSON.stringify(error.extensions.response.body))
        }
    }
    async getHashtags(image){
        try {
            return await this.get(`/hashtags`,image)
        } catch (error) {
            throw Error(JSON.stringify(error.extensions.response.body))
        }
    }

}
module.exports = socialsAPI;