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
}
module.exports = socialsAPI;