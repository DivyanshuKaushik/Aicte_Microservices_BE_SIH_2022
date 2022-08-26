const { RESTDataSource } = require('apollo-datasource-rest');

class chatAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'http://chat:4000';
  }
  willSendRequest(req) {
    req.headers.set("user",JSON.stringify(this.context.req.user));
  }

  async getMessages(seconduser) {
    try{
      return await this.get(`/getMessages/${seconduser}`);
    }catch(err){
      throw new Error(JSON.stringify(err))
    }
  }

  async sendMessage(data) {
    try {
      return await this.post(`/sendMessage`,data)
    } catch (error) {
      throw Error(JSON.stringify(error))
    }
  }
  async sendCommonMessage(data) {
    try {
      return await this.post(`/commonChat`,data)
    } catch (error) {
      console.log("data",error);
      throw Error(JSON.stringify(error))
    }
  }
  async getCommonMessages() {
    try{
      return await this.get(`/commonChats`);
    }catch(err){
      throw new Error(JSON.stringify(err))
    }
  }
  async getInbox() {
    try{
      return await this.get(`/inbox`);
    }catch(err){
      throw new Error(JSON.stringify(err))
    }
  }
  
}
module.exports = chatAPI;